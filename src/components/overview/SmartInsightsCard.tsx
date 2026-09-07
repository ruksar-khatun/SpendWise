import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Lightbulb, ArrowUpRight, ArrowDownRight, Percent, Star, MoreHorizontal } from 'lucide-react';

export const SmartInsightsCard: React.FC = () => {
  const { insights, setActivePage } = useFinance();

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend-up':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'percent':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Percent className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'trend-down':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'star':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 fill-current" />
          </div>
        );
    }
  };

  return (
    <div className="fintech-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-emerald-500" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Smart Insights</h2>
      </div>

      {/* List of Insight Cards */}
      <div className="space-y-2.5 flex-1">
        {insights.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition group cursor-pointer"
            onClick={() => setActivePage('analytics')}
          >
            <div className="flex items-center gap-3 pr-2">
              {getIcon(item.iconType)}
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">
                {item.message}
              </p>
            </div>

            <button
              onClick={e => {
                e.stopPropagation();
                setActivePage('analytics');
              }}
              className="p-1 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 rounded-lg flex-shrink-0"
              aria-label="Insight options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
        <button
          onClick={() => setActivePage('analytics')}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
        >
          View all analytics & trends →
        </button>
      </div>
    </div>
  );
};
