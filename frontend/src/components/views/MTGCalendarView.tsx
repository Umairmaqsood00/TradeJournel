import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MTGTrade, MTGSettings } from '../../types/journal';

interface MTGCalendarViewProps {
  mtgTrades: MTGTrade[];
  mtgSettings: MTGSettings;
}

export const MTGCalendarView: React.FC<MTGCalendarViewProps> = ({
  mtgTrades,
  mtgSettings,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currencySymbol = mtgSettings.currencySymbol || '$';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map trades by date string YYYY-MM-DD
  const tradesByDate = new Map<string, MTGTrade[]>();
  mtgTrades.forEach((t) => {
    if (!tradesByDate.has(t.date)) {
      tradesByDate.set(t.date, []);
    }
    tradesByDate.get(t.date)!.push(t);
  });

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrades = tradesByDate.get(dayStr) || [];
    const dayPL = dayTrades.reduce((acc, t) => acc + t.profit, 0);
    calendarCells.push({ day, dateStr: dayStr, dayTrades, dayPL });
  }

  const selectedDayTrades = selectedDate ? tradesByDate.get(selectedDate) || [] : [];
  const selectedDayPL = selectedDayTrades.reduce((acc, t) => acc + t.profit, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="desk-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            MTG Monthly Calendar
          </h2>
          <p className="text-xs sm:text-sm text-[#8a8f9d] mt-1">Daily net P/L breakdown for MTG recovery trading sessions</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-white min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="desk-card p-4 sm:p-6 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 text-center text-xs font-mono font-bold text-[#8a8f9d] uppercase">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days (Spacious Box Height) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-transparent rounded-lg" />;
            }

            const { day, dayTrades, dayPL } = cell;
            const hasTrades = dayTrades.length > 0;
            const isProfit = dayPL >= 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => hasTrades && setSelectedDate(cell.dateStr)}
                className={`h-24 sm:h-28 p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                  hasTrades
                    ? isProfit
                      ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60'
                    : 'bg-[#0F1114] border-[#252930]/60 hover:border-[#353b47]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-normal text-white">{day}</span>
                  {hasTrades && (
                    <span className="text-[10px] text-[#8a8f9d] font-mono px-1.5 py-0.5 rounded bg-black/40">
                      {dayTrades.length} Trades
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-normal font-mono ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{currencySymbol}{dayPL.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#5e6370] text-center font-mono">No trades</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Trade Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full desk-card p-5 space-y-4 border border-[#2A2F3A] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#252930] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedDate} Trading Session</h3>
                <p className="text-xs text-[#8a8f9d] mt-0.5">{selectedDayTrades.length} trades executed</p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 rounded-lg hover:bg-[#1E222A] text-[#8a8f9d] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs font-mono p-3 rounded-lg bg-[#090A0C] border border-[#252930]">
              <span className="text-[#8a8f9d]">Session Net P/L:</span>
              <span className={`text-sm font-normal ${selectedDayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedDayPL >= 0 ? '+' : ''}{currencySymbol}{selectedDayPL.toFixed(2)}
              </span>
            </div>

            {/* Day Trades List with Spacious Rows & Normal Font Weight */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedDayTrades.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] flex items-center justify-between font-mono text-xs hover:bg-[#13161C] transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-white font-normal flex items-center gap-2">
                      <span>Trade #{t.number}</span>
                      <span className="text-[#8a8f9d] text-[11px]">Cycle {t.cycle}</span>
                    </div>
                    <div className="text-[#8a8f9d] text-[11px]">{t.time}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${t.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                      {t.result}
                    </span>
                    <span className={`text-sm font-normal ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.profit >= 0 ? '+' : ''}{currencySymbol}{t.profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
