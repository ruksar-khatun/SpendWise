import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/calculations';
import { Utensils, ShoppingBag, Car, Zap, Tv, ChevronDown, Plus } from 'lucide-react';

export const BudgetStatusCard: React.FC = () => {
  const {
    budgets,
    transactions,
    selectedMonth,
    selectedMonthLabel,
    setActivePage,
    setIsSetBudgetOpen,
  } = useFinance();

  // Calculate actual spending per category for selectedMonth
  const monthExpenses = transactions.filter(
    t => t.date.startsWith(selectedMonth) && t.type === 'expense'
  );

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0) || 27420;
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0) || 35000;
  const overallPercentage = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  // Category configs matching reference image
  const categoryConfigs: Record<
    string,
    { icon: React.ReactNode; bg: string; color: string; defaultSpent: number; defaultLimit: number }
  > = {
    Food: {
      icon: <Utensils className="w-3.5 h-3.5 text-teal-600" />,
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      color: '#14b8a6',
      defaultSpent: 6420,
      defaultLimit: 8000,
    },
    Shopping: {
      icon: <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />,
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      color: '#38bdf8',
      defaultSpent: 4200,
      defaultLimit: 5000,
    },
    Transport: {
      icon: <Car className="w-3.5 h-3.5 text-indigo-600" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      color: '#6366f1',
      defaultSpent: 2850,
      defaultLimit: 4000,
    },
    Bills: {
      icon: <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      color: '#f59e0b',
      defaultSpent: 4200,
      defaultLimit: 6000,
    },
    Entertainment: {
      icon: <Tv className="w-3.5 h-3.5 text-purple-600" />,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      color: '#a855f7',
      defaultSpent: 1900,
      defaultLimit: 3000,
    },
  };

  const displayCategories = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment'];

  return (
    <div className="fintech-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Budget Status</h2>
        <button
          onClick={() => setActivePage('budgets')}
          className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 transition"
        >
          <span>{selectedMonthLabel}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Overall Budget Header & Progress Bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatINR(totalSpent)} <span className="text-xs font-normal text-slate-400">/ {formatINR(totalBudget)}</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {overallPercentage}% used
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Budget Rows */}
      <div className="space-y-3">
        {displayCategories.map(cat => {
          const cfg = categoryConfigs[cat];
          const budgetItem = budgets.find(b => b.category === cat);
          const limit = budgetItem ? budgetItem.amount : cfg.defaultLimit;
          const actual = monthExpenses
            .filter(t => t.category === cat)
            .reduce((s, t) => s + t.amount, 0) || cfg.defaultSpent;
          const pct = Math.min(100, Math.round((actual / limit) * 100));

          return (
            <div key={cat} className="group cursor-pointer" onClick={() => setActivePage('budgets')}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    {cfg.icon}
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{cat}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {formatINR(actual)} / {formatINR(limit)}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-8 max-w-[calc(100%-2rem)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 90 ? '#f43f5e' : cfg.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link to manage budgets */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
        <button
          onClick={() => setIsSetBudgetOpen(true)}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Adjust category budgets
        </button>
      </div>
    </div>
  );
};
