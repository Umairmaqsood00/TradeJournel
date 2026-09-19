import React, { useState, useEffect, useRef } from 'react';
import { Calculator, RotateCcw, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import type { JournalSettings } from '../../types/journal';

interface RecoveryCalculatorViewProps {
  settings: JournalSettings;
  onSaveSettings: (newSettings: JournalSettings) => Promise<void> | void;
}

export interface CalcHistoryItem {
  id: string;
  number: number;
  cycle: number;
  tradeAmount: number;
  result: 'WIN' | 'LOSS';
  profit: number;
  cyclePL: number;
  balance: number;
  timestamp: string;
}

const CALC_HISTORY_KEY = 'trade_recovery_calc_history_v1';

export const RecoveryCalculatorView: React.FC<RecoveryCalculatorViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  // Safe fallbacks for settings
  const safeStartingBalance = Number(settings?.startingBalance ?? 100);
  const safeDefaultAmount = Number(settings?.defaultAmount ?? 2);
  const safeDefaultPayout = Number(settings?.defaultPayout ?? 80);
  const currencySymbol = settings?.currencySymbol || '$';

  // String input states to avoid leading zero issues (e.g. 0100) when backspacing
  const [initialBalanceStr, setInitialBalanceStr] = useState<string>(String(safeStartingBalance));
  const [startingTradeStr, setStartingTradeStr] = useState<string>(String(safeDefaultAmount));
  const [payoutStr, setPayoutStr] = useState<string>(String(safeDefaultPayout));
  const [targetStr, setTargetStr] = useState<string>('5');
  const [nextTradeStr, setNextTradeStr] = useState<string>(String(safeDefaultAmount));

  // Session stats
  const [cycle, setCycle] = useState<number>(1);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [cycleProfit, setCycleProfit] = useState<number>(0);
  const [cycleRisk, setCycleRisk] = useState<number>(0);
  const [maxTrade, setMaxTrade] = useState<number>(0);

  // Dedicated local calculator history with defensive parsing
  const [calcHistory, setCalcHistory] = useState<CalcHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CALC_HISTORY_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => ({
        id: String(item.id || `calc_${Date.now()}_${Math.random()}`),
        number: Number(item.number || 0),
        cycle: Number(item.cycle || 1),
        tradeAmount: Number(item.tradeAmount || 0),
        result: item.result === 'WIN' ? 'WIN' : 'LOSS',
        profit: Number(item.profit || 0),
        cyclePL: Number(item.cyclePL !== undefined ? item.cyclePL : item.profit || 0),
        balance: Number(item.balance || 0),
        timestamp: String(item.timestamp || ''),
      }));
    } catch (e) {
      return [];
    }
  });

  const [totalTradesCount, setTotalTradesCount] = useState<number>(() => {
    return calcHistory.length > 0 ? Math.max(...calcHistory.map((i) => i.number)) : 0;
  });

  // Ref for auto-focusing next trade input
  const nextTradeInputRef = useRef<HTMLInputElement>(null);

  // Sync inputs with settings when settings change
  useEffect(() => {
    setInitialBalanceStr(String(safeStartingBalance));
    setStartingTradeStr(String(safeDefaultAmount));
    setPayoutStr(String(safeDefaultPayout));
  }, [safeStartingBalance, safeDefaultAmount, safeDefaultPayout]);

  // Persist local calculator trade history
  useEffect(() => {
    try {
      localStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(calcHistory));
    } catch (e) {
      console.error('Failed to save calculator history:', e);
    }
  }, [calcHistory]);

  const focusNextTradeInput = () => {
    setTimeout(() => {
      if (nextTradeInputRef.current) {
        nextTradeInputRef.current.focus();
        nextTradeInputRef.current.select();
      }
    }, 50);
  };

  const handleStartSession = () => {
    const initBal = parseFloat(initialBalanceStr) || 0;
    const startTrd = parseFloat(startingTradeStr) || 0;
    const py = parseFloat(payoutStr) || 0;

    const updatedSettings: JournalSettings = {
      ...settings,
      startingBalance: initBal,
      defaultAmount: startTrd,
      defaultPayout: py,
    };
    onSaveSettings(updatedSettings);

    setNextTradeStr(startingTradeStr);
    setCycle(1);
    setConsecutiveLosses(0);
    setCompletedCycles(0);
    setCycleProfit(0);
    setCycleRisk(0);
    setMaxTrade(0);
    // Preserves calcHistory so trade history is NOT deleted on Start Session!

    focusNextTradeInput();
  };

  const handleRecordTrade = async (result: 'win' | 'loss') => {
    const tradeAmount = parseFloat(nextTradeStr);
    const payout = parseFloat(payoutStr) || 0;
    const startingTrade = parseFloat(startingTradeStr) || 0;
    const currentBalance = safeStartingBalance;

    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      alert('Please enter a valid trade amount.');
      focusNextTradeInput();
      return;
    }

    if (tradeAmount > currentBalance) {
      alert('Trade amount cannot be greater than your current balance.');
      focusNextTradeInput();
      return;
    }

    let profitLoss = 0;
    let currentCyclePL = 0;
    let newConsecutiveLosses = consecutiveLosses;
    let newCycle = cycle;
    let newCompletedCycles = completedCycles;
    let newCycleRisk = cycleRisk;
    let nextCalculatedTrade = startingTrade;

    if (result === 'win') {
      profitLoss = Math.round(tradeAmount * (payout / 100) * 100) / 100;
      currentCyclePL = Math.round((cycleProfit + profitLoss) * 100) / 100;

      newCompletedCycles += 1;
      newCycle += 1;
      newConsecutiveLosses = 0;
      newCycleRisk = 0;
      nextCalculatedTrade = startingTrade;

      // Cycle completes upon win
      setCycleProfit(0);
    } else {
      profitLoss = -Math.abs(tradeAmount);
      currentCyclePL = Math.round((cycleProfit + profitLoss) * 100) / 100;

      newCycleRisk += tradeAmount;
      newConsecutiveLosses += 1;
      nextCalculatedTrade = Math.round(tradeAmount * 2 * 100) / 100;

      setCycleProfit(currentCyclePL);
    }

    const newBalance = Math.round((currentBalance + profitLoss) * 100) / 100;
    const newTotalTrades = totalTradesCount + 1;

    if (tradeAmount > maxTrade) {
      setMaxTrade(tradeAmount);
    }

    setCycle(newCycle);
    setConsecutiveLosses(newConsecutiveLosses);
    setCompletedCycles(newCompletedCycles);
    setCycleRisk(newCycleRisk);
    setTotalTradesCount(newTotalTrades);
    setNextTradeStr(String(nextCalculatedTrade));

    // Add to isolated local calculator history with cyclePL
    const newHistoryItem: CalcHistoryItem = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      number: newTotalTrades,
      cycle: cycle,
      tradeAmount: tradeAmount,
      result: result === 'win' ? 'WIN' : 'LOSS',
      profit: profitLoss,
      cyclePL: currentCyclePL,
      balance: newBalance,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    };

    setCalcHistory((prev) => [newHistoryItem, ...prev]);

    // Update global account balance so balance changes across the whole website
    const updatedSettings: JournalSettings = {
      ...settings,
      startingBalance: newBalance,
    };
    await onSaveSettings(updatedSettings);

    focusNextTradeInput();
  };

  const handleResetSession = () => {
    if (window.confirm('Reset cycle parameters to starting trade? (Your trade history will be preserved)')) {
      setNextTradeStr(startingTradeStr);
      setCycle(1);
      setConsecutiveLosses(0);
      setCycleProfit(0);
      setCycleRisk(0);
      focusNextTradeInput();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all calculator trade history records? This action cannot be undone.')) {
      setCalcHistory([]);
      localStorage.removeItem(CALC_HISTORY_KEY);
      setTotalTradesCount(0);
      setCompletedCycles(0);
      setConsecutiveLosses(0);
      setCycle(1);
      setCycleProfit(0);
      setCycleRisk(0);
      setMaxTrade(0);
    }
  };

  // Calculations for display
  const currentBalance = safeStartingBalance;
  const startingTradeNum = parseFloat(startingTradeStr) || 0;
  const payoutNum = parseFloat(payoutStr) || 0;
  const targetNum = parseFloat(targetStr) || 0;
  const nextTradeNum = parseFloat(nextTradeStr) || 0;

  // Session P/L accumulated directly from calculator trade history
  const todayPL = Math.round(calcHistory.reduce((acc, item) => acc + (item.profit || 0), 0) * 100) / 100;

  const expectedWinProfit = Math.round(nextTradeNum * (payoutNum / 100) * 100) / 100;
  const basicCycleProfit = startingTradeNum * (payoutNum / 100);
  let estimatedCyclesToTP = 0;
  if (basicCycleProfit > 0 && todayPL < targetNum) {
    estimatedCyclesToTP = Math.ceil((targetNum - todayPL) / basicCycleProfit);
  }

  let progressPct = 0;
  if (targetNum > 0) {
    progressPct = (todayPL / targetNum) * 100;
  }
  progressPct = Math.max(0, Math.min(progressPct, 100));

  const isRiskWarning = nextTradeNum > currentBalance * 0.10;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 font-sans">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0f1f4] flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-400" />
            Trade Recovery Calculator
          </h1>
          <p className="text-sm text-[#8a8f9d] mt-1">
            Track recovery cycles, balance, daily TP targets, and custom trade sizing with unified website balance.
          </p>
        </div>
        <button
          onClick={handleResetSession}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded bg-[#14171B] border border-[#252930] text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#191C21] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Parameters
        </button>
      </div>

      {/* Setup & Execution Card */}
      <div className="desk-card p-5 space-y-5">
        <h2 className="text-sm font-semibold text-[#8a8f9d] uppercase tracking-wider">Session Parameters & Trade Panel</h2>
        
        {/* Setup Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8a8f9d] mb-1.5">Initial Balance ({currencySymbol})</label>
            <input
              type="number"
              step="1"
              value={initialBalanceStr}
              onChange={(e) => setInitialBalanceStr(e.target.value)}
              placeholder="100"
              className="w-full desk-input px-3.5 py-2.5 text-sm font-numeric font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a8f9d] mb-1.5">Starting Trade ({currencySymbol})</label>
            <input
              type="number"
              step="1"
              value={startingTradeStr}
              onChange={(e) => setStartingTradeStr(e.target.value)}
              placeholder="2"
              className="w-full desk-input px-3.5 py-2.5 text-sm font-numeric font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a8f9d] mb-1.5">Payout (%)</label>
            <input
              type="number"
              step="1"
              value={payoutStr}
              onChange={(e) => setPayoutStr(e.target.value)}
              placeholder="80"
              className="w-full desk-input px-3.5 py-2.5 text-sm font-numeric font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a8f9d] mb-1.5">Daily Profit Target ({currencySymbol})</label>
            <input
              type="number"
              step="1"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              placeholder="5"
              className="w-full desk-input px-3.5 py-2.5 text-sm font-numeric font-bold"
            />
          </div>
        </div>

        {/* Trade Execution Bar & Vibrant Buttons */}
        <div className="pt-4 border-t border-[#252930] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="w-full md:w-auto flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-[#f0f1f4] mb-1">Next Trade Amount ({currencySymbol})</label>
            <input
              ref={nextTradeInputRef}
              type="number"
              step="1"
              value={nextTradeStr}
              onChange={(e) => setNextTradeStr(e.target.value)}
              placeholder="2"
              className="w-full desk-input px-4 py-2.5 text-base font-numeric font-extrabold text-emerald-400 bg-[#090A0C] border-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Polished Vibrant Buttons matching screenshot #4 */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleStartSession}
              className="flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-bold bg-[#1f6feb] hover:bg-[#1f6feb]/90 text-white transition-all shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
            >
              Start Session
            </button>

            <button
              onClick={() => handleRecordTrade('win')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-[#059669] hover:bg-[#059669]/90 text-white transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              WIN
            </button>

            <button
              onClick={() => handleRecordTrade('loss')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-[#e11d48] hover:bg-[#e11d48]/90 text-white transition-all shadow-md shadow-rose-500/20 active:scale-98 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              LOSS
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="desk-card p-5 space-y-6">
        <h2 className="text-sm font-semibold text-[#8a8f9d] uppercase tracking-wider">Session Performance Overview</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Current Balance</div>
            <div className="text-xl font-bold font-numeric text-blue-400 mt-1">
              {currencySymbol}{currentBalance.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Today's P/L</div>
            <div className={`text-xl font-bold font-numeric mt-1 ${todayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {todayPL >= 0 ? '+' : ''}{currencySymbol}{todayPL.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Current Trade</div>
            <div className="text-xl font-bold font-numeric text-[#f0f1f4] mt-1">
              {currencySymbol}{nextTradeNum.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Current Cycle</div>
            <div className="text-xl font-bold font-numeric text-[#f0f1f4] mt-1">{cycle}</div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Consecutive Losses</div>
            <div className="text-xl font-bold font-numeric text-rose-400 mt-1">{consecutiveLosses}</div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Total Trades</div>
            <div className="text-xl font-bold font-numeric text-[#f0f1f4] mt-1">{totalTradesCount}</div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Maximum Trade</div>
            <div className="text-xl font-bold font-numeric text-[#f0f1f4] mt-1">
              {currencySymbol}{maxTrade.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Cycle P/L</div>
            <div className={`text-xl font-bold font-numeric mt-1 ${cycleProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cycleProfit >= 0 ? '+' : ''}{currencySymbol}{cycleProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Daily Target Progress Bar */}
        <div className="pt-4 border-t border-[#252930] space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-[#f0f1f4] font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Daily Take Profit (TP) Progress
            </span>
            <span className="font-numeric text-[#8a8f9d]">
              {currencySymbol}{todayPL.toFixed(2)} / {currencySymbol}{targetNum.toFixed(2)} ({progressPct.toFixed(1)}%)
            </span>
          </div>

          <div className="w-full bg-[#090A0C] border border-[#252930] rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Risk Warning Alert */}
        {isRiskWarning && (
          <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">High Risk Warning:</span> Your next trade size ({currencySymbol}{nextTradeNum.toFixed(2)}) exceeds 10% of your current account balance. A losing streak can exponentially increase capital exposure.
            </div>
          </div>
        )}
      </div>

      {/* Cycle Analytics Card */}
      <div className="desk-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#f0f1f4]">Cycle Information</h3>
          <p className="text-xs text-[#8a8f9d] mt-1">
            A cycle starts with your first trade and ends when you win. After a winning trade, the cycle resets to the starting trade.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Money Risked This Cycle</div>
            <div className="text-xl font-bold font-numeric text-rose-400 mt-1">
              {currencySymbol}{cycleRisk.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Expected Win Profit</div>
            <div className="text-xl font-bold font-numeric text-emerald-400 mt-1">
              {currencySymbol}{expectedWinProfit.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Cycles Completed</div>
            <div className="text-xl font-bold font-numeric text-[#f0f1f4] mt-1">{completedCycles}</div>
          </div>

          <div className="bg-[#0F1114] border border-[#252930] p-4 rounded">
            <div className="text-xs font-medium text-[#8a8f9d]">Estimated Cycles to TP</div>
            <div className="text-xl font-bold font-numeric text-blue-400 mt-1">{estimatedCyclesToTP}</div>
          </div>
        </div>
      </div>

      {/* Local Trade History Table with Clear History Button */}
      <div className="desk-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f1f4]">Trade History</h3>
          {calcHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {calcHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8a8f9d] border border-dashed border-[#252930] rounded">
            No calculator executions recorded yet. Click WIN or LOSS above to record trades in this section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="text-[#8a8f9d] border-b border-[#252930]">
                <tr>
                  <th className="px-3 py-2.5 font-bold">#</th>
                  <th className="px-3 py-2.5 font-bold">Cycle</th>
                  <th className="px-3 py-2.5 font-bold">Trade</th>
                  <th className="px-3 py-2.5 font-bold">Result</th>
                  <th className="px-3 py-2.5 font-bold">Trade P/L</th>
                  <th className="px-3 py-2.5 font-bold">Cycle P/L</th>
                  <th className="px-3 py-2.5 font-bold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252930]">
                {calcHistory.map((item) => {
                  const tradeAmt = Number(item.tradeAmount || 0);
                  const prft = Number(item.profit || 0);
                  const cycPL = Number(item.cyclePL !== undefined ? item.cyclePL : prft);
                  const bal = Number(item.balance || 0);

                  return (
                    <tr key={item.id} className="hover:bg-[#14171B]/60 transition-colors">
                      <td className="px-3 py-2.5 font-numeric text-[#8a8f9d]">{item.number}</td>
                      <td className="px-3 py-2.5 font-numeric text-[#8a8f9d]">{item.cycle}</td>
                      <td className="px-3 py-2.5 font-numeric font-bold text-[#f0f1f4]">
                        {currencySymbol}{tradeAmt.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-bold ${item.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.result}
                        </span>
                      </td>
                      <td className={`px-3 py-2.5 font-numeric font-bold ${prft >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {prft >= 0 ? '+' : ''}{currencySymbol}{prft.toFixed(2)}
                      </td>
                      <td className={`px-3 py-2.5 font-numeric font-bold ${cycPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {cycPL >= 0 ? '+' : ''}{currencySymbol}{cycPL.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 font-numeric font-bold text-[#f0f1f4]">
                        {currencySymbol}{bal.toFixed(2)}
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
