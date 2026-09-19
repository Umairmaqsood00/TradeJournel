import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import type { Trade, JournalSettings } from '../../types/journal';

interface TradeHistoryViewProps {
  trades: Trade[];
  settings: JournalSettings;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
}

export const TradeHistoryView: React.FC<TradeHistoryViewProps> = ({
  trades,
  settings,
  onEditTrade,
  onDeleteTrade,
}) => {
  const [search, setSearch] = useState<string>('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [pairFilter, setPairFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PL_HIGH' | 'PL_LOW'>('NEWEST');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const uniquePairs = useMemo(() => {
    const pairs = new Set(trades.map((t) => t.pair));
    return Array.from(pairs).sort();
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades
      .filter((t) => {
        if (resultFilter !== 'ALL' && t.result !== resultFilter) return false;
        if (pairFilter !== 'ALL' && t.pair !== pairFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchPair = t.pair.toLowerCase().includes(q);
          const matchStrategy = (t.strategy || '').toLowerCase().includes(q);
          const matchNotes = (t.notes || '').toLowerCase().includes(q);
          const matchEmotion = t.emotion.toLowerCase().includes(q);
          const matchDate = t.date.includes(q);
          if (!matchPair && !matchStrategy && !matchNotes && !matchEmotion && !matchDate) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return b.createdAt - a.createdAt;
        if (sortBy === 'OLDEST') return a.createdAt - b.createdAt;
        if (sortBy === 'PL_HIGH') return b.profit - a.profit;
        if (sortBy === 'PL_LOW') return a.profit - b.profit;
        return 0;
      });
  }, [trades, resultFilter, pairFilter, search, sortBy]);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="desk-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#f0f1f4]">Trade Ledger</h2>
            <p className="text-sm text-[#8a8f9d]">Audit execution history and performance logs</p>
          </div>
          <div className="text-sm font-mono text-[#8a8f9d]">
            Records: <strong className="text-[#f0f1f4]">{filteredTrades.length}</strong> / {trades.length}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#5e6370] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pair, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full desk-input pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as any)}
            className="desk-input px-3 py-2 text-sm"
          >
            <option value="ALL">All Results (WIN/LOSS)</option>
            <option value="WIN">WIN Only</option>
            <option value="LOSS">LOSS Only</option>
          </select>

          <select
            value={pairFilter}
            onChange={(e) => setPairFilter(e.target.value)}
            className="desk-input px-3 py-2 text-sm font-mono"
          >
            <option value="ALL">All Pairs</option>
            {uniquePairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="desk-input px-3 py-2 text-sm"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="PL_HIGH">Profit High &rarr; Low</option>
            <option value="PL_LOW">Loss High &rarr; Low</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredTrades.length === 0 ? (
        <div className="desk-card p-10 text-center text-sm text-[#5e6370]">No matching trades found.</div>
      ) : (
        <div className="desk-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#f0f1f4]">
              <thead className="bg-[#0F1114] text-[#8a8f9d] uppercase text-xs font-mono border-b border-[#252930]">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Pair</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">P/L</th>
                  <th className="py-3 px-4">Emotion</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252930]/60 font-mono text-xs sm:text-sm">
                {filteredTrades.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#181B22]/80 transition-colors border-b border-[#252930]/60"
                  >
                    <td className="py-4 px-4 align-middle font-sans text-xs text-[#8a8f9d]">
                      <div className="text-white font-normal">{t.date}</div>
                      <div className="text-xs text-[#8a8f9d] font-mono">{t.time}</div>
                    </td>
                    <td className="py-4 px-4 align-middle font-normal text-white">{t.pair}</td>
                    <td className="py-4 px-4 align-middle">
                      <span className={t.direction === 'CALL' ? 'text-emerald-400 font-normal' : 'text-rose-400 font-normal'}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-middle text-white font-normal">{settings.currencySymbol}{t.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 align-middle">
                      <span className={`inline-flex items-center justify-center min-w-[56px] px-2.5 py-1 rounded-md text-[11px] font-medium uppercase border tracking-wider ${t.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                        {t.result}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-middle font-normal">
                      <span className={t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {t.profit >= 0 ? '+' : ''}{settings.currencySymbol}{t.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-middle font-sans text-[#8a8f9d] font-normal">{t.emotion}</td>
                    <td className="py-4 px-4 align-middle font-sans">
                      {t.followedPlan ? (
                        <span className="text-emerald-400 font-normal">Yes</span>
                      ) : (
                        <span className="text-amber-400 font-normal">No</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-middle text-right font-sans">
                      <div className="flex items-center justify-end gap-2.5">
                        {t.screenshotUrl && (
                          <button
                            onClick={() => setSelectedScreenshot(t.screenshotUrl!)}
                            className="p-1 text-[#8a8f9d] hover:text-[#f0f1f4]"
                            title="View Chart Screenshot"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditTrade(t)}
                          className="p-1 text-[#8a8f9d] hover:text-[#f0f1f4]"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTrade(t.id)}
                          className="p-1 text-[#5e6370] hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full desk-card p-2 border border-[#252930]">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-3 right-3 p-1.5 rounded bg-black/70 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={selectedScreenshot} alt="Chart Screenshot" className="w-full h-auto max-h-[80vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
};
