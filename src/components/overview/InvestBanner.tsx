import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Sprout, ArrowRight } from 'lucide-react';

export const InvestBanner: React.FC = () => {
  const { setActivePage } = useFinance();

  return (
    <div
      onClick={() => setActivePage('analytics')}
      className="relative group cursor-pointer overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-[#d2fae6] via-[#c2f3dc] to-[#a3eed2] dark:from-teal-950 dark:via-emerald-950 dark:to-teal-900 border border-emerald-200/60 dark:border-teal-800/40 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-3.5">
        {/* Plant Sprout Icon */}
        <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 shadow-xs">
          <Sprout className="w-5 h-5" />
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            Invest in your future self
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
            Discipline today, freedom tomorrow.
          </p>
        </div>
      </div>

      {/* Circular Arrow Button */}
      <button
        className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:translate-x-1 group-hover:scale-105 transition-all flex-shrink-0"
        aria-label="View investments and savings"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
