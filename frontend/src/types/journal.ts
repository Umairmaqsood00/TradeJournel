export type TradeDirection = 'CALL' | 'PUT';
export type TradeResult = 'WIN' | 'LOSS';
export type EmotionType = 'Calm' | 'Confident' | 'Nervous' | 'FOMO' | 'Revenge' | 'Greedy' | 'Unsure';
export type AppMode = 'journal' | 'mtg';

export type NavigationTab =
  | 'dashboard'
  | 'history'
  | 'daily'
  | 'plan'
  | 'performance'
  | 'discipline'
  | 'calendar'
  | 'settings'
  | 'admin';

export type MTGNavigationTab =
  | 'mtg_calc'
  | 'mtg_history'
  | 'mtg_performance'
  | 'mtg_calendar'
  | 'mtg_settings';

export interface PreSessionRule {
  id: string;
  text: string;
}

export interface Trade {
  id: string;
  date: string;
  time: string;
  pair: string;
  direction: TradeDirection;
  amount: number;
  payout: number;
  payoutPercent?: number;
  result: TradeResult;
  profit: number;
  strategy?: string;
  sessionNumber?: number;
  emotion: EmotionType;
  followedPlan: boolean;
  ruleFollowed?: boolean;
  notes?: string;
  screenshotUrl?: string;
  createdAt: number;
  timestamp?: number;
}

export interface DailyReview {
  date: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  improvements?: string;
  mindset?: string;
  rating?: number;
  lessons?: string;
  mistakes?: string;
  plans?: string;
  overtraded?: boolean;
  revengeTraded?: boolean;
  usedMartingale?: boolean;
  brokeLimit?: boolean;
}

export interface JournalSettings {
  startingBalance: number;
  startingCapital?: number;
  defaultAmount: number;
  defaultPayout: number;
  payoutRate?: number;
  dailyTradeLimit: number;
  maxTradesPerDay?: number;
  dailyProfitTargetPercent?: number;
  maxDailyLossPercent?: number;
  tradingPlanGoalPercent?: number;
  planDurationDays: number;
  currencySymbol: string;
  preSessionRules: PreSessionRule[];
}

export interface MTGTrade {
  id: string;
  number: number;
  date: string;
  time: string;
  cycle: number;
  tradeAmount: number;
  result: 'WIN' | 'LOSS';
  profit: number;
  cyclePL: number;
  balance: number;
  timestamp: number;
}

export interface MTGSettings {
  startingBalance: number;
  startingTrade: number;
  defaultPayout: number;
  dailyProfitTarget: number;
  currencySymbol: string;
}
