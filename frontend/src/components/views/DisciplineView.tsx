import React from 'react';
import type { Trade, JournalSettings, DailyReview } from '../../types/journal';
import { computeJournalStats, groupTradesByDay } from '../../utils/calculations';

interface DisciplineViewProps {
  trades: Trade[];
  settings: JournalSettings;
  dailyReviews: DailyReview[];
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  trades,
  settings,
  dailyReviews,
}) => {
  const stats = computeJournalStats(trades, settings, dailyReviews);
  const dayRollups = groupTradesByDay(trades, dailyReviews, settings.dailyTradeLimit);

  const plannedTradesTotal = settings.planDurationDays * settings.dailyTradeLimit;
  const daysCompleted = dayRollups.length;
  const daysWithExactTargetTrades = dayRollups.filter((d) => d.trades.length === settings.dailyTradeLimit).length;

  const overtradedCount = dailyReviews.filter((r) => r.overtraded).length;
  const revengeTradedCount = dailyReviews.filter((r) => r.revengeTraded).length;
  const usedMartingaleCount = dailyReviews.filter((r) => r.usedMartingale).length;
  const brokeLimitCount = dailyReviews.filter((r) => r.brokeLimit).length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="desk-card p-4">
        <h2 className="text-base font-bold text-[#f0f1f4]">Execution Discipline Audit</h2>
        <p className="text-xs text-[#8a8f9d]">Personal compliance journal & rule adherence tracking</p>
      </div>

      {/* Understated Audit Bar */}
      <div className="desk-card p-4 flex items-center justify-between font-mono text-xs">
        <div>
          <div className="text-xs font-sans text-[#8a8f9d]">Rule Adherence Rating</div>
          <div className="text-xl font-bold text-[#f0f1f4] mt-0.5">{stats.disciplineScore}%</div>
        </div>
        <div className="text-right text-[#8a8f9d] font-sans">
          <span>Target: 100% Execution</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Planned Trades</div>
          <div className="text-sm font-bold text-[#f0f1f4] mt-0.5">{plannedTradesTotal}</div>
        </div>
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Executed Trades</div>
          <div className="text-sm font-bold text-[#f0f1f4] mt-0.5">{trades.length}</div>
        </div>
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Days Completed</div>
          <div className="text-sm font-bold text-[#f0f1f4] mt-0.5">{daysCompleted} / {settings.planDurationDays}</div>
        </div>
        <div className="desk-card p-3">
          <div className="text-[10px] font-sans text-[#8a8f9d]">Exact Limit Days</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{daysWithExactTargetTrades}</div>
        </div>
      </div>

      {/* Violation Log */}
      <div className="desk-card p-4 space-y-3">
        <h3 className="text-xs font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2">
          Rule Violation Log
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-[#14171B] border border-[#252930] flex justify-between items-center">
            <div>
              <div className="font-semibold text-[#f0f1f4]">Overtraded</div>
              <div className="text-[10px] text-[#8a8f9d]">Exceeded daily trade count</div>
            </div>
            <span className="font-mono font-bold text-[#f0f1f4]">{overtradedCount}</span>
          </div>

          <div className="p-3 rounded bg-[#14171B] border border-[#252930] flex justify-between items-center">
            <div>
              <div className="font-semibold text-[#f0f1f4]">Revenge Traded</div>
              <div className="text-[10px] text-[#8a8f9d]">Emotional recovery trade</div>
            </div>
            <span className="font-mono font-bold text-[#f0f1f4]">{revengeTradedCount}</span>
          </div>

          <div className="p-3 rounded bg-[#14171B] border border-[#252930] flex justify-between items-center">
            <div>
              <div className="font-semibold text-[#f0f1f4]">Used Martingale</div>
              <div className="text-[10px] text-[#8a8f9d]">Position size escalation</div>
            </div>
            <span className="font-mono font-bold text-[#f0f1f4]">{usedMartingaleCount}</span>
          </div>

          <div className="p-3 rounded bg-[#14171B] border border-[#252930] flex justify-between items-center">
            <div>
              <div className="font-semibold text-[#f0f1f4]">Broke Limit</div>
              <div className="text-[10px] text-[#8a8f9d]">Exceeded {settings.dailyTradeLimit} trades</div>
            </div>
            <span className="font-mono font-bold text-[#f0f1f4]">{brokeLimitCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
