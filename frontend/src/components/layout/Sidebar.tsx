import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  History,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  CheckSquare,
  Shield,
} from 'lucide-react';
import type { NavigationTab, JournalSettings } from '../../types/journal';
import type { UserProfile } from '../../api/client';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPreSessionCheck: () => void;
  winRate: number;
  balance: number;
  settings: JournalSettings;
  user?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPreSessionCheck,
  winRate,
  balance,
  settings,
  user,
}) => {
  const navItems = user?.role === 'admin'
    ? [
        { tab: 'admin' as NavigationTab, label: 'Admin Management', icon: Shield },
      ]
    : [
        { tab: 'dashboard' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
        { tab: 'calculator' as NavigationTab, label: 'Recovery Calc', icon: Calculator },
        { tab: 'history' as NavigationTab, label: 'Trades', icon: History },
        { tab: 'daily' as NavigationTab, label: 'Daily Review', icon: BookOpen },
        { tab: 'plan' as NavigationTab, label: `${settings.planDurationDays}-Day Plan`, icon: Target },
        { tab: 'performance' as NavigationTab, label: 'Performance', icon: TrendingUp },
        { tab: 'discipline' as NavigationTab, label: 'Discipline', icon: Award },
        { tab: 'calendar' as NavigationTab, label: 'Calendar', icon: CalendarIcon },
        { tab: 'settings' as NavigationTab, label: 'Settings', icon: SettingsIcon },
      ];

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-57px)] desk-panel border-r border-[#252930] p-3.5 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-2 border-b border-[#252930]/60">
        <Shield className="w-5 h-5 text-emerald-400" />
        <span className="font-extrabold text-base tracking-tight text-[#f0f1f4]">Trade<span className="text-emerald-400">Vault</span></span>
      </div>

      {/* Navigation list */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          const isAdminTab = item.tab === 'admin';
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#14171B] text-[#f0f1f4] border border-[#252930] font-semibold'
                  : 'text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#0F1114]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : isAdminTab ? 'text-amber-400' : 'text-[#5e6370]'}`} />
              <span className={isAdminTab ? 'text-amber-400 font-semibold' : ''}>{item.label}</span>
            </button>
          );
        })}

        {/* Pre-Session Checklist Sidebar Button (Traders Only) */}
        {user?.role !== 'admin' && (
          <div className="pt-2.5">
            <button
              onClick={onOpenPreSessionCheck}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Pre-Session Check</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer Mini Stats (Traders Only) */}
      {user?.role !== 'admin' && (
        <div className="pt-3 border-t border-[#252930] text-sm font-binance text-[#8a8f9d] space-y-1.5 px-2">
          <div className="flex justify-between">
            <span className="font-sans text-xs">Balance</span>
            <span className="text-[#f0f1f4] font-semibold">{settings.currencySymbol}{balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans text-xs">Win Rate</span>
            <span className="text-[#f0f1f4] font-semibold">{winRate}%</span>
          </div>
        </div>
      )}
    </aside>
  );
};
