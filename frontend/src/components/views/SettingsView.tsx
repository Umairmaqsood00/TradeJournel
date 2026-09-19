import React, { useState } from 'react';
import { Download, Upload, Trash2, Save, Check, Plus, X, LogOut, Shield } from 'lucide-react';
import type { JournalSettings, Trade, DailyReview, PreSessionRule } from '../../types/journal';
import type { UserProfile } from '../../api/client';
import { exportJournalJSON, exportJournalCSV } from '../../utils/storage';

interface SettingsViewProps {
  settings: JournalSettings;
  trades: Trade[];
  dailyReviews: DailyReview[];
  onSaveSettings: (newSettings: JournalSettings) => void;
  onImportData: (importedJSON: string) => void;
  onClearData: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  trades,
  dailyReviews,
  onSaveSettings,
  onImportData,
  onClearData,
  user,
  onLogout,
}) => {
  const [startingBalance, setStartingBalance] = useState<number>(settings.startingBalance);
  const [defaultAmount, setDefaultAmount] = useState<number>(settings.defaultAmount);
  const [defaultPayout, setDefaultPayout] = useState<number>(settings.defaultPayout);
  const [dailyTradeLimit, setDailyTradeLimit] = useState<number>(settings.dailyTradeLimit);
  const [planDurationDays, setPlanDurationDays] = useState<number>(settings.planDurationDays);
  const [currencySymbol, setCurrencySymbol] = useState<string>(settings.currencySymbol);
  const [rules, setRules] = useState<PreSessionRule[]>(settings.preSessionRules || []);
  const [newRuleText, setNewRuleText] = useState<string>('');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const handleAddRule = () => {
    if (newRuleText.trim()) {
      setRules([...rules, { id: `psr-${Date.now()}`, text: newRuleText.trim() }]);
      setNewRuleText('');
    }
  };

  const handleEditRuleText = (id: string, text: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, text } : r)));
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      startingBalance: Number(startingBalance),
      defaultAmount: Number(defaultAmount),
      defaultPayout: Number(defaultPayout),
      dailyTradeLimit: Number(dailyTradeLimit),
      planDurationDays: Number(planDurationDays),
      currencySymbol,
      preSessionRules: rules,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    exportJournalJSON(trades, settings, dailyReviews);
  };

  const handleExportCSV = () => {
    exportJournalCSV(trades);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          onImportData(content);
          alert('Data imported successfully!');
        } catch (err) {
          alert('Failed to parse import file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-sm">
      {/* Account & Session Section */}
      <div className="desk-card p-5 space-y-4 border border-[#252930]">
        <h3 className="text-sm font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2.5 flex items-center justify-between">
          <span>Account & Session</span>
          {user?.role === 'admin' && (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
              <Shield className="w-3.5 h-3.5" /> Administrator
            </span>
          )}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base font-mono border border-emerald-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-bold text-base text-[#f0f1f4]">{user?.name || 'Trading User'}</div>
              <div className="text-xs text-[#8a8f9d] font-mono">{user?.email || 'authenticated'}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-sm font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Settings Header */}
      <div className="desk-card p-5">
        <h2 className="text-lg font-bold text-[#f0f1f4]">TradeVault Preferences &amp; Config</h2>
        <p className="text-sm text-[#8a8f9d]">Trading parameters, pre-session checklist rules, and data backups</p>
      </div>

      <form onSubmit={handleSave} className="desk-card p-5 space-y-5">
        <h3 className="text-sm font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2.5">
          Capital & Plan Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#8a8f9d] text-xs mb-1.5">Starting Balance</label>
            <input
              type="number"
              step="1"
              value={startingBalance}
              onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
              className="w-full desk-input px-3.5 py-2 font-binance text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] text-xs mb-1.5">Default Trade Amount ($)</label>
            <input
              type="number"
              step="1"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(parseFloat(e.target.value) || 0)}
              className="w-full desk-input px-3.5 py-2 font-binance text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] text-xs mb-1.5">Default Payout (%)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              value={defaultPayout}
              onChange={(e) => setDefaultPayout(parseFloat(e.target.value) || 0)}
              className="w-full desk-input px-3.5 py-2 font-binance text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] text-xs mb-1.5">Daily Trade Limit</label>
            <input
              type="number"
              step="1"
              min="1"
              max="20"
              value={dailyTradeLimit}
              onChange={(e) => setDailyTradeLimit(parseInt(e.target.value) || 1)}
              className="w-full desk-input px-3.5 py-2 font-binance text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] text-xs mb-1.5">Plan Duration (Days)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="30"
              value={planDurationDays}
              onChange={(e) => setPlanDurationDays(parseInt(e.target.value) || 10)}
              className="w-full desk-input px-3.5 py-2 font-binance text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] text-xs mb-1.5">Currency Symbol</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full desk-input px-3.5 py-2 font-binance text-sm font-bold"
              required
            />
          </div>
        </div>

        {/* Pre-Session & Discipline Checklist Configuration */}
        <div className="pt-4 border-t border-[#252930] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#f0f1f4] uppercase tracking-wider text-xs">
              Trading Discipline &amp; Pre-Session Rules
            </h4>
            <span className="text-[11px] text-[#8a8f9d]">Editable in real-time</span>
          </div>

          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 p-2 rounded bg-[#090A0C] border border-[#252930] hover:border-[#333842] transition-colors">
                <input
                  type="text"
                  value={rule.text}
                  onChange={(e) => handleEditRuleText(rule.id, e.target.value)}
                  className="flex-1 bg-transparent text-[#f0f1f4] text-xs sm:text-sm px-2.5 py-1.5 focus:outline-none focus:bg-[#14171B] rounded border border-transparent focus:border-[#252930]"
                  placeholder="Enter discipline rule description..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-[#8a8f9d] hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 cursor-pointer transition-colors"
                  title="Remove rule"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 pt-1">
            <input
              type="text"
              placeholder="Add new discipline rule..."
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
              className="flex-1 desk-input px-3.5 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold text-sm cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#252930]">
          {savedSuccess ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-sm">
              <Check className="w-4 h-4" /> Configuration Saved!
            </span>
          ) : (
            <span className="text-[#8a8f9d] text-xs">Click save to persist parameters</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>

      {/* Export / Import */}
      <div className="desk-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2.5">
          Data Export & Backup
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-[#f0f1f4] text-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-[#f0f1f4] text-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <label className="flex items-center justify-center gap-2 p-3 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-[#f0f1f4] text-sm cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Reset */}
      <div className="desk-card p-5 border-rose-500/20 bg-rose-950/10 space-y-3">
        <h3 className="font-bold text-rose-400 text-sm">Danger Zone</h3>
        {showClearConfirm ? (
          <div className="space-y-3 pt-1">
            <div className="text-rose-300 text-xs sm:text-sm">Delete all trading logs and MongoDB data for this account?</div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClearData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded bg-rose-600 text-white font-bold text-xs sm:text-sm cursor-pointer"
              >
                Confirm Delete
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded bg-[#191C21] text-[#8a8f9d] text-xs sm:text-sm cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 text-xs sm:text-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear Account Data
          </button>
        )}
      </div>
    </div>
  );
};
