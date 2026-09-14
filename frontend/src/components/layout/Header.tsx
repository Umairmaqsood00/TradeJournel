import React from 'react';
import { Plus, Calendar as CalendarIcon, Database, CheckSquare } from 'lucide-react';

interface HeaderProps {
  onOpenAddTrade: () => void;
  onOpenPreSessionCheck: () => void;
  isBackendConnected: boolean;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTrade,
  onOpenPreSessionCheck,
  isBackendConnected,
  activeTabTitle,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 w-full desk-panel border-b border-[#252930] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Active View Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-[#f0f1f4]">
            {activeTabTitle}
          </h1>
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${
              isBackendConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isBackendConnected ? 'MongoDB Live' : 'Offline'}</span>
          </div>
        </div>

        {/* Right: Date, Pre-Session Check, Add Trade Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-[#8a8f9d] font-mono border-r border-[#252930] pr-3">
            <CalendarIcon className="w-4 h-4 text-[#5e6370]" />
            <span>{todayFormatted}</span>
          </div>

          {/* Pre-Session Checklist trigger button */}
          <button
            onClick={onOpenPreSessionCheck}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-xs sm:text-sm text-[#8a8f9d] hover:text-[#f0f1f4] transition-colors cursor-pointer"
            title="Open Pre-Session Checklist"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Pre-Session Check</span>
          </button>

          {/* Restrained Add Trade Button */}
          <button
            onClick={onOpenAddTrade}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
