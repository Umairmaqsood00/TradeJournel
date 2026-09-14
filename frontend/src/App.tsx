import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AddTradeModal } from './components/modals/AddTradeModal';
import { PreSessionChecklistModal } from './components/modals/PreSessionChecklistModal';

import { DashboardView } from './components/views/DashboardView';
import { TradeHistoryView } from './components/views/TradeHistoryView';
import { DailyJournalView } from './components/views/DailyJournalView';
import { PlanView } from './components/views/PlanView';
import { PerformanceView } from './components/views/PerformanceView';
import { DisciplineView } from './components/views/DisciplineView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';

import type { NavigationTab, Trade, JournalSettings, DailyReview } from './types/journal';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredTrades,
  saveStoredTrades,
  getStoredDailyReviews,
  saveStoredDailyReviews,
  clearAllJournalData,
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
} from './api/client';
import { computeJournalStats } from './utils/calculations';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [settings, setSettings] = useState<JournalSettings>(getStoredSettings);
  const [trades, setTrades] = useState<Trade[]>(getStoredTrades);
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>(getStoredDailyReviews);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPreSessionModalOpen, setIsPreSessionModalOpen] = useState<boolean>(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  // Sync with Express MongoDB Backend on mount
  useEffect(() => {
    async function loadBackendData() {
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);

      if (isHealthy) {
        try {
          const [serverSettings, serverTrades, serverReviews] = await Promise.all([
            fetchSettingsApi(),
            fetchTradesApi(),
            fetchDailyReviewsApi(),
          ]);
          if (serverSettings) setSettings(serverSettings);
          if (serverTrades) setTrades(serverTrades);
          if (serverReviews) setDailyReviews(serverReviews);
        } catch (e) {
          console.warn('Backend sync fallback to local storage:', e);
        }
      }
    }

    loadBackendData();
  }, []);

  const stats = computeJournalStats(trades, settings, dailyReviews);

  const tabTitles: Record<NavigationTab, string> = {
    dashboard: 'Trading Overview',
    history: 'Trade Ledger',
    daily: 'Daily Review',
    plan: `${settings.planDurationDays}-Day Trading Plan`,
    performance: 'Performance Analytics',
    discipline: 'Discipline Audit',
    calendar: 'Monthly Calendar',
    settings: 'Journal Settings',
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
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === tradeData.id);
      if (exists) {
        return prev.map((t) => (t.id === tradeData.id ? tradeData : t));
      }
      return [tradeData, ...prev];
    });

    saveStoredTrades(trades);

    if (isBackendConnected) {
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
      saveStoredTrades(updated);

      if (isBackendConnected) {
        try {
          await deleteTradeApi(id);
        } catch (e) {
          console.error('Failed to delete trade from MongoDB:', e);
        }
      }
    }
  };

  const handleSaveDailyReview = async (review: DailyReview) => {
    setDailyReviews((prev) => {
      const idx = prev.findIndex((r) => r.date === review.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = review;
        return next;
      }
      return [...prev, review];
    });

    saveStoredDailyReviews(dailyReviews);

    if (isBackendConnected) {
      try {
        await saveDailyReviewApi(review);
      } catch (e) {
        console.error('Failed to sync daily review to MongoDB:', e);
      }
    }
  };

  const handleSaveSettings = async (newSettings: JournalSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    if (isBackendConnected) {
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
        saveStoredSettings(parsed.settings);
        if (isBackendConnected) await saveSettingsApi(parsed.settings);
      }
      if (parsed.trades && Array.isArray(parsed.trades)) {
        setTrades(parsed.trades);
        saveStoredTrades(parsed.trades);
        if (isBackendConnected) {
          for (const t of parsed.trades) await saveTradeApi(t);
        }
      }
      if (parsed.reviews && Array.isArray(parsed.reviews)) {
        setDailyReviews(parsed.reviews);
        saveStoredDailyReviews(parsed.reviews);
        if (isBackendConnected) {
          for (const r of parsed.reviews) await saveDailyReviewApi(r);
        }
      }
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  };

  const handleClearData = async () => {
    clearAllJournalData();
    setTrades([]);
    setDailyReviews([]);
    setSettings(getStoredSettings());

    if (isBackendConnected) {
      try {
        await resetDatabaseApi();
      } catch (e) {
        console.error('Failed to reset MongoDB database:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#f0f1f4] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Header */}
      <Header
        onOpenAddTrade={handleOpenAddTrade}
        onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
        isBackendConnected={isBackendConnected}
        activeTabTitle={tabTitles[currentTab]}
      />

      {/* App Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
          winRate={stats.winRate}
          balance={stats.currentBalance}
          settings={settings}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPreSessionCheck={() => setIsPreSessionModalOpen(true)}
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
    </div>
  );
}

export default App;
