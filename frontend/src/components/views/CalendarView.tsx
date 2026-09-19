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

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 sm:h-16 rounded bg-[#090A0C]/40 opacity-20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTrades = tradesByDate.get(dateStr) || [];
            const dayPL = dayTrades.reduce((acc, t) => acc + t.profit, 0);

            const hasTrades = dayTrades.length > 0;
            const isProfitable = dayPL > 0;
            const isLoss = dayPL < 0;

            const formattedPL = Math.abs(dayPL) >= 1000
              ? `${dayPL >= 0 ? '+' : '-'}${settings.currencySymbol}${(Math.abs(dayPL) / 1000).toFixed(1)}k`
              : `${dayPL >= 0 ? '+' : ''}${settings.currencySymbol}${dayPL.toFixed(2)}`;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-14 sm:h-16 p-1 sm:p-1.5 rounded border flex flex-col justify-between transition-colors cursor-pointer overflow-hidden min-w-0 ${
                  hasTrades
                    ? isProfitable
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      : isLoss
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                      : 'bg-[#14171B] border-[#252930]'
                    : 'bg-[#090A0C] border-[#252930]/40 text-[#5e6370]'
                }`}
              >
                <div className="font-mono text-[9px] sm:text-[10px] text-[#8a8f9d]">{dayNum}</div>
                {hasTrades ? (
                  <div
                    className="text-right font-mono text-[9px] sm:text-[11px] font-bold truncate leading-tight"
                    title={`${dayPL >= 0 ? '+' : ''}${settings.currencySymbol}${dayPL.toFixed(2)}`}
                  >
                    {formattedPL}
                  </div>
                ) : (
                  <div className="text-[8px] sm:text-[9px] text-[#5e6370] text-right truncate">No trades</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full desk-card p-5 space-y-4 border border-[#2A2F3A] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#252930] pb-3">
              <span className="text-sm font-bold text-white font-mono">{selectedDate} Trades</span>
              <button onClick={() => setSelectedDate(null)} className="p-1 rounded text-[#8a8f9d] hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs font-mono p-3 rounded-lg bg-[#090A0C] border border-[#252930] flex justify-between items-center">
              <span className="text-[#8a8f9d]">Session Total P/L:</span>
              <span className={`text-sm font-normal ${selectedDayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedDayPL >= 0 ? '+' : ''}{settings.currencySymbol}{selectedDayPL.toFixed(2)}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs pr-1">
              {selectedDayTrades.map((t) => (
                <div key={t.id} className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] flex justify-between items-center hover:bg-[#13161C] transition-colors">
                  <span className="text-white font-normal">{t.pair} <span className={t.direction === 'CALL' ? 'text-emerald-400 ml-1' : 'text-rose-400 ml-1'}>{t.direction}</span></span>
                  <span className={`font-normal text-sm ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.profit >= 0 ? '+' : ''}{settings.currencySymbol}{t.profit.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
