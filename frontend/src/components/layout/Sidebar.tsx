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
  BarChart3,
} from 'lucide-react';
import type { NavigationTab, MTGNavigationTab, JournalSettings, MTGSettings, AppMode } from '../../types/journal';
import type { UserProfile } from '../../api/client';

interface SidebarProps {
  appMode: AppMode;
  currentTab: NavigationTab;
  mtgTab: MTGNavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onSelectMTGTab: (tab: MTGNavigationTab) => void;
  onOpenPreSessionCheck: () => void;
  winRate: number;
  balance: number;
  mtgWinRate: number;
  mtgBalance: number;
  settings: JournalSettings;
  mtgSettings: MTGSettings;
  user?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appMode,
  currentTab,
  mtgTab,
  onSelectTab,
  onSelectMTGTab,
  onOpenPreSessionCheck,
  winRate,
  balance,
  mtgWinRate,
  mtgBalance,
  settings,
  mtgSettings,
  user,
}) => {
  const journalNavItems = user?.role === 'admin'
    ? [{ tab: 'admin' as NavigationTab, label: 'Admin Management', icon: Shield }]
    : [
        { tab: 'dashboard' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
        { tab: 'history' as NavigationTab, label: 'Trades Ledger', icon: History },
        { tab: 'daily' as NavigationTab, label: 'Daily Review', icon: BookOpen },
        { tab: 'plan' as NavigationTab, label: `${settings.planDurationDays || 30}-Day Plan`, icon: Target },
        { tab: 'performance' as NavigationTab, label: 'Performance', icon: TrendingUp },
        { tab: 'discipline' as NavigationTab, label: 'Discipline', icon: Award },
        { tab: 'calendar' as NavigationTab, label: 'Calendar', icon: CalendarIcon },
        { tab: 'settings' as NavigationTab, label: 'Settings', icon: SettingsIcon },
      ];

  // Clean MTG Sidebar tab labels without "MTG" prefix
  const mtgNavItems = [
    { tab: 'mtg_calc' as MTGNavigationTab, label: 'Calculator', icon: Calculator },
    { tab: 'mtg_history' as MTGNavigationTab, label: 'Trades', icon: History },
    { tab: 'mtg_performance' as MTGNavigationTab, label: 'Analytics', icon: BarChart3 },
    { tab: 'mtg_calendar' as MTGNavigationTab, label: 'Calendar', icon: CalendarIcon },
    { tab: 'mtg_settings' as MTGNavigationTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-57px)] desk-panel border-r border-[#252930] p-3.5 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-2 border-b border-[#252930]/60">
        {appMode === 'journal' ? (
          <>
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-base tracking-tight text-[#f0f1f4]">
              Trade<span className="text-emerald-400">Vault</span>
            </span>
          </>
        ) : (
          <>
            <Calculator className="w-5 h-5 text-blue-400" />
            <span className="font-extrabold text-base tracking-tight text-[#f0f1f4]">
              MTG<span className="text-blue-400">Desk</span>
            </span>
          </>
        )}
      </div>

      {/* Navigation list */}
      <nav className="space-y-1.5 flex-1">
        {appMode === 'journal' ? (
          journalNavItems.map((item) => {
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
          })
        ) : (
          mtgNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = mtgTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectMTGTab(item.tab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#14171B] text-[#f0f1f4] border border-[#252930] font-semibold'
                    : 'text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#0F1114]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-[#5e6370]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })
        )}

        {/* Pre-Session Checklist Sidebar Button (Journal Traders Only) */}
        {user?.role !== 'admin' && appMode === 'journal' && (
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

      {/* Footer Mini Stats */}
      {user?.role !== 'admin' && (
        <div className="pt-3 border-t border-[#252930] text-sm font-mono text-[#8a8f9d] space-y-1.5 px-2">
          {appMode === 'journal' ? (
            <>
              <div className="flex justify-between">
                <span className="font-sans text-xs">Journal Balance</span>
                <span className="text-[#f0f1f4] font-semibold">{settings.currencySymbol || '$'}{balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-xs">Win Rate</span>
                <span className="text-[#f0f1f4] font-semibold">{winRate}%</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="font-sans text-xs">MTG Balance</span>
                <span className="text-[#f0f1f4] font-semibold">{mtgSettings.currencySymbol || '$'}{mtgBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-xs">Win Rate</span>
                <span className="text-[#f0f1f4] font-semibold">{mtgWinRate}%</span>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
