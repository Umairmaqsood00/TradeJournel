export type TradeDirection = 'CALL' | 'PUT';
export type TradeResult = 'WIN' | 'LOSS';
export type EmotionType = 'Calm' | 'Confident' | 'Nervous' | 'FOMO' | 'Revenge' | 'Greedy' | 'Unsure';

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  pair: string;
  direction: TradeDirection;
  amount: number;
  payout: number; // percentage, e.g. 90
  result: TradeResult;
  profit: number; // calculated: WIN -> amount * (payout/100), LOSS -> -amount
  strategy?: string;
  notes?: string;
  screenshotUrl?: string;
  emotion: EmotionType;
  followedPlan: boolean;
  createdAt: number;
}

export interface DailyReview {
  date: string; // YYYY-MM-DD
  whatWentWell: string;
  whatWentWrong: string;
  improvements: string;
  mindset: string;
  overtraded: boolean;
  revengeTraded: boolean;
  usedMartingale: boolean;
  brokeLimit: boolean;
}

export interface PreSessionRule {
  id: string;
  text: string;
}

export interface JournalSettings {
  startingBalance: number;
  defaultAmount: number;
  defaultPayout: number;
  dailyTradeLimit: number;
  planDurationDays: number;
  currencySymbol: string;
  preSessionRules: PreSessionRule[];
}

export type NavigationTab = 
  | 'dashboard' 
  | 'calculator'
  | 'history' 
  | 'daily' 
  | 'plan' 
  | 'performance' 
  | 'discipline' 
  | 'calendar' 
  | 'settings'
  | 'admin';
