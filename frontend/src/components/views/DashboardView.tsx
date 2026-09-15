import React from 'react';
import {
  CheckCircle2,
} from 'lucide-react';
import type { Trade, JournalSettings, DailyReview, NavigationTab } from '../../types/journal';
import { computeJournalStats, groupTradesByDay } from '../../utils/calculations';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  trades: Trade[];
  settings: JournalSettings;
  dailyReviews: DailyReview[];
  onOpenAddTrade?: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  settings,
  dailyReviews,
  onSelectTab,
  onEditTrade,
  onDeleteTrade,
}) => {
  const stats = computeJournalStats(trades, settings, dailyReviews);
  const dayRollups = groupTradesByDay(trades, dailyReviews, settings.dailyTradeLimit);

  const plannedTradesTotal = settings.planDurationDays * settings.dailyTradeLimit;
  const recentTrades = [...trades].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  // Cumulative P/L data for chart
  let runningPL = 0;
  const chartData = dayRollups.map((day) => {
    runningPL += day.netPL;
    return {
      name: `D${day.dayNumber}`,
      cumulativePL: Math.round(runningPL * 100) / 100,
    };
  });

  return (
    <div className="space-y-6">
      {/* Refined Small Page Title */}
      <div>
        <h2 className="text-lg font-bold text-[#f0f1f4]">Trading Overview</h2>
        <p className="text-xs text-[#8a8f9d]">Track execution, risk and discipline.</p>
      </div>

      {/* Horizontal Information Section */}
      <div className="desk-panel rounded-lg p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 font-binance text-xs sm:text-sm">
        {/* Balance */}
        <div className="p-2 sm:p-0 sm:pr-4 rounded sm:rounded-none bg-[#14171B] sm:bg-transparent border border-[#252930] sm:border-0 sm:border-r border-[#252930]">
          <div className="text-[10px] sm:text-xs uppercase font-sans text-[#8a8f9d] tracking-wider">Balance</div>
          <div className="text-lg sm:text-xl font-bold text-[#f0f1f4] mt-0.5 sm:mt-1 truncate">
            {settings.currencySymbol}{stats.currentBalance.toFixed(2)}
          </div>
          <div className={`text-xs font-medium mt-0.5 sm:mt-1 ${stats.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.netPL >= 0 ? '+' : ''}{settings.currencySymbol}{stats.netPL.toFixed(2)}
          </div>
        </div>

        {/* Today */}
        <div className="p-2 sm:p-0 sm:px-4 rounded sm:rounded-none bg-[#14171B] sm:bg-transparent border border-[#252930] sm:border-0 sm:border-r border-[#252930]">
          <div className="text-[10px] sm:text-xs uppercase font-sans text-[#8a8f9d] tracking-wider">Today</div>
          <div className={`text-lg sm:text-xl font-bold mt-0.5 sm:mt-1 ${stats.todayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.todayPL >= 0 ? '+' : ''}{settings.currencySymbol}{stats.todayPL.toFixed(2)}
          </div>
          <div className="text-xs text-[#8a8f9d] font-sans mt-0.5 sm:mt-1">
            {stats.todayTradesCount} / {settings.dailyTradeLimit} trades
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-2 sm:p-0 sm:px-4 rounded sm:rounded-none bg-[#14171B] sm:bg-transparent border border-[#252930] sm:border-0 sm:border-r border-[#252930]">
          <div className="text-[10px] sm:text-xs uppercase font-sans text-[#8a8f9d] tracking-wider">Win Rate</div>
          <div className="text-lg sm:text-xl font-bold text-[#f0f1f4] mt-0.5 sm:mt-1">
            {stats.winRate}%
          </div>
          <div className="text-xs text-[#8a8f9d] mt-0.5 sm:mt-1">
            <span className="text-emerald-400 font-semibold">{stats.wins}W</span> / <span className="text-rose-400 font-semibold">{stats.losses}L</span>
          </div>
        </div>

        {/* Trades */}
        <div className="p-2 sm:p-0 sm:px-4 rounded sm:rounded-none bg-[#14171B] sm:bg-transparent border border-[#252930] sm:border-0 sm:border-r border-[#252930]">
          <div className="text-[10px] sm:text-xs uppercase font-sans text-[#8a8f9d] tracking-wider">Trades</div>
          <div className="text-lg sm:text-xl font-bold text-[#f0f1f4] mt-0.5 sm:mt-1">
            {stats.totalTrades} / {plannedTradesTotal}
          </div>
          <div className="text-xs text-[#8a8f9d] font-sans mt-0.5 sm:mt-1">
            Cycle total
          </div>
        </div>

        {/* Streak & Score */}
        <div className="col-span-2 sm:col-span-1 p-2 sm:p-0 sm:pl-4 rounded sm:rounded-none bg-[#14171B] sm:bg-transparent border border-[#252930] sm:border-0">
          <div className="text-[10px] sm:text-xs uppercase font-sans text-[#8a8f9d] tracking-wider">Streak & Score</div>
          <div className="text-lg sm:text-xl font-bold text-[#f0f1f4] mt-0.5 sm:mt-1">
            {stats.currentStreak.count > 0 ? `${stats.currentStreak.count}${stats.currentStreak.type === 'WIN' ? 'W' : 'L'}` : '0'}
          </div>
          <div className="text-xs text-[#8a8f9d] font-sans mt-0.5 sm:mt-1">
            Discipline {stats.disciplineScore}%
          </div>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Column (2 Cols): Refined P/L Chart + Recent Trades Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* P/L Chart */}
          <div className="desk-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#f0f1f4] uppercase tracking-wider">Cumulative P/L Progression</h3>
              <button onClick={() => onSelectTab('performance')} className="text-xs text-[#8a8f9d] hover:text-[#f0f1f4]">
                Performance Details &rarr;
              </button>
            </div>

            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[#5e6370] italic">
                No trades logged yet. Record a trade to visualize equity curve.
              </div>
            ) : (
              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="deskPLGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#252930" vertical={false} />
                    <XAxis dataKey="name" stroke="#5e6370" fontSize={11} tickLine={false} />
                    <YAxis stroke="#5e6370" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1114',
                        borderColor: '#252930',
                        borderRadius: '4px',
                        color: '#f0f1f4',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                      formatter={(val: any) => [`${settings.currencySymbol}${Number(val).toFixed(2)}`, 'P/L']}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativePL"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#deskPLGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Trades Ledger */}
          <div className="desk-card overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#252930]">
              <h3 className="text-sm font-semibold text-[#f0f1f4] uppercase tracking-wider">Recent Trades Ledger</h3>
              <button onClick={() => onSelectTab('history')} className="text-xs sm:text-sm text-[#8a8f9d] hover:text-[#f0f1f4]">
                View All ({trades.length}) &rarr;
              </button>
            </div>

            {recentTrades.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#5e6370]">No recent trades.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#f0f1f4]">
                  <thead className="bg-[#0F1114] text-[#8a8f9d] uppercase text-xs font-mono border-b border-[#252930]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Pair</th>
                      <th className="py-3 px-4">Dir</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">P/L</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252930]/60 font-mono text-xs sm:text-sm">
                    {recentTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-[#191C21]/50 transition-colors">
                        <td className="py-3 px-4 font-sans text-xs text-[#8a8f9d]">
                          {t.date} <span className="text-[11px] text-[#5e6370] font-mono">{t.time}</span>
                        </td>
                        <td className="py-3 px-4 font-bold">{t.pair}</td>
                        <td className="py-3 px-4">
                          <span className={t.direction === 'CALL' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#8a8f9d]">{settings.currencySymbol}{t.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={t.result === 'WIN' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {t.result}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {t.profit >= 0 ? '+' : ''}{settings.currencySymbol}{t.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => onEditTrade(t)}
                            className="text-xs text-[#8a8f9d] hover:text-[#f0f1f4] mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteTrade(t.id)}
                            className="text-xs text-[#5e6370] hover:text-rose-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Discipline & Rules Summary */}
        <div className="space-y-6">
          {/* Discipline Rules Summary */}
          <div className="desk-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#252930] pb-3">
              <h3 className="text-sm font-semibold text-[#f0f1f4] uppercase tracking-wider">
                Discipline Rules
              </h3>
              <button
                onClick={() => onSelectTab('settings')}
                className="text-xs text-[#8a8f9d] hover:text-[#f0f1f4] flex items-center gap-1 cursor-pointer transition-colors"
                title="Edit Discipline Rules in Settings"
              >
                <span>Edit Rules</span>
                <span className="font-mono">&rarr;</span>
              </button>
            </div>

            {settings.preSessionRules && settings.preSessionRules.length > 0 ? (
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#8a8f9d]">
                {settings.preSessionRules.map((rule) => (
                  <li key={rule.id} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-[#f0f1f4]">{rule.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-[#5e6370] italic">
                No active discipline rules configured.{' '}
                <button
                  onClick={() => onSelectTab('settings')}
                  className="text-emerald-400 hover:underline cursor-pointer font-sans"
                >
                  Add custom rules in Settings
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-[#252930] flex justify-between items-center text-xs sm:text-sm font-binance">
              <span className="text-[#8a8f9d] font-sans">Compliance Rating</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base">{stats.disciplineScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
