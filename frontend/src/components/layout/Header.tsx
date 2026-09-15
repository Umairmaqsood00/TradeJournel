import React from 'react';
import { Plus, Calendar as CalendarIcon, CheckSquare, LogOut } from 'lucide-react';
import type { UserProfile } from '../../api/client';

interface HeaderProps {
  onOpenAddTrade: () => void;
  onOpenPreSessionCheck: () => void;
  activeTabTitle: string;
  user: UserProfile | null;
  onLogout?: () => void;
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
    <header className="sticky top-0 z-30 w-full desk-panel border-b border-[#252930] px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Active View Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h1 className="text-sm sm:text-xl font-bold text-[#f0f1f4] truncate">
            {activeTabTitle}
          </h1>
        </div>

        {/* Right: User Profile, Logout, Date, Pre-Session Check, Add Trade Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* User Profile Badge */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-[#14171B] border border-[#252930] text-xs sm:text-sm font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-[#f0f1f4]">Hi, <strong className="text-emerald-400">{firstName}</strong></span>
              <span className="sm:hidden text-emerald-400 font-bold max-w-[50px] truncate">{firstName}</span>
              {user.role === 'admin' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  ADMIN
                </span>
              )}
            </div>
          )}

          {/* Logout Button (Admin Only - Regular users log out via Settings) */}
          {user && user.role === 'admin' && onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer shrink-0"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-sm text-[#8a8f9d] font-mono border-r border-[#252930] pr-3">
            <CalendarIcon className="w-4 h-4 text-[#5e6370]" />
            <span>{todayFormatted}</span>
          </div>

          {/* Pre-Session Checklist trigger button & Add Trade Button (For Trader Users Only) */}
          {user?.role !== 'admin' && (
            <>
              <button
                onClick={onOpenPreSessionCheck}
                className="flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-xs sm:text-sm text-[#8a8f9d] hover:text-[#f0f1f4] transition-colors cursor-pointer"
                title="Open Pre-Session Checklist"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Pre-Session Check</span>
              </button>

              <button
                onClick={onOpenAddTrade}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>Add Trade</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
