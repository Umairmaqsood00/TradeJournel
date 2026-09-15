import type { Trade, JournalSettings, DailyReview } from '../types/journal';

const STORAGE_KEYS = {
  SETTINGS: 'trade_journal_settings_v1',
  TRADES: 'trade_journal_trades_v1',
  REVIEWS: 'trade_journal_reviews_v1',
  LAST_PAIR: 'trade_journal_last_pair_v1',
};

export const DEFAULT_PRE_SESSION_RULES = [
  { id: 'psr-1', text: 'Strict trade limit adherence per session' },
  { id: 'psr-2', text: 'No revenge size escalation' },
  { id: 'psr-3', text: 'No martingale strategy' },
  { id: 'psr-4', text: 'Pre-session checklist verified' },
];

export const DEFAULT_SETTINGS: JournalSettings = {
  startingBalance: 150.40,
  defaultAmount: 3.00,
  defaultPayout: 90,
  dailyTradeLimit: 3,
  planDurationDays: 10,
  currencySymbol: '$',
  preSessionRules: DEFAULT_PRE_SESSION_RULES,
};

function getScopedKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_user_${userId}` : `${baseKey}_guest`;
}

export function getStoredSettings(userId?: string): JournalSettings {
  try {
    const raw = localStorage.getItem(getScopedKey(STORAGE_KEYS.SETTINGS, userId));
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: JournalSettings, userId?: string): void {
  try {
    localStorage.setItem(getScopedKey(STORAGE_KEYS.SETTINGS, userId), JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredTrades(userId?: string): Trade[] {
  try {
    const raw = localStorage.getItem(getScopedKey(STORAGE_KEYS.TRADES, userId));
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load trades:', e);
    return [];
  }
}

export function saveStoredTrades(trades: Trade[], userId?: string): void {
  try {
    localStorage.setItem(getScopedKey(STORAGE_KEYS.TRADES, userId), JSON.stringify(trades));
  } catch (e) {
    console.error('Failed to save trades:', e);
  }
}

export function getStoredDailyReviews(userId?: string): DailyReview[] {
  try {
    const raw = localStorage.getItem(getScopedKey(STORAGE_KEYS.REVIEWS, userId));
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load daily reviews:', e);
    return [];
  }
}

export function saveStoredDailyReviews(reviews: DailyReview[], userId?: string): void {
  try {
    localStorage.setItem(getScopedKey(STORAGE_KEYS.REVIEWS, userId), JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save daily reviews:', e);
  }
}

export function getLastUsedPair(): string {
  return localStorage.getItem(STORAGE_KEYS.LAST_PAIR) || 'EUR/USD';
}

export function saveLastUsedPair(pair: string): void {
  if (pair) {
    localStorage.setItem(STORAGE_KEYS.LAST_PAIR, pair);
  }
}

export function exportJournalJSON(trades: Trade[], settings: JournalSettings, reviews: DailyReview[]): string {
  const payload = {
    app: 'Personal Trading Journal',
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings,
    trades,
    reviews,
  };
  return JSON.stringify(payload, null, 2);
}

export function exportJournalCSV(trades: Trade[]): string {
  const headers = ['Date', 'Time', 'Pair', 'Direction', 'Amount', 'Payout', 'Result', 'Profit/Loss', 'Emotion', 'FollowedPlan', 'Strategy', 'Notes'];
  const rows = trades.map((t) => [
    t.date,
    t.time,
    `"${t.pair}"`,
    t.direction,
    t.amount.toFixed(2),
    `${t.payout}%`,
    t.result,
    t.profit.toFixed(2),
    t.emotion,
    t.followedPlan ? 'Yes' : 'No',
    `"${(t.strategy || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function clearAllJournalData(userId?: string): void {
  localStorage.removeItem(getScopedKey(STORAGE_KEYS.TRADES, userId));
  localStorage.removeItem(getScopedKey(STORAGE_KEYS.REVIEWS, userId));
  localStorage.removeItem(getScopedKey(STORAGE_KEYS.SETTINGS, userId));
  localStorage.removeItem(STORAGE_KEYS.LAST_PAIR);
}
