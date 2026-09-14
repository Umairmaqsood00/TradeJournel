import type { Trade, JournalSettings, DailyReview } from '../types/journal';

export function calculateTradeProfit(amount: number, payout: number, result: 'WIN' | 'LOSS'): number {
  if (result === 'WIN') {
    return Math.round(amount * (payout / 100) * 100) / 100;
  }
  return -Math.abs(amount);
}

export interface JournalStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  netPL: number;
  currentBalance: number;
  todayPL: number;
  todayTradesCount: number;
  currentStreak: {
    type: 'WIN' | 'LOSS' | 'NONE';
    count: number;
  };
  disciplineScore: number;
  totalRisked: number;
  winningProfit: number;
  totalLosses: number;
  avgPLPerTrade: number;
  avgPLPerDay: number;
}

export function computeJournalStats(
  trades: Trade[],
  settings: JournalSettings,
  dailyReviews: DailyReview[] = []
): JournalStats {
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === 'WIN').length;
  const losses = trades.filter((t) => t.result === 'LOSS').length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 1000) / 10 : 0;

  const netPL = trades.reduce((acc, t) => acc + t.profit, 0);
  const currentBalance = Math.round((settings.startingBalance + netPL) * 100) / 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter((t) => t.date === todayStr);
  const todayPL = todayTrades.reduce((acc, t) => acc + t.profit, 0);
  const todayTradesCount = todayTrades.length;

  const sortedTrades = [...trades].sort((a, b) => b.createdAt - a.createdAt);
  let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
  let streakCount = 0;

  if (sortedTrades.length > 0) {
    streakType = sortedTrades[0].result;
    for (const t of sortedTrades) {
      if (t.result === streakType) {
        streakCount++;
      } else {
        break;
      }
    }
  }

  let disciplinePoints = 0;
  if (totalTrades > 0) {
    const planFollowedCount = trades.filter((t) => t.followedPlan).length;
    disciplinePoints = (planFollowedCount / totalTrades) * 100;

    const infractionCount = dailyReviews.filter(
      (r) => r.overtraded || r.revengeTraded || r.usedMartingale || r.brokeLimit
    ).length;
    if (infractionCount > 0) {
      disciplinePoints = Math.max(0, disciplinePoints - infractionCount * 5);
    }
  } else {
    disciplinePoints = 100;
  }

  const disciplineScore = Math.round(disciplinePoints);

  const winningProfit = trades
    .filter((t) => t.result === 'WIN')
    .reduce((acc, t) => acc + t.profit, 0);

  const totalLosses = Math.abs(
    trades
      .filter((t) => t.result === 'LOSS')
      .reduce((acc, t) => acc + t.profit, 0)
  );

  const totalRisked = trades.reduce((acc, t) => acc + t.amount, 0);

  const avgPLPerTrade = totalTrades > 0 ? Math.round((netPL / totalTrades) * 100) / 100 : 0;

  const uniqueDays = new Set(trades.map((t) => t.date)).size;
  const avgPLPerDay = uniqueDays > 0 ? Math.round((netPL / uniqueDays) * 100) / 100 : 0;

  return {
    totalTrades,
    wins,
    losses,
    winRate,
    netPL: Math.round(netPL * 100) / 100,
    currentBalance,
    todayPL: Math.round(todayPL * 100) / 100,
    todayTradesCount,
    currentStreak: {
      type: streakType,
      count: streakCount,
    },
    disciplineScore,
    totalRisked: Math.round(totalRisked * 100) / 100,
    winningProfit: Math.round(winningProfit * 100) / 100,
    totalLosses: Math.round(totalLosses * 100) / 100,
    avgPLPerTrade,
    avgPLPerDay,
  };
}

export interface DayRollup {
  date: string;
  dayNumber: number;
  trades: Trade[];
  wins: number;
  losses: number;
  winRate: number;
  netPL: number;
  planFollowed: boolean;
  review?: DailyReview;
}

export function groupTradesByDay(
  trades: Trade[],
  dailyReviews: DailyReview[],
  dailyLimit: number = 3
): DayRollup[] {
  const sorted = [...trades].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const mapByDate = new Map<string, Trade[]>();
  for (const t of sorted) {
    if (!mapByDate.has(t.date)) {
      mapByDate.set(t.date, []);
    }
    mapByDate.get(t.date)!.push(t);
  }

  const sortedDates = Array.from(mapByDate.keys()).sort();

  return sortedDates.map((date, index) => {
    const dayTrades = mapByDate.get(date) || [];
    const wins = dayTrades.filter((t) => t.result === 'WIN').length;
    const losses = dayTrades.filter((t) => t.result === 'LOSS').length;
    const winRate = dayTrades.length > 0 ? Math.round((wins / dayTrades.length) * 100) : 0;
    const netPL = Math.round(dayTrades.reduce((acc, t) => acc + t.profit, 0) * 100) / 100;
    const planFollowed = dayTrades.length <= dailyLimit && dayTrades.every((t) => t.followedPlan);
    const review = dailyReviews.find((r) => r.date === date);

    return {
      date,
      dayNumber: index + 1,
      trades: dayTrades,
      wins,
      losses,
      winRate,
      netPL,
      planFollowed,
      review,
    };
  });
}
