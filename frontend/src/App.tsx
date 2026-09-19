import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AddTradeModal } from './components/modals/AddTradeModal';
import { PreSessionChecklistModal } from './components/modals/PreSessionChecklistModal';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardView } from './components/views/DashboardView';
import { RecoveryCalculatorView } from './components/views/RecoveryCalculatorView';
import { TradeHistoryView } from './components/views/TradeHistoryView';
import { DailyJournalView } from './components/views/DailyJournalView';
import { PlanView } from './components/views/PlanView';
import { PerformanceView } from './components/views/PerformanceView';
import { DisciplineView } from './components/views/DisciplineView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { AdminView } from './components/views/AdminView';

import type { NavigationTab, Trade, JournalSettings, DailyReview } from './types/journal';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredTrades,
  saveStoredTrades,
  getStoredDailyReviews,
  saveStoredDailyReviews,
  clearAllJournalData,
  DEFAULT_SETTINGS,
} from './utils/storage';
import {
  checkBackendHealth,
  fetchTradesApi,
  saveTradeApi,
  deleteTradeApi,
  fetchDailyReviewsApi,
  saveDailyReviewApi,
  fetchSettingsApi,
  saveSettingsApi,
  resetDatabaseApi,
  getCurrentUserApi,
  removeStoredToken,
} from './api/client';
import type { UserProfile } from './api/client';
import { computeJournalStats } from './utils/calculations';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [settings, setSettings] = useState<JournalSettings>(DEFAULT_SETTINGS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPreSessionModalOpen, setIsPreSessionModalOpen] = useState<boolean>(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  // Load authenticated user and sync user data from Express MongoDB Backend
  useEffect(() => {
    async function initUserAndData() {
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);

      if (isHealthy) {
        const currentUser = await getCurrentUserApi();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthModalOpen(false);
          if (currentUser.role === 'admin') setCurrentTab('admin');
          await loadUserData(currentUser);
        } else {
          setUser(null);
          setIsAuthModalOpen(true);
        }
      } else {
        // Even if offline/unreachable, enforce auth modal unless valid local token exists
        const currentUser = await getCurrentUserApi();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthModalOpen(false);
          if (currentUser.role === 'admin') setCurrentTab('admin');
          await loadUserData(currentUser);
        } else {
          setUser(null);
          setIsAuthModalOpen(true);
        }
      }
    }

    initUserAndData();
  }, []);

  const loadUserData = async (currentUserProfile?: UserProfile | null) => {
    const activeUser = currentUserProfile !== undefined ? currentUserProfile : user;
    try {
      const [serverSettings, serverTrades, serverReviews] = await Promise.all([
        fetchSettingsApi(),
        fetchTradesApi(),
        fetchDailyReviewsApi(),
      ]);
      if (serverSettings) {
        setSettings(serverSettings);
        saveStoredSettings(serverSettings, activeUser?.id);
      } else {
        const localSettings = getStoredSettings(activeUser?.id);
        setSettings(localSettings);
      }
      setTrades(serverTrades || getStoredTrades(activeUser?.id));
      setDailyReviews(serverReviews || getStoredDailyReviews(activeUser?.id));
    } catch (e) {
      console.warn('Backend user data sync error:', e);
      const localSettings = getStoredSettings(activeUser?.id);
      setSettings(localSettings);
      setTrades(getStoredTrades(activeUser?.id));
      setDailyReviews(getStoredDailyReviews(activeUser?.id));
    }
  };

  const handleLoginSuccess = async (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    if (authenticatedUser.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
    // Reset state completely before loading authenticated user data
    setTrades([]);
    setDailyReviews([]);
    setSettings(DEFAULT_SETTINGS);
    await loadUserData(authenticatedUser);
  };

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setTrades([]);
    setDailyReviews([]);
    setSettings(DEFAULT_SETTINGS);
    setIsAuthModalOpen(true);
  };

  const stats = computeJournalStats(trades, settings, dailyReviews);

  const tabTitles: Record<NavigationTab, string> = {
    dashboard: 'TradeVault Overview',
    calculator: 'Trade Recovery & Cycle Calculator',
    history: 'Trade Ledger',
    daily: 'Daily Review',
    plan: `${settings.planDurationDays}-Day Trading Plan`,
    performance: 'Performance Analytics',
    discipline: 'Discipline Audit',
    calendar: 'Monthly Calendar',
    settings: 'TradeVault Config',
    admin: 'Admin Desk - User Management',
  };

  const handleOpenAddTrade = () => {
    setTradeToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsAddModalOpen(true);
  };

  const handleSaveTrade = async (tradeData: Trade) => {
    let updatedTrades: Trade[] = [];
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === tradeData.id);
      if (exists) {
        updatedTrades = prev.map((t) => (t.id === tradeData.id ? tradeData : t));
      } else {
        updatedTrades = [tradeData, ...prev];
      }
      return updatedTrades;
    });

    saveStoredTrades(updatedTrades, user?.id);

    if (isBackendConnected && user) {
      try {
        await saveTradeApi(tradeData);
      } catch (e) {
        console.error('Failed to sync trade to MongoDB:', e);
      }
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade record?')) {
      const updated = trades.filter((t) => t.id !== id);
      setTrades(updated);
      saveStoredTrades(updated, user?.id);

      if (isBackendConnected && user) {
        try {
          await deleteTradeApi(id);
        } catch (e) {
          console.error('Failed to delete trade from MongoDB:', e);
        }
      }
    }
  };

  const handleSaveDailyReview = async (review: DailyReview) => {
    let updatedReviews: DailyReview[] = [];
    setDailyReviews((prev) => {
      const idx = prev.findIndex((r) => r.date === review.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = review;
        updatedReviews = next;
      } else {
        updatedReviews = [...prev, review];
      }
      return updatedReviews;
    });

    saveStoredDailyReviews(updatedReviews, user?.id);

    if (isBackendConnected && user) {
      try {
        await saveDailyReviewApi(review);
      } catch (e) {
        console.error('Failed to sync daily review to MongoDB:', e);
      }
    }
  };

  const handleSaveSettings = async (newSettings: JournalSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings, user?.id);

    if (isBackendConnected && user) {
      try {
        await saveSettingsApi(newSettings);
      } catch (e) {
        console.error('Failed to sync settings to MongoDB:', e);
      }
    }
  };

  const handleImportData = async (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) {
        setSettings(parsed.settings);
        saveStoredSettings(parsed.settings, user?.id);
        if (isBackendConnected && user) await saveSettingsApi(parsed.settings);
      }
      if (parsed.trades && Array.isArray(parsed.trades)) {
        setTrades(parsed.trades);
        saveStoredTrades(parsed.trades, user?.id);
        if (isBackendConnected && user) {
          for (const t of parsed.trades) await saveTradeApi(t);
        }
      }
      if (parsed.reviews && Array.isArray(parsed.reviews)) {
        setDailyReviews(parsed.reviews);
        saveStoredDailyReviews(parsed.reviews, user?.id);
        if (isBackendConnected && user) {
          for (const r of parsed.reviews) await saveDailyReviewApi(r);
        }
      }
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  };

  const handleClearData = async () => {
    clearAllJournalData(user?.id);
    setTrades([]);
    setDailyReviews([]);
    setSettings(DEFAULT_SETTINGS);

    if (isBackendConnected && user) {
      try {
        await resetDatabaseApi();
      } catch (e) {
        console.error('Failed to reset MongoDB database:', e);
      }
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#090A0C] text-[#f0f1f4] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Header */}
      <Header
        onOpenAddTrade={handleOpenAddTrade}
        onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
        activeTabTitle={tabTitles[currentTab]}
        user={user}
        onLogout={handleLogout}
      />

      {/* App Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8 min-w-0">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
          winRate={stats.winRate}
          balance={stats.currentBalance}
          settings={settings}
          user={user}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              trades={trades}
              settings={settings}
              dailyReviews={dailyReviews}
              onOpenAddTrade={handleOpenAddTrade}
              onSelectTab={setCurrentTab}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
            />
          )}

          {currentTab === 'calculator' && (
            <RecoveryCalculatorView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {currentTab === 'history' && (
            <TradeHistoryView
              trades={trades}
              settings={settings}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
            />
          )}

          {currentTab === 'daily' && (
            <DailyJournalView
              trades={trades}
              settings={settings}
              dailyReviews={dailyReviews}
              onSaveDailyReview={handleSaveDailyReview}
            />
          )}

          {currentTab === 'plan' && (
            <PlanView
              trades={trades}
              settings={settings}
              dailyReviews={dailyReviews}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'performance' && (
            <PerformanceView
              trades={trades}
              settings={settings}
              dailyReviews={dailyReviews}
            />
          )}

          {currentTab === 'discipline' && (
            <DisciplineView
              trades={trades}
              settings={settings}
              dailyReviews={dailyReviews}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView trades={trades} settings={settings} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              trades={trades}
              dailyReviews={dailyReviews}
              onSaveSettings={handleSaveSettings}
              onImportData={handleImportData}
              onClearData={handleClearData}
              user={user}
              onLogout={handleLogout}
            />
          )}

          {currentTab === 'admin' && user?.role === 'admin' && (
            <AdminView onLogout={handleLogout} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
        user={user}
      />

      {/* Add / Edit Trade Modal */}
      <AddTradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveTrade={handleSaveTrade}
        settings={settings}
        tradeToEdit={tradeToEdit}
      />

      {/* Pre-Session Checklist Modal */}
      <PreSessionChecklistModal
        isOpen={isPreSessionModalOpen}
        onClose={() => setIsPreSessionModalOpen(false)}
        rules={settings.preSessionRules || []}
        onSessionReady={() => alert('Session checklist verified! You are disciplined and ready to execute.')}
      />

      {/* Authentication Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
