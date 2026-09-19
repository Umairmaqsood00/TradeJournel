import type {
  JournalSettings,
  Trade,
  DailyReview,
  AppMode,
  MTGSettings,
  MTGTrade,
} from '../types/journal';

export const DEFAULT_SETTINGS: JournalSettings = {
  startingBalance: 100,
  startingCapital: 100,
  defaultAmount: 10,
  defaultPayout: 85,
  payoutRate: 85,
  dailyTradeLimit: 5,
  maxTradesPerDay: 5,
  dailyProfitTargetPercent: 5,
  maxDailyLossPercent: 10,
  tradingPlanGoalPercent: 100,
  planDurationDays: 30,
  currencySymbol: '$',
  preSessionRules: [
    { id: '1', text: 'I will only trade when emotional state is Calm or Confident.' },
    { id: '2', text: 'I will strictly stop trading if I hit maximum daily loss limit.' },
    { id: '3', text: 'I will never engage in revenge trading after a losing trade.' },
  ],
};

export const DEFAULT_MTG_SETTINGS: MTGSettings = {
  startingBalance: 100,
  startingTrade: 2,
  defaultPayout: 85,
  dailyProfitTarget: 10,
  currencySymbol: '$',
};

// App Mode Persistence
export const getStoredAppMode = (): AppMode | null => {
  return (localStorage.getItem('tradevault_app_mode') as AppMode) || null;
};

export const saveStoredAppMode = (mode: AppMode): void => {
  localStorage.setItem('tradevault_app_mode', mode);
};

// TradeVault Journal Storage
export const getStoredSettings = (userId?: string): JournalSettings => {
  const key = userId ? `tradevault_settings_${userId}` : 'tradevault_settings';
  const data = localStorage.getItem(key);
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: JournalSettings, userId?: string): void => {
  const key = userId ? `tradevault_settings_${userId}` : 'tradevault_settings';
  localStorage.setItem(key, JSON.stringify(settings));
};

export const getStoredTrades = (userId?: string): Trade[] => {
  const key = userId ? `tradevault_trades_${userId}` : 'tradevault_trades';
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredTrades = (trades: Trade[], userId?: string): void => {
  const key = userId ? `tradevault_trades_${userId}` : 'tradevault_trades';
  localStorage.setItem(key, JSON.stringify(trades));
};

export const getStoredDailyReviews = (userId?: string): DailyReview[] => {
  const key = userId ? `tradevault_reviews_${userId}` : 'tradevault_reviews';
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredDailyReviews = (reviews: DailyReview[], userId?: string): void => {
  const key = userId ? `tradevault_reviews_${userId}` : 'tradevault_reviews';
  localStorage.setItem(key, JSON.stringify(reviews));
};

export const clearAllJournalData = (userId?: string): void => {
  const settingsKey = userId ? `tradevault_settings_${userId}` : 'tradevault_settings';
  const tradesKey = userId ? `tradevault_trades_${userId}` : 'tradevault_trades';
  const reviewsKey = userId ? `tradevault_reviews_${userId}` : 'tradevault_reviews';
  localStorage.removeItem(settingsKey);
  localStorage.removeItem(tradesKey);
  localStorage.removeItem(reviewsKey);
};

// MTG Desk Storage
export const getStoredMTGSettings = (userId?: string): MTGSettings => {
  const key = userId ? `mtg_settings_${userId}` : 'mtg_settings';
  const data = localStorage.getItem(key);
  if (!data) return DEFAULT_MTG_SETTINGS;
  try {
    return { ...DEFAULT_MTG_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_MTG_SETTINGS;
  }
};

export const saveStoredMTGSettings = (settings: MTGSettings, userId?: string): void => {
  const key = userId ? `mtg_settings_${userId}` : 'mtg_settings';
  localStorage.setItem(key, JSON.stringify(settings));
};

export const getStoredMTGTrades = (userId?: string): MTGTrade[] => {
  const key = userId ? `mtg_trades_${userId}` : 'mtg_trades';
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveStoredMTGTrades = (trades: MTGTrade[], userId?: string): void => {
  const key = userId ? `mtg_trades_${userId}` : 'mtg_trades';
  localStorage.setItem(key, JSON.stringify(trades));
};

export const clearMTGData = (userId?: string): void => {
  const settingsKey = userId ? `mtg_settings_${userId}` : 'mtg_settings';
  const tradesKey = userId ? `mtg_trades_${userId}` : 'mtg_trades';
  localStorage.removeItem(settingsKey);
  localStorage.removeItem(tradesKey);
};

// Export Helpers
export const exportJournalJSON = (trades: Trade[], settings: JournalSettings, reviews: DailyReview[]) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ trades, settings, reviews }, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tradevault_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportJournalCSV = (trades: Trade[]) => {
  const headers = ['ID', 'Date', 'Time', 'Pair', 'Direction', 'Amount', 'Payout%', 'Result', 'Profit', 'Emotion', 'Followed Plan', 'Notes'];
  const rows = trades.map((t) => [
    t.id,
    t.date,
    t.time,
    t.pair,
    t.direction,
    t.amount,
    t.payout || t.payoutPercent || 85,
    t.result,
    t.profit,
    t.emotion,
    t.followedPlan ? 'Yes' : 'No',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `tradevault_trades_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const getLastUsedPair = (): string => {
  return localStorage.getItem('tradevault_last_pair') || 'EUR/USD';
};

export const saveLastUsedPair = (pair: string): void => {
  localStorage.setItem('tradevault_last_pair', pair);
};
