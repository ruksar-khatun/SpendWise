import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatINR } from '../../utils/calculations';
import {
  Plus,
  Target,
  Laptop,
  Shield,
  Plane,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface SavingsGoalsPageProps {
  onOpenAddGoal: () => void;
  onOpenEditGoal: (goal: SavingsGoal) => void;
  onOpenDeposit: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoalsPage: React.FC<SavingsGoalsPageProps> = ({
  onOpenAddGoal,
  onOpenEditGoal,
  onOpenDeposit,
  onDeleteGoal,
}) => {
  const { goals } = useFinance();

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const getGoalIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('macbook') || n.includes('laptop') || n.includes('tech')) {
      return (
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <Laptop className="w-5 h-5" />
        </div>
      );
    }
    if (n.includes('emergency') || n.includes('safety') || n.includes('fund')) {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
      );
    }
    if (n.includes('travel') || n.includes('trip') || n.includes('vacation')) {
      return (
        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5" />
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Turn your dreams into reality with disciplined milestones and progress tracking.
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-teal-600/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Goal</span>
        </button>
      </div>

      {/* Hero Overview Card */}
      <div className="fintech-card p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-teal-950/40 dark:to-slate-900 border border-teal-200/50 dark:border-teal-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Total Target Portfolio
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatINR(totalSaved)}
              </h2>
              <span className="text-sm font-medium text-slate-400">of {formatINR(totalTarget)} target</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are {totalProgress}% toward funding all your active life goals.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
                {totalProgress}%
              </span>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Progress</p>
            </div>
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Grid of Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = pct >= 100;

          return (
            <div
              key={goal.id}
              className={`fintech-card p-6 flex flex-col justify-between transition-all hover:shadow-card-hover ${
                isCompleted ? 'border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/20' : ''
              }`}
            >
              <div>
                {/* Header: Icon, Name, Action buttons */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getGoalIcon(goal.name)}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {goal.name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {goal.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditGoal(goal)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatINR(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: {formatINR(goal.targetAmount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">
                      Target: {formatTargetDate(goal.targetDate)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Goal Completed Badge */}
                {isCompleted && (
                  <div className="mt-4 p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Goal completed!</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => onOpenDeposit(goal.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/10 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Goal Card */}
        <div
          onClick={onOpenAddGoal}
          className="fintech-card p-6 border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-500 bg-transparent flex flex-col items-center justify-center text-center cursor-pointer group min-h-[220px] transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center transition-all mb-3 shadow-xs">
            <Plus className="w-6 h-6 stroke-[2]" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
            Create New Savings Goal
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Set a target date and dollar amount for your next big milestone.
          </p>
        </div>
      </div>
    </div>
  );
};
