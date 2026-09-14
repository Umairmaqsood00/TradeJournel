import React from 'react';
import type { Trade, JournalSettings, DailyReview } from '../../types/journal';
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

interface PerformanceViewProps {
  trades: Trade[];
  settings: JournalSettings;
  dailyReviews: DailyReview[];
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  trades,
  settings,
  dailyReviews,
}) => {
  const stats = computeJournalStats(trades, settings, dailyReviews);
  const dayRollups = groupTradesByDay(trades, dailyReviews, settings.dailyTradeLimit);

  let runningPL = 0;
  const chartData = dayRollups.map((day) => {
    runningPL += day.netPL;
    return {
      name: `Day ${day.dayNumber}`,
      cumulativePL: Math.round(runningPL * 100) / 100,
    };
  });

  const profitFactor = stats.totalLosses > 0 ? (stats.winningProfit / stats.totalLosses).toFixed(2) : '—';

  return (
    <div className="space-y-5">
      <div className="desk-card p-4">
        <h2 className="text-base font-bold text-[#f0f1f4]">Performance Workspace</h2>
        <p className="text-xs text-[#8a8f9d]">Financial analytics and risk distribution metrics</p>
      </div>

      {/* Analytical Top Metrics Bar */}
      <div className="desk-card p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#252930] font-mono">
        <div className="pt-2 sm:pt-0 sm:pr-3">
          <div className="text-[10px] font-sans text-[#8a8f9d] uppercase">Total P/L</div>
          <div className={`text-base font-bold mt-1 ${stats.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.netPL >= 0 ? '+' : ''}{settings.currencySymbol}{stats.netPL.toFixed(2)}
          </div>
        </div>

        <div className="pt-2 sm:pt-0 sm:px-3">
          <div className="text-[10px] font-sans text-[#8a8f9d] uppercase">Win Rate</div>
          <div className="text-base font-bold text-[#f0f1f4] mt-1">{stats.winRate}%</div>
        </div>

        <div className="pt-2 sm:pt-0 sm:px-3">
          <div className="text-[10px] font-sans text-[#8a8f9d] uppercase">Profit Factor</div>
          <div className="text-base font-bold text-[#f0f1f4] mt-1">{profitFactor}</div>
        </div>

        <div className="pt-2 sm:pt-0 sm:px-3">
          <div className="text-[10px] font-sans text-[#8a8f9d] uppercase">Average Trade</div>
          <div className={`text-base font-bold mt-1 ${stats.avgPLPerTrade >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.avgPLPerTrade >= 0 ? '+' : ''}{settings.currencySymbol}{stats.avgPLPerTrade.toFixed(2)}
          </div>
        </div>

        <div className="pt-2 sm:pt-0 sm:pl-3">
          <div className="text-[10px] font-sans text-[#8a8f9d] uppercase">Total Trades</div>
          <div className="text-base font-bold text-[#f0f1f4] mt-1">{stats.totalTrades}</div>
        </div>
      </div>

      {/* Refined P/L Chart */}
      <div className="desk-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase text-[#f0f1f4]">Equity Curve Progression</h3>
        {chartData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-[#5e6370] italic">
            No trade data logged for performance curve.
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfPLGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#252930" vertical={false} />
                <XAxis dataKey="name" stroke="#5e6370" fontSize={10} tickLine={false} />
                <YAxis stroke="#5e6370" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1114',
                    borderColor: '#252930',
                    borderRadius: '4px',
                    color: '#f0f1f4',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any) => [`${settings.currencySymbol}${Number(val).toFixed(2)}`, 'Cumulative P/L']}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativePL"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="url(#perfPLGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Total Amount Risked</div>
          <div className="text-sm font-bold text-[#f0f1f4] mt-1">{settings.currencySymbol}{stats.totalRisked.toFixed(2)}</div>
        </div>
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Gross Winning Profit</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">+{settings.currencySymbol}{stats.winningProfit.toFixed(2)}</div>
        </div>
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Gross Losses</div>
          <div className="text-sm font-bold text-rose-400 mt-1">-{settings.currencySymbol}{stats.totalLosses.toFixed(2)}</div>
        </div>
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Avg P/L Per Day</div>
          <div className={`text-sm font-bold mt-1 ${stats.avgPLPerDay >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.avgPLPerDay >= 0 ? '+' : ''}{settings.currencySymbol}{stats.avgPLPerDay.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
