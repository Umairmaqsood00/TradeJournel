import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { PreSessionRule } from '../../types/journal';

interface PreSessionChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PreSessionRule[];
  onSessionReady: () => void;
}

export const PreSessionChecklistModal: React.FC<PreSessionChecklistModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSessionReady,
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = rules.length > 0 && rules.every((r) => checkedIds[r.id]);

  const handleStartSession = () => {
    onSessionReady();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-lg w-full desk-card p-6 border border-[#252930] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252930] pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-bold text-[#f0f1f4]">Pre-Trading Session Checklist</h2>
              <p className="text-xs text-[#8a8f9d]">Verify execution readiness before taking trades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#191C21] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules Checklist */}
        <div className="space-y-3">
          {rules.map((rule) => {
            const isChecked = Boolean(checkedIds[rule.id]);
            return (
              <div
                key={rule.id}
                onClick={() => toggleCheck(rule.id)}
                className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-[#f0f1f4]'
                    : 'bg-[#14171B] border-[#252930] text-[#8a8f9d] hover:border-[#333842]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-[#090A0C]'
                      : 'border-[#333842] bg-[#090A0C]'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>
                <span className="text-xs font-medium">{rule.text}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#252930]">
          <span className="text-xs text-[#8a8f9d] font-mono">
            Ready: {Object.values(checkedIds).filter(Boolean).length} / {rules.length}
          </span>
          <button
            onClick={handleStartSession}
            disabled={!allChecked}
            className={`px-5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
              allChecked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                : 'bg-[#191C21] text-[#5e6370] border border-[#252930] cursor-not-allowed'
            }`}
          >
            {allChecked ? 'Session Verified & Ready' : 'Complete All Items to Begin'}
          </button>
        </div>
      </div>
    </div>
  );
};
