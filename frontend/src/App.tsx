import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AddTradeModal } from './components/modals/AddTradeModal';
import { PreSessionChecklistModal } from './components/modals/PreSessionChecklistModal';
import { AuthModal } from './components/auth/AuthModal';
import { ModeSelectionModal } from './components/modals/ModeSelectionModal';

import { DashboardView } from './components/views/DashboardView';
import { TradeHistoryView } from './components/views/TradeHistoryView';
import { DailyJournalView } from './components/views/DailyJournalView';
import { PlanView } from './components/views/PlanView';
import { PerformanceView } from './components/views/PerformanceView';
import { DisciplineView } from './components/views/DisciplineView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { AdminView } from './components/views/AdminView';

// Dedicated MTG Calculator Desk Views
import { RecoveryCalculatorView } from './components/views/RecoveryCalculatorView';
import { MTGTradeHistoryView } from './components/views/MTGTradeHistoryView';
import { MTGPerformanceView } from './components/views/MTGPerformanceView';
import { MTGCalendarView } from './components/views/MTGCalendarView';
import { MTGSettingsView } from './components/views/MTGSettingsView';

import type {
  AppMode,
  NavigationTab,
  MTGNavigationTab,
  Trade,
  JournalSettings,
  DailyReview,
  MTGTrade,
  MTGSettings,
} from './types/journal';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredTrades,
  saveStoredTrades,
  getStoredDailyReviews,
  saveStoredDailyReviews,
  clearAllJournalData,
  DEFAULT_SETTINGS,
  getStoredAppMode,
  saveStoredAppMode,
  getStoredMTGSettings,
  saveStoredMTGSettings,
  getStoredMTGTrades,
  saveStoredMTGTrades,
  clearMTGData,
  DEFAULT_MTG_SETTINGS,
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
  // App Mode State: 'journal' vs 'mtg'
  const [appMode, setAppMode] = useState<AppMode>(() => getStoredAppMode() || 'journal');
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(() => !getStoredAppMode());

  // Navigation Tabs
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mtgTab, setMTGTab] = useState<MTGNavigationTab>('mtg_calc');

  // TradeVault Journal States
  const [settings, setSettings] = useState<JournalSettings>(DEFAULT_SETTINGS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // MTG Calculator Desk States (Completely Isolated)
  const [mtgSettings, setMTGSettings] = useState<MTGSettings>(DEFAULT_MTG_SETTINGS);
  const [mtgTrades, setMTGTrades] = useState<MTGTrade[]>([]);

  // Auth & Modal States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPreSessionModalOpen, setIsPreSessionModalOpen] = useState<boolean>(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  // Load authenticated user and sync user data
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
        setSettings(getStoredSettings(activeUser?.id));
      }
      setTrades(serverTrades || getStoredTrades(activeUser?.id));
      setDailyReviews(serverReviews || getStoredDailyReviews(activeUser?.id));
    } catch (e) {
      setSettings(getStoredSettings(activeUser?.id));
      setTrades(getStoredTrades(activeUser?.id));
      setDailyReviews(getStoredDailyReviews(activeUser?.id));
    }

    // Load MTG Desk isolated state
    setMTGSettings(getStoredMTGSettings(activeUser?.id));
    setMTGTrades(getStoredMTGTrades(activeUser?.id));
  };

  const handleSelectMode = (mode: AppMode) => {
    setAppMode(mode);
    saveStoredAppMode(mode);
    setIsModeModalOpen(false);
  };

  const handleLoginSuccess = async (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    if (authenticatedUser.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
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
    setMTGTrades([]);
    setMTGSettings(DEFAULT_MTG_SETTINGS);
    setIsAuthModalOpen(true);
  };

  // Compute Journal Stats
  const stats = computeJournalStats(trades, settings, dailyReviews);

  // Compute MTG Desk Stats
  const mtgWins = mtgTrades.filter((t) => t.result === 'WIN').length;
  const mtgWinRate = mtgTrades.length > 0 ? Math.round((mtgWins / mtgTrades.length) * 1000) / 10 : 0;
  const mtgNetPL = mtgTrades.reduce((acc, t) => acc + t.profit, 0);
  const mtgBalance = mtgSettings.startingBalance + mtgNetPL;

  const tabTitles: Record<NavigationTab, string> = {
    dashboard: 'TradeVault Overview',
    history: 'Trade Ledger',
    daily: 'Daily Review',
    plan: `${settings.planDurationDays || 30}-Day Trading Plan`,
    performance: 'Performance Analytics',
    discipline: 'Discipline Audit',
    calendar: 'Monthly Calendar',
    settings: 'TradeVault Config',
    admin: 'Admin Desk - User Management',
  };

  const mtgTabTitles: Record<MTGNavigationTab, string> = {
    mtg_calc: 'MTG Recovery Calculator & Execution Desk',
    mtg_history: 'MTG Trades Ledger',
    mtg_performance: 'MTG Performance & Analytics',
    mtg_calendar: 'MTG Monthly Calendar',
    mtg_settings: 'MTG Desk Settings',
  };

  // Trade Vault Journal Handlers
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

  // MTG Calculator Desk Handlers (100% Isolated)
  const handleSaveMTGTrade = async (newTrade: MTGTrade) => {
    let updated: MTGTrade[] = [];
    setMTGTrades((prev) => {
      updated = [newTrade, ...prev];
      return updated;
    });
    saveStoredMTGTrades(updated, user?.id);
  };

  const handleDeleteMTGTrade = (id: string) => {
    if (window.confirm('Delete this MTG trade record?')) {
      const updated = mtgTrades.filter((t) => t.id !== id);
      setMTGTrades(updated);
      saveStoredMTGTrades(updated, user?.id);
    }
  };

  const handleClearMTGTrades = () => {
    if (window.confirm('Are you sure you want to delete all MTG trades history?')) {
      setMTGTrades([]);
      saveStoredMTGTrades([], user?.id);
    }
  };

  const handleSaveMTGSettings = (newMTGSettings: MTGSettings) => {
    setMTGSettings(newMTGSettings);
    saveStoredMTGSettings(newMTGSettings, user?.id);
  };

  const handleClearMTGData = () => {
    clearMTGData(user?.id);
    setMTGTrades([]);
    setMTGSettings(DEFAULT_MTG_SETTINGS);
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#090A0C] text-[#f0f1f4] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Header */}
      <Header
        appMode={appMode}
        onOpenModeModal={() => setIsModeModalOpen(true)}
        onOpenAddTrade={handleOpenAddTrade}
        onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
        activeTabTitle={appMode === 'journal' ? tabTitles[currentTab] : mtgTabTitles[mtgTab]}
        user={user}
        onLogout={handleLogout}
      />

      {/* App Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8 min-w-0">
        {/* Desktop Sidebar */}
        <Sidebar
          appMode={appMode}
          currentTab={currentTab}
          mtgTab={mtgTab}
          onSelectTab={setCurrentTab}
          onSelectMTGTab={setMTGTab}
          onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
          winRate={stats.winRate}
          balance={stats.currentBalance}
          mtgWinRate={mtgWinRate}
          mtgBalance={mtgBalance}
          settings={settings}
          mtgSettings={mtgSettings}
          user={user}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full">
          {appMode === 'journal' ? (
            <>
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
            </>
          ) : (
            <>
              {mtgTab === 'mtg_calc' && (
                <RecoveryCalculatorView
                  mtgTrades={mtgTrades}
                  mtgSettings={mtgSettings}
                  onSaveMTGTrade={handleSaveMTGTrade}
                  onSaveMTGSettings={handleSaveMTGSettings}
                  onClearMTGTrades={handleClearMTGTrades}
                />
              )}

              {mtgTab === 'mtg_history' && (
                <MTGTradeHistoryView
                  mtgTrades={mtgTrades}
                  mtgSettings={mtgSettings}
                  onDeleteMTGTrade={handleDeleteMTGTrade}
                  onClearMTGTrades={handleClearMTGTrades}
                />
              )}

              {mtgTab === 'mtg_performance' && (
                <MTGPerformanceView
                  mtgTrades={mtgTrades}
                  mtgSettings={mtgSettings}
                />
              )}

              {mtgTab === 'mtg_calendar' && (
                <MTGCalendarView
                  mtgTrades={mtgTrades}
                  mtgSettings={mtgSettings}
                />
              )}

              {mtgTab === 'mtg_settings' && (
                <MTGSettingsView
                  mtgSettings={mtgSettings}
                  onSaveMTGSettings={handleSaveMTGSettings}
                  onClearMTGData={handleClearMTGData}
                  user={user}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        appMode={appMode}
        currentTab={currentTab}
        mtgTab={mtgTab}
        onSelectTab={setCurrentTab}
        onSelectMTGTab={setMTGTab}
        onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
        user={user}
      />

      {/* Mode Selection Modal / Workspace Launcher */}
      <ModeSelectionModal
        isOpen={isModeModalOpen}
        onSelectMode={handleSelectMode}
        onClose={() => setIsModeModalOpen(false)}
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
