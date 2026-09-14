import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Trade, JournalSettings, DailyReview } from '../../types/journal';
import { groupTradesByDay } from '../../utils/calculations';

interface DailyJournalViewProps {
  trades: Trade[];
  settings: JournalSettings;
  dailyReviews: DailyReview[];
  onSaveDailyReview: (review: DailyReview) => void;
}

export const DailyJournalView: React.FC<DailyJournalViewProps> = ({
  trades,
  settings,
  dailyReviews,
  onSaveDailyReview,
}) => {
  const dayRollups = groupTradesByDay(trades, dailyReviews, settings.dailyTradeLimit);
  const [expandedDay, setExpandedDay] = useState<string | null>(
    dayRollups.length > 0 ? dayRollups[dayRollups.length - 1].date : null
  );

  const [activeReviewDate, setActiveReviewDate] = useState<string | null>(null);
  const [whatWentWell, setWhatWentWell] = useState<string>('');
  const [whatWentWrong, setWhatWentWrong] = useState<string>('');
  const [improvements, setImprovements] = useState<string>('');
  const [mindset, setMindset] = useState<string>('');
  const [overtraded, setOvertraded] = useState<boolean>(false);
  const [revengeTraded, setRevengeTraded] = useState<boolean>(false);
  const [usedMartingale, setUsedMartingale] = useState<boolean>(false);
  const [brokeLimit, setBrokeLimit] = useState<boolean>(false);

  const startReviewEditor = (date: string, existing?: DailyReview) => {
    setActiveReviewDate(date);
    if (existing) {
      setWhatWentWell(existing.whatWentWell);
      setWhatWentWrong(existing.whatWentWrong);
      setImprovements(existing.improvements);
      setMindset(existing.mindset);
      setOvertraded(existing.overtraded);
      setRevengeTraded(existing.revengeTraded);
      setUsedMartingale(existing.usedMartingale);
      setBrokeLimit(existing.brokeLimit);
    } else {
      setWhatWentWell('');
      setWhatWentWrong('');
      setImprovements('');
      setMindset('');
      setOvertraded(false);
      setRevengeTraded(false);
      setUsedMartingale(false);
      setBrokeLimit(false);
    }
  };

  const handleSaveReview = (date: string) => {
    onSaveDailyReview({
      date,
      whatWentWell,
      whatWentWrong,
      improvements,
      mindset,
      overtraded,
      revengeTraded,
      usedMartingale,
      brokeLimit,
    });
    setActiveReviewDate(null);
  };

  return (
    <div className="space-y-4">
      <div className="desk-card p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#f0f1f4]">Daily Session Reviews</h2>
          <p className="text-xs text-[#8a8f9d]">Evaluate daily performance & session execution notes</p>
        </div>
      </div>

      {dayRollups.length === 0 ? (
        <div className="desk-card p-10 text-center text-xs text-[#5e6370]">No daily logs recorded.</div>
      ) : (
        <div className="space-y-3">
          {dayRollups.map((day) => {
            const isExpanded = expandedDay === day.date;
            const isEditingReview = activeReviewDate === day.date;
            const review = day.review;

            return (
              <div key={day.date} className="desk-card overflow-hidden">
                {/* Header Summary */}
                <div
                  onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#191C21]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#090A0C] border border-[#252930] flex items-center justify-center font-mono font-bold text-xs text-[#f0f1f4]">
                      D{day.dayNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f0f1f4] flex items-center gap-2">
                        <span>Day {day.dayNumber}</span>
                        <span className="text-[#8a8f9d] font-mono font-normal">({day.date})</span>
                      </div>
                      <div className="text-[11px] text-[#8a8f9d] font-mono">
                        Trades: {day.trades.length} / {settings.dailyTradeLimit} • Win Rate: {day.winRate}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {day.planFollowed ? (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Plan Followed
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Overstepped
                      </span>
                    )}

                    <div className="text-right font-mono text-xs">
                      <span className={day.netPL >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {day.netPL >= 0 ? '+' : ''}{settings.currencySymbol}{day.netPL.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[#8a8f9d]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-[#252930] bg-[#0F1114] space-y-4 text-xs">
                    {/* Trades list */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
                      {day.trades.map((tr) => (
                        <div key={tr.id} className="p-2.5 rounded bg-[#14171B] border border-[#252930] flex justify-between">
                          <div>
                            <div className="font-bold text-[#f0f1f4]">{tr.pair} <span className={tr.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}>{tr.direction}</span></div>
                            <div className="text-[10px] text-[#8a8f9d]">{tr.time} • {tr.emotion}</div>
                          </div>
                          <div className="text-right">
                            <span className={tr.profit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {tr.profit >= 0 ? '+' : ''}{settings.currencySymbol}{tr.profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Session Review */}
                    <div className="p-3.5 rounded bg-[#14171B] border border-[#252930] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#f0f1f4]">Session Review</span>
                        {!isEditingReview && (
                          <button
                            onClick={() => startReviewEditor(day.date, review)}
                            className="text-xs text-emerald-400 hover:underline"
                          >
                            {review ? 'Edit Review' : '+ Add Review'}
                          </button>
                        )}
                      </div>

                      {isEditingReview ? (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[#8a8f9d] mb-1">What went well?</label>
                              <textarea
                                rows={2}
                                value={whatWentWell}
                                onChange={(e) => setWhatWentWell(e.target.value)}
                                className="w-full desk-input p-2 text-xs resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[#8a8f9d] mb-1">What went wrong?</label>
                              <textarea
                                rows={2}
                                value={whatWentWrong}
                                onChange={(e) => setWhatWentWrong(e.target.value)}
                                className="w-full desk-input p-2 text-xs resize-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[#8a8f9d] mb-1">Improvements for tomorrow</label>
                              <textarea
                                rows={2}
                                value={improvements}
                                onChange={(e) => setImprovements(e.target.value)}
                                className="w-full desk-input p-2 text-xs resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[#8a8f9d] mb-1">Mindset</label>
                              <textarea
                                rows={2}
                                value={mindset}
                                onChange={(e) => setMindset(e.target.value)}
                                className="w-full desk-input p-2 text-xs resize-none"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setActiveReviewDate(null)}
                              className="px-3 py-1 text-[#8a8f9d]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveReview(day.date)}
                              className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 text-white font-medium cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" /> Save Notes
                            </button>
                          </div>
                        </div>
                      ) : review ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#8a8f9d]">
                          {review.whatWentWell && <div><strong className="text-[#f0f1f4]">Well:</strong> {review.whatWentWell}</div>}
                          {review.whatWentWrong && <div><strong className="text-[#f0f1f4]">Wrong:</strong> {review.whatWentWrong}</div>}
                          {review.improvements && <div><strong className="text-[#f0f1f4]">Improve:</strong> {review.improvements}</div>}
                          {review.mindset && <div><strong className="text-[#f0f1f4]">Mindset:</strong> {review.mindset}</div>}
                        </div>
                      ) : (
                        <p className="text-[#5e6370] italic">No review recorded for this day.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
