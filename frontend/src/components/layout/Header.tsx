import React from 'react';
import { Plus, Calendar as CalendarIcon, CheckSquare, LogOut } from 'lucide-react';
import type { UserProfile } from '../../api/client';

interface HeaderProps {
  onOpenAddTrade: () => void;
  onOpenPreSessionCheck: () => void;
  activeTabTitle: string;
  user: UserProfile | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTrade,
  onOpenPreSessionCheck,
  activeTabTitle,
  user,
  onLogout,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const firstName = user?.name ? user.name.split(' ')[0] : 'Trader';

  return (
    <header className="sticky top-0 z-30 w-full desk-panel border-b border-[#252930] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Active View Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-[#f0f1f4]">
            {activeTabTitle}
          </h1>
        </div>

        {/* Right: User Greeting, Date, Pre-Session Check, Add Trade Button */}
        <div className="flex items-center gap-3">
          {/* User Profile Greeting Pill */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#14171B] border border-[#252930] text-xs sm:text-sm font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[#f0f1f4]">Hi, <strong className="text-emerald-400">{firstName}</strong></span>
              <button
                onClick={onLogout}
                className="ml-1 text-[#8a8f9d] hover:text-rose-400 transition-colors p-0.5"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-sm text-[#8a8f9d] font-mono border-r border-[#252930] pr-3">
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
