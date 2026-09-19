import React from 'react';
import { Shield, Calculator, ArrowRight, X } from 'lucide-react';
import type { AppMode } from '../../types/journal';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onSelectMode: (mode: AppMode) => void;
  onClose: () => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  isOpen,
  onSelectMode,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="desk-panel max-w-3xl w-full p-6 sm:p-8 rounded-2xl border border-[#252930] shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#14171B] transition-colors cursor-pointer"
          title="Close Workspace Selector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Workspace Selector
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f1f4] tracking-tight">
            Select Trading Desk
          </h2>
          <p className="text-xs sm:text-sm text-[#8a8f9d] max-w-md mx-auto">
            Choose your active workspace desk. Capital balances, trades, and statistics are 100% isolated between desks.
          </p>
        </div>

        {/* 2 Interactive Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* TradeVault Journal Option */}
          <div
            onClick={() => {
              onSelectMode('journal');
              onClose();
            }}
            className="group desk-card p-6 rounded-xl border border-[#252930] hover:border-emerald-500/50 bg-[#14171B] hover:bg-[#181B20] transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#f0f1f4] group-hover:text-emerald-400 transition-colors">
                  TradeVault Journal
                </h3>
                <p className="text-xs text-[#8a8f9d] mt-1.5 leading-relaxed">
                  Full binary options journal. Detailed statistics, trading plans, daily reviews, emotional audit, and calendar.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#252930] flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Open Journal Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* MTG Desk Option */}
          <div
            onClick={() => {
              onSelectMode('mtg');
              onClose();
            }}
            className="group desk-card p-6 rounded-xl border border-[#252930] hover:border-blue-500/50 bg-[#14171B] hover:bg-[#181B20] transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-blue-500/10"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#f0f1f4] group-hover:text-blue-400 transition-colors">
                  MTG Calculator Desk
                </h3>
                <p className="text-xs text-[#8a8f9d] mt-1.5 leading-relaxed">
                  Dedicated Martingale recovery desk. Sizing calculator, cycle tracking, cycle net P/L, equity curve, and isolated balance.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#252930] flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Open MTG Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
