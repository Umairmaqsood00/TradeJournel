import React from 'react';
import { History, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import type { MTGTrade, MTGSettings } from '../../types/journal';

interface MTGTradeHistoryViewProps {
  mtgTrades: MTGTrade[];
  mtgSettings: MTGSettings;
  onDeleteMTGTrade: (id: string) => void;
  onClearMTGTrades: () => void;
}

export const MTGTradeHistoryView: React.FC<MTGTradeHistoryViewProps> = ({
  mtgTrades,
  mtgSettings,
  onDeleteMTGTrade,
  onClearMTGTrades,
}) => {
  const currencySymbol = mtgSettings.currencySymbol || '$';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="desk-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#f0f1f4] flex items-center gap-2.5">
            <History className="w-5 h-5 text-blue-400" />
            MTG Trades Ledger
          </h2>
          <p className="text-sm text-[#8a8f9d] mt-1">
            Complete execution log for Martingale recovery cycles ({mtgTrades.length} trades recorded)
          </p>
        </div>

        {mtgTrades.length > 0 && (
          <button
            onClick={onClearMTGTrades}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset MTG History</span>
          </button>
        )}
      </div>

      {/* Trades Table */}
      <div className="desk-card p-5 overflow-hidden">
        {mtgTrades.length === 0 ? (
          <div className="py-12 text-center text-[#8a8f9d] text-sm">
            No MTG trades recorded yet. Start a session in the Recovery Calculator!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#252930] text-[#8a8f9d] uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-4 px-4">#</th>
                  <th className="py-4 px-4">Date / Time</th>
                  <th className="py-4 px-4">Cycle</th>
                  <th className="py-4 px-4 text-right">Trade Amount</th>
                  <th className="py-4 px-4 text-center">Result</th>
                  <th className="py-4 px-4 text-right">Trade P/L</th>
                  <th className="py-4 px-4 text-right">Cycle Net P/L</th>
                  <th className="py-4 px-4 text-right">Balance</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252930]/60">
                {mtgTrades.map((t) => {
                  const isWin = t.result === 'WIN';
                  return (
                    <tr key={t.id} className="hover:bg-[#181B22]/80 transition-colors">
                      <td className="py-4 px-4 align-middle text-[#8a8f9d]">#{t.number}</td>
                      <td className="py-4 px-4 align-middle text-white font-normal">
                        {t.date} <span className="text-[#8a8f9d] ml-1">{t.time}</span>
                      </td>
                      <td className="py-4 px-4 align-middle text-[#8a8f9d]">
                        Cycle {t.cycle}
                      </td>
                      <td className="py-4 px-4 align-middle text-right text-white font-normal text-sm">
                        {currencySymbol}{t.tradeAmount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 align-middle text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 min-w-[56px] px-2.5 py-1 rounded-md text-[11px] font-medium uppercase border tracking-wider ${
                            isWin
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isWin ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {t.result}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-4 align-middle text-right font-normal text-sm ${
                          t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.profit >= 0 ? '+' : ''}{currencySymbol}{t.profit.toFixed(2)}
                      </td>
                      <td
                        className={`py-4 px-4 align-middle text-right font-normal text-sm ${
                          t.cyclePL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.cyclePL >= 0 ? '+' : ''}{currencySymbol}{t.cyclePL.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 align-middle text-right text-white font-normal text-sm">
                        {currencySymbol}{t.balance.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 align-middle text-center">
                        <button
                          onClick={() => onDeleteMTGTrade(t.id)}
                          className="p-1 rounded text-[#8a8f9d] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
