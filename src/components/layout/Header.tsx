import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Search, Calendar, Bell, Moon, Sun, ChevronDown, CheckCheck, Sparkles, AlertCircle } from 'lucide-react';
import { ApiStatusBadge } from '../common/ApiStatusBadge';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    selectedMonth,
    selectedMonthLabel,
    setSelectedMonth,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    setActivePage,
    insights,
  } = useFinance();

  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const monthRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const months = [
    { key: '2026-09', label: 'September 2026' },
    { key: '2026-08', label: 'August 2026' },
    { key: '2026-07', label: 'July 2026' },
    { key: '2026-06', label: 'June 2026' },
    { key: '2026-05', label: 'May 2026' },
    { key: '2026-04', label: 'April 2026' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setIsMonthOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length > 0) {
      setActivePage('transactions');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#f4f7f6]/90 dark:bg-[#0b1120]/90 backdrop-blur-md border-b border-transparent dark:border-slate-800/60 transition-colors">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Right Controls: API Status, Month Selector, Notification Bell, Dark Mode Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend API Connection Indicator */}
        <ApiStatusBadge />

        {/* Month Selector Dropdown */}
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setIsMonthOpen(!isMonthOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition"
          >
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-400" />
            <span>{selectedMonthLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isMonthOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-40 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Select Month
              </div>
              {months.map(m => (
                <button
                  key={m.key}
                  onClick={() => {
                    setSelectedMonth(m.key);
                    setIsMonthOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition ${
                    selectedMonth === m.key
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{m.label}</span>
                  {selectedMonth === m.key && <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (unreadNotifications > 0) setUnreadNotifications(0);
            }}
            className="relative p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800 animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-40 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700/70">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 cursor-pointer hover:underline">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark read
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/40">
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Salary credited</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      ₹50,000 deposited by TechCorp Pvt Ltd on Sep 1.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>

                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Budget Alert</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Shopping budget reached 84% of your limit.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                  </div>
                </div>

                {insights.slice(0, 1).map(ins => (
                  <div key={ins.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Smart Financial Tip</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ins.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">3 days ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle Pill */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="relative inline-flex items-center h-8 w-14 rounded-full p-1 bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40"
        >
          <span
            className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform shadow-md flex items-center justify-center text-slate-700 ${
              theme === 'dark' ? 'translate-x-6 bg-slate-900 text-yellow-300' : 'translate-x-0'
            }`}
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </span>
        </button>
      </div>
    </header>
  );
};
