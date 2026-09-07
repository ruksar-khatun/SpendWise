import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveNavPage } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  LayoutGrid,
  FileText,
  PieChart,
  BarChart3,
  Target,
  Settings,
  User,
  HelpCircle,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobileMenu }) => {
  const { activePage, setActivePage, settings } = useFinance();

  const handleNavClick = (page: ActiveNavPage) => {
    setActivePage(page);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const primaryNavItems: { id: ActiveNavPage; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'savings', label: 'Savings Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const secondaryNavItems: { id: ActiveNavPage; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col justify-between p-5 bg-[#fbfcfc] dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800/80 transition-colors select-none">
      {/* Top Header & Logo */}
      <div className="flex flex-col">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-6">
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            {/* Custom geometric leaf logo matching SpendWise reference */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-sm shadow-teal-500/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07L12 2zm0 18c-4.41 0-8-3.59-8-8 0-2.21.9-4.21 2.34-5.66L12 12V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">SpendWise</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Understand your money</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#e8f7f4] dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-slate-200/60 dark:border-slate-800/80" />

        {/* Secondary Navigation */}
        <nav className="space-y-1">
          {secondaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#e8f7f4] dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Motivational Card & User Profile */}
      <div className="flex flex-col gap-4 pt-2">
        {/* Inspirational / Promo Banner: Small Steps Bigger Tomorrow */}
        <div
          onClick={() => handleNavClick('savings')}
          className="relative group cursor-pointer overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#c4f2dc] via-[#a2ebd7] to-[#7be0cf] dark:from-teal-950 dark:to-emerald-900 shadow-sm border border-emerald-200/50 dark:border-teal-800/40"
        >
          <div className="pr-8">
            <h4 className="text-slate-800 dark:text-slate-100 font-extrabold text-base leading-snug tracking-tight">
              Small<br />Steps<br />Bigger<br />Tomorrow
            </h4>
          </div>

          <button
            className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:translate-x-0.5 group-hover:scale-105 transition-all"
            aria-label="View savings goals"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile */}
        <div
          onClick={() => handleNavClick('profile')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar
              src={settings.avatarUrl}
              alt={settings.name}
              size="md"
              className="ring-2 ring-brand-500/20"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{settings.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{settings.email}</p>
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              handleNavClick('settings');
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
