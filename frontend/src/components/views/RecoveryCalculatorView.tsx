import React, { useState, useEffect, useRef } from 'react';
import { Calculator, RotateCcw, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import type { MTGTrade, MTGSettings } from '../../types/journal';

interface RecoveryCalculatorViewProps {
  mtgTrades: MTGTrade[];
  mtgSettings: MTGSettings;
  onSaveMTGTrade: (trade: MTGTrade) => Promise<void> | void;
  onSaveMTGSettings: (newSettings: MTGSettings) => void;
  onClearMTGTrades: () => void;
}

export const RecoveryCalculatorView: React.FC<RecoveryCalculatorViewProps> = ({
  mtgTrades,
  mtgSettings,
  onSaveMTGTrade,
  onSaveMTGSettings,
  onClearMTGTrades,
}) => {
  const safeStartingBalance = Number(mtgSettings?.startingBalance) || 100;
  const safeStartingTrade = Number(mtgSettings?.startingTrade) || 2;
  const safeDefaultPayout = Number(mtgSettings?.defaultPayout) || 85;
  const safeDailyTarget = Number(mtgSettings?.dailyProfitTarget) || 10;
  const currencySymbol = mtgSettings?.currencySymbol || '$';

  // Integer string input states for clean editing
  const [initialBalanceStr, setInitialBalanceStr] = useState<string>(String(safeStartingBalance));
  const [startingTradeStr, setStartingTradeStr] = useState<string>(String(safeStartingTrade));
  const [payoutStr, setPayoutStr] = useState<string>(String(safeDefaultPayout));
  const [targetStr, setTargetStr] = useState<string>(String(safeDailyTarget));
  const [nextTradeStr, setNextTradeStr] = useState<string>(String(safeStartingTrade));

  // Session state
  const [sessionInitialBalance, setSessionInitialBalance] = useState<number>(safeStartingBalance);
  const [cycle, setCycle] = useState<number>(1);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [currentLossesInCycle, setCurrentLossesInCycle] = useState<number[]>([]);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  const nextTradeInputRef = useRef<HTMLInputElement>(null);

  // Sync settings when updated externally
  useEffect(() => {
    if (!isSessionActive) {
      setInitialBalanceStr(String(safeStartingBalance));
      setStartingTradeStr(String(safeStartingTrade));
      setPayoutStr(String(safeDefaultPayout));
      setTargetStr(String(safeDailyTarget));
      setNextTradeStr(String(safeStartingTrade));
      setSessionInitialBalance(safeStartingBalance);
    }
  }, [mtgSettings, isSessionActive]);

  // Derived current balance & PnL
  const currentBalance = mtgTrades.length > 0 ? mtgTrades[0].balance : sessionInitialBalance;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = mtgTrades.filter((t) => t.date === todayStr);
  const todayPL = todayTrades.reduce((acc, t) => acc + t.profit, 0);

  const currentTradeVal = Number(nextTradeStr) || safeStartingTrade;
  const payoutVal = Number(payoutStr) || safeDefaultPayout;
  const targetVal = Number(targetStr) || safeDailyTarget;

  // Max trade stake executed in history
  const maxTradeVal = mtgTrades.length > 0
    ? Math.max(...mtgTrades.map((t) => t.tradeAmount))
    : 0;

  // Cycle stats
  const cycleRisk = currentLossesInCycle.reduce((sum, v) => sum + v, 0);
  const cycleProfit = -cycleRisk;
  const expectedWinProfit = Math.round(currentTradeVal * (payoutVal / 100) * 100) / 100;
  const completedCycles = mtgTrades.filter((t) => t.result === 'WIN').length;

  // Estimated cycles to reach TP
  const basicCycleProfit = (Number(startingTradeStr) || safeStartingTrade) * (payoutVal / 100);
  let estimatedCyclesToTP = 0;
  if (basicCycleProfit > 0 && todayPL < targetVal) {
    estimatedCyclesToTP = Math.ceil((targetVal - todayPL) / basicCycleProfit);
  }

  // Daily TP Progress %
  let tpProgressPercent = 0;
  if (targetVal > 0) {
    tpProgressPercent = (todayPL / targetVal) * 100;
  }
  tpProgressPercent = Math.max(0, Math.min(tpProgressPercent, 100));

  // Risk warning trigger (>10% of current balance)
  const isHighRisk = currentTradeVal > currentBalance * 0.10 && currentBalance > 0;

  // Auto calculate martingale sizing when losses occur
  const computeNextStake = (lossList: number[], pVal: number, baseTrade: number): number => {
    if (lossList.length === 0) return baseTrade;
    const totalLosses = lossList.reduce((sum, v) => sum + v, 0);
    const payoutRatio = pVal / 100;
    const needed = (totalLosses + baseTrade) / payoutRatio;
    return Math.ceil(needed);
  };

  useEffect(() => {
    const baseTrade = Number(startingTradeStr) || safeStartingTrade;
    const pVal = Number(payoutStr) || safeDefaultPayout;
    const nextStake = computeNextStake(currentLossesInCycle, pVal, baseTrade);
    setNextTradeStr(String(nextStake));
  }, [currentLossesInCycle, payoutStr, startingTradeStr]);

  const handleStartSession = () => {
    const initBal = Math.max(1, parseInt(initialBalanceStr, 10) || 100);
    const startTrd = Math.max(1, parseInt(startingTradeStr, 10) || 2);
    const payVal = Math.max(1, Math.min(100, parseInt(payoutStr, 10) || 85));
    const tgtVal = Math.max(1, parseInt(targetStr, 10) || 10);

    setSessionInitialBalance(initBal);
    setCycle(1);
    setConsecutiveLosses(0);
    setCurrentLossesInCycle([]);
    setNextTradeStr(String(startTrd));
    setIsSessionActive(true);

    onSaveMTGSettings({
      startingBalance: initBal,
      startingTrade: startTrd,
      defaultPayout: payVal,
      dailyProfitTarget: tgtVal,
      currencySymbol,
    });

    setTimeout(() => {
      nextTradeInputRef.current?.focus();
    }, 100);
  };

  const handleResetSession = () => {
    if (window.confirm('Reset current trading session to Cycle 1? (Your logged trade history will NOT be deleted)')) {
      setIsSessionActive(false);
      setCycle(1);
      setConsecutiveLosses(0);
      setCurrentLossesInCycle([]);
      setNextTradeStr(startingTradeStr);
    }
  };

  const handleConfirmClearTrades = () => {
    if (window.confirm('Are you sure you want to delete all MTG trades history? This cannot be undone.')) {
      onClearMTGTrades();
    }
  };

  const handleRecordTrade = async (result: 'WIN' | 'LOSS') => {
    const tradeStake = Math.max(1, Number(nextTradeStr) || safeStartingTrade);
    let profit = 0;
    let newCycleLosses = [...currentLossesInCycle];

    if (result === 'WIN') {
      profit = Math.round(tradeStake * (payoutVal / 100) * 100) / 100;
      const accumulatedLossesInCycle = currentLossesInCycle.reduce((sum, val) => sum + val, 0);
      const cycleNetPL = Math.round((profit - accumulatedLossesInCycle) * 100) / 100;
      const newBalance = Math.round((currentBalance + profit) * 100) / 100;
      const now = new Date();

      const newTrade: MTGTrade = {
        id: `mtg_${Date.now()}`,
        number: mtgTrades.length + 1,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cycle,
        tradeAmount: tradeStake,
        result: 'WIN',
        profit,
        cyclePL: cycleNetPL,
        balance: newBalance,
        timestamp: now.getTime(),
      };

      await onSaveMTGTrade(newTrade);
      setCycle((prev) => prev + 1);
      setConsecutiveLosses(0);
      setCurrentLossesInCycle([]);
    } else {
      profit = -Math.abs(tradeStake);
      newCycleLosses.push(tradeStake);
      const accumulatedLossesInCycle = newCycleLosses.reduce((sum, val) => sum + val, 0);
      const cycleNetPL = -Math.abs(accumulatedLossesInCycle);
      const newBalance = Math.round((currentBalance - tradeStake) * 100) / 100;
      const now = new Date();

      const newTrade: MTGTrade = {
        id: `mtg_${Date.now()}`,
        number: mtgTrades.length + 1,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cycle,
        tradeAmount: tradeStake,
        result: 'LOSS',
        profit,
        cyclePL: cycleNetPL,
        balance: newBalance,
        timestamp: now.getTime(),
      };

      await onSaveMTGTrade(newTrade);
      setConsecutiveLosses((prev) => prev + 1);
      setCurrentLossesInCycle(newCycleLosses);
    }

    setTimeout(() => {
      nextTradeInputRef.current?.focus();
      nextTradeInputRef.current?.select();
    }, 100);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans">
      {/* Header Tile (Blue Calculator Icon) */}
      <div className="desk-card p-4 sm:p-5 flex items-center justify-between shadow-lg mb-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-400" />
            Trade Recovery Calculator
          </h2>
          <p className="text-xs text-[#8a8f9d] mt-0.5">
            Track recovery cycles, balance, daily TP targets, and custom trade sizing with unified website balance.
          </p>
        </div>

        <button
          onClick={handleResetSession}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181B22] hover:bg-[#1E222A] border border-[#2A2F3A] text-xs text-[#8a8f9d] hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* PANEL 1: SESSION PARAMETERS & TRADE PANEL */}
      <div className="desk-card p-4 sm:p-5 space-y-4 shadow-lg">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white border-b border-[#252930] pb-2.5">
          SESSION PARAMETERS & TRADE PANEL
        </h3>

        {/* Top 4 Inputs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#8a8f9d] uppercase tracking-wider">Initial Balance ({currencySymbol})</label>
            <input
              type="number"
              step="1"
              min="0"
              value={initialBalanceStr}
              onChange={(e) => setInitialBalanceStr(e.target.value)}
              onBlur={() => {
                const num = Math.max(1, parseInt(initialBalanceStr, 10) || 100);
                onSaveMTGSettings({ ...mtgSettings, startingBalance: num });
              }}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border-2 border-[#2D333F] hover:border-[#3D4556] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-white font-mono text-sm font-bold outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#8a8f9d] uppercase tracking-wider">Starting Trade ({currencySymbol})</label>
            <input
              type="number"
              step="1"
              min="0"
              value={startingTradeStr}
              onChange={(e) => setStartingTradeStr(e.target.value)}
              onBlur={() => {
                const num = Math.max(1, parseInt(startingTradeStr, 10) || 2);
                onSaveMTGSettings({ ...mtgSettings, startingTrade: num });
              }}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border-2 border-[#2D333F] hover:border-[#3D4556] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-white font-mono text-sm font-bold outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#8a8f9d] uppercase tracking-wider">Payout (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={payoutStr}
              onChange={(e) => setPayoutStr(e.target.value)}
              onBlur={() => {
                const num = Math.max(1, Math.min(100, parseInt(payoutStr, 10) || 85));
                onSaveMTGSettings({ ...mtgSettings, defaultPayout: num });
              }}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border-2 border-[#2D333F] hover:border-[#3D4556] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-white font-mono text-sm font-bold outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#8a8f9d] uppercase tracking-wider">Daily Profit Target ({currencySymbol})</label>
            <input
              type="number"
              step="1"
              min="0"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              onBlur={() => {
                const num = Math.max(1, parseInt(targetStr, 10) || 10);
                onSaveMTGSettings({ ...mtgSettings, dailyProfitTarget: num });
              }}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border-2 border-[#2D333F] hover:border-[#3D4556] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-white font-mono text-sm font-bold outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Trade Sizing Input & Action Buttons */}
        <div className="pt-3 border-t border-[#252930] flex flex-col md:flex-row md:items-end justify-between gap-3.5">
          <div className="flex-1 max-w-sm space-y-1.5">
            <label className="text-[11px] font-semibold text-[#8a8f9d] uppercase tracking-wider">Next Trade Amount ({currencySymbol})</label>
            <input
              ref={nextTradeInputRef}
              type="number"
              step="1"
              min="0"
              value={nextTradeStr}
              onChange={(e) => setNextTradeStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090B10] border-2 border-[#2D333F] hover:border-[#3D4556] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-white font-mono text-base font-bold outline-none transition-all shadow-inner"
            />
          </div>

          {/* Action Buttons: Start Session (Blue), WIN (Green), LOSS (Red) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleStartSession}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              Start Session
            </button>

            <button
              onClick={() => handleRecordTrade('WIN')}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>WIN</span>
            </button>

            <button
              onClick={() => handleRecordTrade('LOSS')}
              className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-1.5 active:scale-95"
            >
              <XCircle className="w-4 h-4 stroke-[2.5]" />
              <span>LOSS</span>
            </button>
          </div>
        </div>
      </div>

      {/* PANEL 2: SESSION PERFORMANCE OVERVIEW */}
      <div className="desk-card p-4 sm:p-5 space-y-4 shadow-lg">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white border-b border-[#252930] pb-2.5">
          SESSION PERFORMANCE OVERVIEW
        </h3>

        {/* 8 Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Current Balance</span>
            <div className="text-lg font-bold font-mono text-blue-400">
              {currencySymbol}{currentBalance.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Today's P/L</span>
            <div className={`text-lg font-bold font-mono ${todayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {todayPL >= 0 ? '+' : ''}{currencySymbol}{todayPL.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Current Trade</span>
            <div className="text-lg font-bold font-mono text-white">
              {currencySymbol}{currentTradeVal.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Current Cycle</span>
            <div className="text-lg font-bold font-mono text-white">
              {cycle}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Consecutive Losses</span>
            <div className="text-lg font-bold font-mono text-rose-400">
              {consecutiveLosses}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Total Trades</span>
            <div className="text-lg font-bold font-mono text-white">
              {mtgTrades.length}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Maximum Trade</span>
            <div className="text-lg font-bold font-mono text-white">
              {currencySymbol}{maxTradeVal.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <span className="text-[11px] font-medium text-[#8a8f9d]">Cycle P/L</span>
            <div className={`text-lg font-bold font-mono ${cycleProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cycleProfit >= 0 ? '+' : ''}{currencySymbol}{cycleProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Daily TP Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold font-mono text-white">
            <span className="font-sans">Daily TP Progress</span>
            <span>{currencySymbol}{todayPL.toFixed(2)} / {currencySymbol}{targetVal.toFixed(2)}</span>
          </div>
          <div className="w-full bg-[#090A0C] h-2.5 rounded-full overflow-hidden border border-[#252930]">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${tpProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Risk Warning Box */}
        {isHighRisk && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Warning:</strong> your next trade is more than 10% of your current balance. A losing streak can increase required trade size very quickly.
            </div>
          </div>
        )}
      </div>

      {/* PANEL 3: CYCLE INFORMATION */}
      <div className="desk-card p-4 sm:p-5 space-y-3 shadow-lg">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Cycle Information</h3>
          <p className="text-xs text-[#8a8f9d] mt-0.5">
            A cycle starts with your first trade and ends when you win. After a winning trade, the cycle resets to the starting trade.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <div className="text-[11px] font-medium text-[#8a8f9d]">Money Risked This Cycle</div>
            <div className="text-lg font-bold font-mono text-white">
              {currencySymbol}{cycleRisk.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <div className="text-[11px] font-medium text-[#8a8f9d]">Expected Win Profit</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {currencySymbol}{expectedWinProfit.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <div className="text-[11px] font-medium text-[#8a8f9d]">Cycles Completed</div>
            <div className="text-lg font-bold font-mono text-white">
              {completedCycles}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090A0C] border border-[#252930] space-y-1">
            <div className="text-[11px] font-medium text-[#8a8f9d]">Estimated Cycles to TP</div>
            <div className="text-lg font-bold font-mono text-blue-400">
              {estimatedCyclesToTP}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL 4: TRADE HISTORY TABLE (Spacious Row Height & Standard Column Colors) */}
      <div className="desk-card p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#252930] pb-2.5">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Trade History</h3>
          {mtgTrades.length > 0 && (
            <button
              onClick={handleConfirmClearTrades}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#181B22] hover:bg-[#1E222A] border border-[#2A2F3A] text-[#8a8f9d] hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {mtgTrades.length === 0 ? (
          <div className="py-8 text-center text-[#8a8f9d] text-xs font-mono">
            No trades logged yet. Click WIN or LOSS to record your first MTG trade.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-[#252930]">
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">#</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Date / Time</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Cycle</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Trade Amount</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Result</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Trade P/L</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Cycle Net P/L</th>
                  <th className="py-4 px-4 font-semibold text-[11px] text-[#8a8f9d] uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252930]/60">
                {mtgTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-[#181B22]/80 transition-colors">
                    <td className="py-4 px-4 align-middle text-[#8a8f9d]">#{t.number}</td>
                    <td className="py-4 px-4 align-middle text-white font-normal">{t.date} <span className="text-[#8a8f9d] ml-1">{t.time}</span></td>
                    <td className="py-4 px-4 align-middle text-[#8a8f9d]">Cycle {t.cycle}</td>
                    <td className="py-4 px-4 align-middle text-white font-normal font-mono text-sm">{currencySymbol}{t.tradeAmount.toFixed(2)}</td>
                    <td className="py-4 px-4 align-middle">
                      <span className={`inline-flex items-center justify-center min-w-[56px] px-2.5 py-1 rounded-md text-[11px] font-medium uppercase border tracking-wider ${t.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                        {t.result}
                      </span>
                    </td>
                    <td className={`py-4 px-4 align-middle font-normal font-mono text-sm ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.profit >= 0 ? '+' : ''}{currencySymbol}{t.profit.toFixed(2)}
                    </td>
                    <td className={`py-4 px-4 align-middle font-normal font-mono text-sm ${t.cyclePL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.cyclePL >= 0 ? '+' : ''}{currencySymbol}{t.cyclePL.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 align-middle text-white font-normal font-mono text-sm">{currencySymbol}{t.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Reset Button */}
      <div className="flex justify-start pt-1">
        <button
          onClick={handleResetSession}
          className="px-5 py-2.5 rounded-lg bg-[#181B22] hover:bg-[#1E222A] border border-[#2A2F3A] text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
