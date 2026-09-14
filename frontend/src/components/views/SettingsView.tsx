import React, { useState } from 'react';
import { Download, Upload, Trash2, Save, Check, Plus, X } from 'lucide-react';
import type { JournalSettings, Trade, DailyReview, PreSessionRule } from '../../types/journal';
import { exportJournalJSON, exportJournalCSV } from '../../utils/storage';

interface SettingsViewProps {
  settings: JournalSettings;
  trades: Trade[];
  dailyReviews: DailyReview[];
  onSaveSettings: (newSettings: JournalSettings) => void;
  onImportData: (importedJSON: string) => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  trades,
  dailyReviews,
  onSaveSettings,
  onImportData,
  onClearData,
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
    const jsonStr = exportJournalJSON(trades, settings, dailyReviews);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_journal_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csvStr = exportJournalCSV(trades);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_journal_trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
    <div className="space-y-5 max-w-3xl mx-auto text-xs">
      <div className="desk-card p-4">
        <h2 className="text-base font-bold text-[#f0f1f4]">Settings & Backup</h2>
        <p className="text-[#8a8f9d]">Trading parameters, pre-session checklist rules, and data export</p>
      </div>

      <form onSubmit={handleSave} className="desk-card p-4 space-y-4">
        <h3 className="text-xs font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2">
          Capital & Plan Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#8a8f9d] mb-1">Starting Balance</label>
            <input
              type="number"
              step="0.01"
              value={startingBalance}
              onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
              className="w-full desk-input px-3 py-1.5 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] mb-1">Default Trade Amount ($)</label>
            <input
              type="number"
              step="0.1"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(parseFloat(e.target.value) || 0)}
              className="w-full desk-input px-3 py-1.5 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] mb-1">Default Payout (%)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              value={defaultPayout}
              onChange={(e) => setDefaultPayout(parseFloat(e.target.value) || 0)}
              className="w-full desk-input px-3 py-1.5 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] mb-1">Daily Trade Limit</label>
            <input
              type="number"
              step="1"
              min="1"
              max="20"
              value={dailyTradeLimit}
              onChange={(e) => setDailyTradeLimit(parseInt(e.target.value) || 1)}
              className="w-full desk-input px-3 py-1.5 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] mb-1">Plan Duration (Days)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="30"
              value={planDurationDays}
              onChange={(e) => setPlanDurationDays(parseInt(e.target.value) || 10)}
              className="w-full desk-input px-3 py-1.5 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a8f9d] mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full desk-input px-3 py-1.5 font-mono text-xs font-bold"
              required
            />
          </div>
        </div>

        {/* Pre-Session Checklist Configuration */}
        <div className="pt-3 border-t border-[#252930] space-y-2.5">
          <h4 className="font-bold text-[#f0f1f4] uppercase tracking-wider text-[11px]">
            Custom Pre-Session Checklist Rules
          </h4>

          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-2 rounded bg-[#090A0C] border border-[#252930]">
                <span className="text-[#f0f1f4]">{rule.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-[#8a8f9d] hover:text-rose-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add new readiness rule..."
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              className="flex-1 desk-input px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#14171B] border border-[#252930] text-[#f0f1f4] hover:bg-[#191C21]"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#252930]">
          {savedSuccess ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Configuration Saved!
            </span>
          ) : (
            <span className="text-[#8a8f9d]">Click save to persist parameter updates</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </form>

      {/* Export / Import */}
      <div className="desk-card p-4 space-y-3">
        <h3 className="text-xs font-bold text-[#f0f1f4] uppercase tracking-wider border-b border-[#252930] pb-2">
          Data Export & Backup
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-[#f0f1f4]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-[#f0f1f4]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
          </button>
          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-[#f0f1f4] cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-indigo-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Reset */}
      <div className="desk-card p-4 border-rose-500/20 bg-rose-950/10 space-y-2">
        <h3 className="font-bold text-rose-400">Danger Zone</h3>
        {showClearConfirm ? (
          <div className="space-y-2 pt-1">
            <div className="text-rose-300">Delete all trading logs and MongoDB data?</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClearData();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 rounded bg-rose-600 text-white font-bold"
              >
                Confirm Delete
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1 rounded bg-[#191C21] text-[#8a8f9d]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Data
          </button>
        )}
      </div>
    </div>
  );
};
