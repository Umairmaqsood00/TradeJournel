import React from 'react';
import { Target, Settings as SettingsIcon } from 'lucide-react';
import type { Trade, JournalSettings, DailyReview, NavigationTab } from '../../types/journal';
import { computeJournalStats, groupTradesByDay } from '../../utils/calculations';

interface PlanViewProps {
  trades: Trade[];
  settings: JournalSettings;
  dailyReviews: DailyReview[];
  onSelectTab: (tab: NavigationTab) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  trades,
  settings,
  dailyReviews,
  onSelectTab,
}) => {
  const stats = computeJournalStats(trades, settings, dailyReviews);
  const dayRollups = groupTradesByDay(trades, dailyReviews, settings.dailyTradeLimit);

  const currentDayCount = Math.min(dayRollups.length, settings.planDurationDays);
  const progressPercent = Math.min(100, Math.round((currentDayCount / settings.planDurationDays) * 100));

  const plannedTradesTotal = settings.planDurationDays * settings.dailyTradeLimit;
  const expectedWins = Math.round(plannedTradesTotal * 0.6);
  const expectedLosses = plannedTradesTotal - expectedWins;

  const expectedWinProfit = expectedWins * (settings.defaultAmount * (settings.defaultPayout / 100));
  const expectedTotalLoss = expectedLosses * settings.defaultAmount;
  const expectedNetPL = expectedWinProfit - expectedTotalLoss;

  const dailyRisk = settings.dailyTradeLimit * settings.defaultAmount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="desk-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#f0f1f4] flex items-center gap-2.5">
            <Target className="w-5 h-5 text-emerald-500" />
            {settings.planDurationDays}-Day Trading Plan Document
          </h2>
          <p className="text-sm text-[#8a8f9d] mt-1">Risk capital limits and 60% win-rate projection model</p>
        </div>

        <button
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-sm text-[#f0f1f4] transition-colors cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4 text-[#8a8f9d]" />
          <span>Config Parameters</span>
        </button>
      </div>

      {/* Progress */}
      <div className="desk-card p-5 space-y-2.5">
        <div className="flex justify-between text-sm font-mono">
          <span className="text-[#8a8f9d] font-sans">Cycle Progress</span>
          <span className="text-[#f0f1f4]">Day {currentDayCount} of {settings.planDurationDays} ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2.5 rounded bg-[#090A0C] border border-[#252930] overflow-hidden">
          <div className="h-full bg-emerald-500 rounded transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Blueprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Target Scenario Model */}
        <div className="desk-card p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f0f1f4] border-b border-[#252930] pb-2.5">
            Target Projection Model (60% W/R)
          </h3>

          <div className="space-y-2.5 text-sm font-mono">
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Planned Trades</span>
              <span className="text-[#f0f1f4]">{plannedTradesTotal} trades</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Expected W/L Ratio</span>
              <span className="text-emerald-400 font-semibold">{expectedWins}W / {expectedLosses}L</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Default Payout</span>
              <span className="text-[#f0f1f4]">{settings.defaultPayout}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Daily Exposure Cap</span>
              <span className="text-[#f0f1f4]">{settings.currencySymbol}{dailyRisk.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 font-bold text-base">
              <span className="text-emerald-400 font-sans">Target {settings.planDurationDays}-Day P/L</span>
              <span className="text-emerald-400">+{settings.currencySymbol}{expectedNetPL.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actual Performance To Date */}
        <div className="desk-card p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f0f1f4] border-b border-[#252930] pb-2.5">
            Actual Execution Metrics
          </h3>

          <div className="space-y-2.5 text-sm font-mono">
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Executed Trades</span>
              <span className="text-[#f0f1f4]">{stats.totalTrades} / {plannedTradesTotal}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Win Rate</span>
              <span className="text-[#f0f1f4] font-semibold">{stats.winRate}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Actual W/L</span>
              <div>
                <span className="text-emerald-400 font-semibold">{stats.wins}W</span> / <span className="text-rose-400 font-semibold">{stats.losses}L</span>
              </div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#252930]/40">
              <span className="text-[#8a8f9d] font-sans">Discipline Rating</span>
              <span className="text-emerald-400 font-semibold">{stats.disciplineScore}%</span>
            </div>
            <div className="flex justify-between py-2 pt-3 font-bold text-base">
              <span className="text-[#8a8f9d] font-sans">Actual Net P/L</span>
              <span className={stats.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {stats.netPL >= 0 ? '+' : ''}{settings.currencySymbol}{stats.netPL.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Rules Document */}
      <div className="desk-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2.5">
          Capital & Execution Guidelines
        </h3>
        <ul className="space-y-2.5 text-sm text-[#8a8f9d]">
          <li className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Strict daily cap of {settings.dailyTradeLimit} trades per session ({settings.currencySymbol}{dailyRisk.toFixed(2)} total risk).</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Fixed size of {settings.currencySymbol}{settings.defaultAmount.toFixed(2)} per trade. No martingale size escalation.</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Complete pre-session checklist before taking trades.</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Record every trade with emotion and setup tags. Review cycle after {settings.planDurationDays} trading days.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
