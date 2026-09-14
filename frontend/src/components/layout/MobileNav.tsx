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
} from 'lucide-react';
import type { NavigationTab } from '../../types/journal';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPreSessionCheck: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onOpenPreSessionCheck }) => {
  const items: { tab: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { tab: 'history', label: 'Trades', icon: History },
    { tab: 'daily', label: 'Review', icon: BookOpen },
    { tab: 'plan', label: 'Plan', icon: Target },
    { tab: 'discipline', label: 'Rules', icon: Award },
    { tab: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { tab: 'settings', label: 'Config', icon: SettingsIcon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 desk-panel border-t border-[#252930] px-2 py-1.5 backdrop-blur-md">
      <div className="flex items-center justify-around overflow-x-auto gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`flex flex-col items-center justify-center min-w-[50px] py-1 rounded transition-colors ${
                isActive ? 'text-[#f0f1f4] bg-[#14171B] font-semibold' : 'text-[#8a8f9d]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-0.5 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Pre-session check quick button */}
        <button
          onClick={onOpenPreSessionCheck}
          className="flex flex-col items-center justify-center min-w-[50px] py-1 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span className="text-[10px]">Check</span>
        </button>
      </div>
    </nav>
  );
};
