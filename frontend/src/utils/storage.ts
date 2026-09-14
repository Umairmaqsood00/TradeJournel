import type { Trade, JournalSettings, DailyReview } from '../types/journal';

const STORAGE_KEYS = {
  SETTINGS: 'trade_journal_settings_v1',
  TRADES: 'trade_journal_trades_v1',
  REVIEWS: 'trade_journal_reviews_v1',
  LAST_PAIR: 'trade_journal_last_pair_v1',
};

export const DEFAULT_PRE_SESSION_RULES = [
  { id: 'psr-1', text: 'Reviewed key support, resistance, and session market structure' },
  { id: 'psr-2', text: 'Confirmed maximum 3 trades limit for today ($9 total risk)' },
  { id: 'psr-3', text: 'Checked emotional state: Calm, focused, and free from revenge urges' },
  { id: 'psr-4', text: 'Verified fixed $3 position size parameter without martingale' },
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

const SAMPLE_TRADES: Trade[] = [
  {
    id: 'tr-1',
    date: '2026-09-11',
    time: '09:15',
    pair: 'EUR/USD',
    direction: 'CALL',
    amount: 3.00,
    payout: 90,
    result: 'WIN',
    profit: 2.70,
    strategy: 'Key Resistance Breakout',
    notes: 'Clean bounce off 15m support level with strong momentum.',
    emotion: 'Calm',
    followedPlan: true,
    createdAt: Date.now() - 400000000,
  },
  {
    id: 'tr-2',
    date: '2026-09-11',
    time: '10:30',
    pair: 'EUR/USD',
    direction: 'PUT',
    amount: 3.00,
    payout: 90,
    result: 'WIN',
    profit: 2.70,
    strategy: 'Double Top Rejection',
    notes: 'Waited for resistance rejection confirmation.',
    emotion: 'Confident',
    followedPlan: true,
    createdAt: Date.now() - 395000000,
  },
  {
    id: 'tr-3',
    date: '2026-09-11',
    time: '11:45',
    pair: 'GBP/JPY',
    direction: 'CALL',
    amount: 3.00,
    payout: 90,
    result: 'LOSS',
    profit: -3.00,
    strategy: 'Trend Continuation',
    notes: 'Fakeout pull back below key level. Stopped out.',
    emotion: 'Calm',
    followedPlan: true,
    createdAt: Date.now() - 390000000,
  },
  {
    id: 'tr-4',
    date: '2026-09-12',
    time: '14:10',
    pair: 'AUD/USD',
    direction: 'CALL',
    amount: 3.00,
    payout: 90,
    result: 'WIN',
    profit: 2.70,
    strategy: 'EMA Crossover',
    notes: 'Smooth uptrend ride after London session opening.',
    emotion: 'Calm',
    followedPlan: true,
    createdAt: Date.now() - 300000000,
  },
  {
    id: 'tr-5',
    date: '2026-09-12',
    time: '15:20',
    pair: 'EUR/USD',
    direction: 'PUT',
    amount: 3.00,
    payout: 90,
    result: 'WIN',
    profit: 2.70,
    strategy: 'Supply Zone Rejection',
    notes: 'Clear rejection wick on 5m chart.',
    emotion: 'Confident',
    followedPlan: true,
    createdAt: Date.now() - 295000000,
  },
  {
    id: 'tr-6',
    date: '2026-09-12',
    time: '16:45',
    pair: 'USD/JPY',
    direction: 'CALL',
    amount: 3.00,
    payout: 90,
    result: 'WIN',
    profit: 2.70,
    strategy: 'Support Bounce',
    notes: 'Third touch of lower trendline channel.',
    emotion: 'Calm',
    followedPlan: true,
    createdAt: Date.now() - 290000000,
  },
];

const SAMPLE_REVIEWS: DailyReview[] = [
  {
    date: '2026-09-11',
    whatWentWell: 'Patience on entry points. Didn\'t rush into messy setups.',
    whatWentWrong: 'Lost focus slightly on the 3rd trade causing minor hesitation.',
    improvements: 'Set price alerts rather than staring endlessly at candles.',
    mindset: 'Disciplined and relaxed.',
    overtraded: false,
    revengeTraded: false,
    usedMartingale: false,
    brokeLimit: false,
  },
];

export function getStoredSettings(): JournalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: JournalSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(SAMPLE_TRADES));
      return SAMPLE_TRADES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load trades:', e);
    return SAMPLE_TRADES;
  }
}

export function saveStoredTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  } catch (e) {
    console.error('Failed to save trades:', e);
  }
}

export function getStoredDailyReviews(): DailyReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SAMPLE_REVIEWS));
      return SAMPLE_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load daily reviews:', e);
    return SAMPLE_REVIEWS;
  }
}

export function saveStoredDailyReviews(reviews: DailyReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
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

export function clearAllJournalData(): void {
  localStorage.removeItem(STORAGE_KEYS.TRADES);
  localStorage.removeItem(STORAGE_KEYS.REVIEWS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.LAST_PAIR);
}
