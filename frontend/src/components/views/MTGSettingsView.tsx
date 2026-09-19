import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Trash2, LogOut, ShieldAlert } from 'lucide-react';
import type { MTGSettings } from '../../types/journal';
import type { UserProfile } from '../../api/client';

interface MTGSettingsViewProps {
  mtgSettings: MTGSettings;
  onSaveMTGSettings: (newSettings: MTGSettings) => void;
  onClearMTGData: () => void;
  user?: UserProfile | null;
  onLogout: () => void;
}

export const MTGSettingsView: React.FC<MTGSettingsViewProps> = ({
  mtgSettings,
  onSaveMTGSettings,
  onClearMTGData,
  user,
  onLogout,
}) => {
  const [startingBalanceStr, setStartingBalanceStr] = useState<string>(
    String(mtgSettings.startingBalance)
  );
  const [startingTradeStr, setStartingTradeStr] = useState<string>(
    String(mtgSettings.startingTrade)
  );
  const [defaultPayoutStr, setDefaultPayoutStr] = useState<string>(
    String(mtgSettings.defaultPayout)
  );
  const [dailyProfitTargetStr, setDailyProfitTargetStr] = useState<string>(
    String(mtgSettings.dailyProfitTarget)
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    mtgSettings.currencySymbol || '$'
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MTGSettings = {
      startingBalance: Math.max(1, parseInt(startingBalanceStr, 10) || 100),
      startingTrade: Math.max(1, parseInt(startingTradeStr, 10) || 2),
      defaultPayout: Math.max(1, Math.min(100, parseInt(defaultPayoutStr, 10) || 85)),
      dailyProfitTarget: Math.max(1, parseInt(dailyProfitTargetStr, 10) || 10),
      currencySymbol: currencySymbol.trim() || '$',
    };
    onSaveMTGSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleConfirmClear = () => {
    if (window.confirm('Are you sure you want to reset all MTG settings and trade history? This action cannot be undone.')) {
      onClearMTGData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="desk-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#f0f1f4] flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
            MTG Calculator Configuration
          </h2>
          <p className="text-sm text-[#8a8f9d] mt-1">
            Configure capital parameters, default payout rates, and currency symbol
          </p>
        </div>

        {user && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-fade-in">
          MTG Desk settings updated successfully!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="desk-card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Starting Balance */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8a8f9d]">
              Starting Balance ({currencySymbol})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={startingBalanceStr}
              onChange={(e) => setStartingBalanceStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#090A0C] border border-[#252930] focus:border-blue-500 text-[#f0f1f4] font-mono text-sm outline-none transition-colors"
              required
            />
            <p className="text-[11px] text-[#5e6370]">Initial capital allocation for MTG desk</p>
          </div>

          {/* Starting Trade Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8a8f9d]">
              Initial Trade Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={startingTradeStr}
              onChange={(e) => setStartingTradeStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#090A0C] border border-[#252930] focus:border-blue-500 text-[#f0f1f4] font-mono text-sm outline-none transition-colors"
              required
            />
            <p className="text-[11px] text-[#5e6370]">First trade stake in cycle 1</p>
          </div>

          {/* Default Payout */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8a8f9d]">
              Default Broker Payout (%)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              value={defaultPayoutStr}
              onChange={(e) => setDefaultPayoutStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#090A0C] border border-[#252930] focus:border-blue-500 text-[#f0f1f4] font-mono text-sm outline-none transition-colors"
              required
            />
            <p className="text-[11px] text-[#5e6370]">Standard broker payout rate (e.g. 85%)</p>
          </div>

          {/* Daily Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8a8f9d]">
              Daily Profit Target ({currencySymbol})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={dailyProfitTargetStr}
              onChange={(e) => setDailyProfitTargetStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#090A0C] border border-[#252930] focus:border-blue-500 text-[#f0f1f4] font-mono text-sm outline-none transition-colors"
              required
            />
            <p className="text-[11px] text-[#5e6370]">Target profit before ending session</p>
          </div>

          {/* Currency Symbol */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8a8f9d]">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 rounded bg-[#090A0C] border border-[#252930] focus:border-blue-500 text-[#f0f1f4] font-mono text-sm outline-none transition-colors"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#252930] flex items-center justify-between">
          <button
            type="button"
            onClick={handleConfirmClear}
            className="flex items-center gap-2 px-4 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset MTG Workspace</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
