import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Trade, JournalSettings } from '../../types/journal';

interface CalendarViewProps {
  trades: Trade[];
  settings: JournalSettings;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ trades, settings }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const tradesByDate = React.useMemo(() => {
    const map = new Map<string, Trade[]>();
    for (const t of trades) {
      if (!map.has(t.date)) {
        map.set(t.date, []);
      }
      map.get(t.date)!.push(t);
    }
    return map;
  }, [trades]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const selectedDayTrades = selectedDate ? tradesByDate.get(selectedDate) || [] : [];
  const selectedDayPL = selectedDayTrades.reduce((acc, t) => acc + t.profit, 0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="desk-card p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#f0f1f4]">Monthly Trading Calendar</h2>
          <p className="text-xs text-[#8a8f9d]">Session outcome history</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button onClick={prevMonth} className="p-1 rounded text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#191C21]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-[#f0f1f4] min-w-[120px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-1 rounded text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#191C21]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="desk-card p-4 space-y-2">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase font-mono font-semibold text-[#8a8f9d] pb-2 border-b border-[#252930]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 rounded bg-[#090A0C]/40 opacity-20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTrades = tradesByDate.get(dateStr) || [];
            const dayPL = dayTrades.reduce((acc, t) => acc + t.profit, 0);

            const hasTrades = dayTrades.length > 0;
            const isProfitable = dayPL > 0;
            const isLoss = dayPL < 0;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-16 p-1.5 rounded border flex flex-col justify-between transition-colors cursor-pointer text-xs ${
                  hasTrades
                    ? isProfitable
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      : isLoss
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                      : 'bg-[#14171B] border-[#252930]'
                    : 'bg-[#090A0C] border-[#252930]/40 text-[#5e6370]'
                }`}
              >
                <div className="font-mono text-[10px] text-[#8a8f9d]">{dayNum}</div>
                {hasTrades ? (
                  <div className="text-right font-mono text-[11px] font-bold">
                    {dayPL >= 0 ? '+' : ''}{settings.currencySymbol}{dayPL.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-[9px] text-[#5e6370] text-right">No trades</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-sm w-full desk-card p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#252930] pb-2">
              <span className="text-xs font-bold text-[#f0f1f4] font-mono">{selectedDate} Trades</span>
              <button onClick={() => setSelectedDate(null)} className="text-[#8a8f9d] hover:text-[#f0f1f4]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs font-mono">Total P/L: <strong className={selectedDayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{selectedDayPL >= 0 ? '+' : ''}{settings.currencySymbol}{selectedDayPL.toFixed(2)}</strong></div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {selectedDayTrades.map((t) => (
                <div key={t.id} className="p-2 rounded bg-[#090A0C] border border-[#252930] flex justify-between">
                  <span>{t.pair} {t.direction}</span>
                  <span className={t.profit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{t.profit >= 0 ? '+' : ''}{settings.currencySymbol}{t.profit.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
