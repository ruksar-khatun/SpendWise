import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/calculations';
import { CATEGORY_COLORS } from '../../utils/constants';
import { Plus, Edit2, AlertTriangle, CheckCircle, PieChart, Sparkles } from 'lucide-react';

interface BudgetsPageProps {
  onOpenSetBudget: (category?: string, amount?: number) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ onOpenSetBudget }) => {
  const { budgets, transactions, selectedMonth, selectedMonthLabel } = useFinance();

  const monthExpenses = transactions.filter(
    t => t.date.startsWith(selectedMonth) && t.type === 'expense'
  );

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0) || 27420;
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0) || 35000;
  const overallPercentage = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Monthly Budgets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Plan your category limits and stay in complete control for {selectedMonthLabel}.
          </p>
        </div>

        <button
          onClick={() => onOpenSetBudget()}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-teal-600/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Set Budget</span>
        </button>
      </div>

      {/* Overall Budget Hero Card */}
      <div className="fintech-card p-6 relative overflow-hidden bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white border-0 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">Overall Monthly Budget</span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl sm:text-4xl font-black">{formatINR(totalSpent)}</h2>
              <span className="text-teal-200 text-sm font-medium">/ {formatINR(totalBudget)}</span>
            </div>
            <p className="text-xs text-teal-100/80 mt-1">
              {totalSpent <= totalBudget
                ? `You have ${formatINR(totalBudget - totalSpent)} left for the rest of the month.`
                : `You have exceeded your total limit by ${formatINR(totalSpent - totalBudget)}.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold">{overallPercentage}%</span>
              <p className="text-xs text-teal-200 uppercase tracking-wider">Budget Used</p>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 bg-white/20 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Category Budgets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const spent = monthExpenses
              .filter(t => t.category === budget.category)
              .reduce((s, t) => s + t.amount, 0);

            const pct = Math.min(100, Math.round((spent / budget.amount) * 100));
            const isNearLimit = pct >= 80 && pct < 100;
            const isExceeded = spent > budget.amount;
            const catColor = CATEGORY_COLORS[budget.category] || '#14b8a6';

            return (
              <div
                key={budget.id}
                className="fintech-card p-5 relative group hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: catColor }}
                      />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{budget.category}</h4>
                    </div>

                    <button
                      onClick={() => onOpenSetBudget(budget.category, budget.amount)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Adjust budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatINR(spent)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                        / {formatINR(budget.amount)}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isExceeded
                          ? 'text-rose-600 dark:text-rose-400'
                          : isNearLimit
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isExceeded ? '#f43f5e' : isNearLimit ? '#f59e0b' : catColor,
                      }}
                    />
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {isExceeded ? (
                    <span className="text-rose-500 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Over budget by {formatINR(spent - budget.amount)}
                    </span>
                  ) : isNearLimit ? (
                    <span className="text-amber-500 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Approaching limit
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> On track ({formatINR(budget.amount - spent)} left)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
