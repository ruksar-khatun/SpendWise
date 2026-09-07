import React from 'react';
import { useFinance } from '../../context/FinanceContext';

export const GreetingHeader: React.FC = () => {
  const { settings } = useFinance();

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-6 pt-1 gap-4 overflow-hidden">
      {/* Left Greeting & Subtitle */}
      <div className="z-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}, {settings.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Here's your financial overview for September.
        </p>
      </div>

      {/* Right Motivational Quote with Soft Mint Ambient Glow */}
      <div className="relative z-10 flex items-center self-start md:self-center">
        {/* Soft mint wave/ambient wash behind quote */}
        <div className="absolute -inset-x-6 -inset-y-4 bg-gradient-to-l from-emerald-100/50 via-teal-100/30 to-transparent dark:from-teal-900/20 dark:via-emerald-950/20 dark:to-transparent rounded-full blur-xl pointer-events-none -z-10" />

        <div className="text-right">
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 italic tracking-tight">
            “A better you starts with smarter choices.”
          </p>
        </div>
      </div>
    </div>
  );
};
