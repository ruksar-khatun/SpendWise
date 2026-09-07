import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/calculations';
import { Laptop, Shield, Plane, Plus, MoreHorizontal, Sparkles } from 'lucide-react';

interface SavingsGoalsSectionProps {
  onAddMoney?: (goalId: string) => void;
}

export const SavingsGoalsSection: React.FC<SavingsGoalsSectionProps> = ({ onAddMoney }) => {
  const { goals, setActivePage, setIsAddGoalOpen } = useFinance();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getGoalIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('macbook') || n.includes('laptop') || n.includes('tech')) {
      return (
        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <Laptop className="w-4 h-4" />
        </div>
      );
    }
    if (n.includes('emergency') || n.includes('safety') || n.includes('fund')) {
      return (
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4" />
        </div>
      );
    }
    if (n.includes('travel') || n.includes('trip') || n.includes('vacation')) {
      return (
        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
          <Plane className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
    );
  };

  const formatTargetDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Savings Goals</h2>
        <button
          onClick={() => setActivePage('savings')}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
        >
          View all
        </button>
      </div>

      {/* Grid of Goals: 3 Goal Cards + 1 Add Goal Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {goals.slice(0, 3).map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isDone = pct >= 100;

          return (
            <div
              key={goal.id}
              className="fintech-card p-4 relative group hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Icon, Title, 3-dot Menu */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getGoalIcon(goal.name)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{goal.name}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                      className="p-1 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                      aria-label="Goal options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === goal.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30 text-xs animate-fade-in">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onAddMoney?.(goal.id);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          + Add Money
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setActivePage('savings');
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Manage Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Target: {formatTargetDate(goal.targetDate)}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{pct}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Add Funds button */}
              <button
                onClick={() => onAddMoney?.(goal.id)}
                className="mt-3 w-full py-1 text-center text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-lg transition"
              >
                + Deposit Funds
              </button>
            </div>
          );
        })}

        {/* 4th Card: + Add Goal card */}
        <div
          onClick={() => setIsAddGoalOpen(true)}
          className="p-4 rounded-2xl border-2 border-dashed border-slate-200/90 dark:border-slate-800/90 hover:border-teal-400 dark:hover:border-teal-600 bg-white/40 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center transition-all mb-2 shadow-xs">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
            Add Goal
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Turn your plans into progress
          </p>
        </div>
      </div>
    </div>
  );
};
