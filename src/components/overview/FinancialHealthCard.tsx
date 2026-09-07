import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MoreHorizontal, Check, AlertTriangle, Info } from 'lucide-react';

export const FinancialHealthCard: React.FC = () => {
  const { healthScore, setActivePage } = useFinance();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { score, status, checklist, budgetScore, savingsScore, consistencyScore, goalsScore } = healthScore;

  // SVG Gauge calculations
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="fintech-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Financial Health</h2>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
          aria-label="Toggle breakdown"
          title="Click to view score breakdown"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {showBreakdown ? (
        /* Detailed Points Breakdown Modal/View */
        <div className="py-2 space-y-2 text-xs animate-fade-in">
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Budget Adherence:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{budgetScore} / 30 pts</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Savings Rate:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{savingsScore} / 30 pts</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Expense Consistency:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{consistencyScore} / 20 pts</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Goal Milestones:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{goalsScore} / 20 pts</span>
          </div>
          <button
            onClick={() => setShowBreakdown(false)}
            className="mt-2 w-full py-1.5 text-center text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            ← Back to Overview
          </button>
        </div>
      ) : (
        /* Normal Gauge and Checklist */
        <>
          {/* Circular Progress Gauge */}
          <div className="flex flex-col items-center justify-center my-1">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-[#14b8a6] transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Center Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {score}
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            {/* Status Text */}
            <div className="mt-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                {status}
              </span>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-1.5 mt-2">
            {checklist.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-xs cursor-pointer group"
                onClick={() => setActivePage('analytics')}
              >
                {item.isWarning ? (
                  <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold">!</span>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <span
                  className={`text-[11px] font-medium ${
                    item.isWarning
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
