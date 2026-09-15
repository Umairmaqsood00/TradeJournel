import React from 'react';
import {
  LayoutDashboard,
  History,
  BookOpen,
  Target,
  Award,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  CheckSquare,
  Shield,
} from 'lucide-react';
import type { NavigationTab } from '../../types/journal';
import type { UserProfile } from '../../api/client';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPreSessionCheck: () => void;
  user?: UserProfile | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onOpenPreSessionCheck, user }) => {
  const items = user?.role === 'admin'
    ? [{ tab: 'admin' as NavigationTab, label: 'Admin Management', icon: Shield }]
    : [
        { tab: 'dashboard' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
        { tab: 'history' as NavigationTab, label: 'Trades', icon: History },
        { tab: 'daily' as NavigationTab, label: 'Review', icon: BookOpen },
        { tab: 'plan' as NavigationTab, label: 'Plan', icon: Target },
        { tab: 'discipline' as NavigationTab, label: 'Rules', icon: Award },
        { tab: 'calendar' as NavigationTab, label: 'Calendar', icon: CalendarIcon },
        { tab: 'settings' as NavigationTab, label: 'Config', icon: SettingsIcon },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 desk-panel border-t border-[#252930] px-2 py-1.5 backdrop-blur-md">
      <div className="flex items-center justify-around overflow-x-auto gap-1 no-scrollbar">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          const isAdminTab = item.tab === 'admin';
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`flex flex-col items-center justify-center min-w-[46px] sm:min-w-[50px] py-1 rounded transition-colors shrink-0 ${
                isActive
                  ? isAdminTab
                    ? 'text-amber-400 bg-amber-500/10 font-semibold'
                    : 'text-[#f0f1f4] bg-[#14171B] font-semibold'
                  : isAdminTab
                  ? 'text-amber-400/80 hover:text-amber-400'
                  : 'text-[#8a8f9d]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-0.5 ${isActive ? (isAdminTab ? 'text-amber-400' : 'text-emerald-400') : ''}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Pre-session check quick button (Traders Only) */}
        {user?.role !== 'admin' && (
          <button
            onClick={onOpenPreSessionCheck}
            className="flex flex-col items-center justify-center min-w-[46px] sm:min-w-[50px] py-1 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="text-[10px]">Check</span>
          </button>
        )}
      </div>
    </nav>
  );
};
