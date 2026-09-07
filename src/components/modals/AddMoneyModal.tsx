import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/calculations';
import { X, Sparkles } from 'lucide-react';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string | null;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose, goalId }) => {
  const { goals, addMoneyToGoal } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const targetGoal = goals.find(g => g.id === goalId);

  if (!isOpen || !targetGoal) return null;

  const currentPct = Math.min(100, Math.round((targetGoal.currentAmount / targetGoal.targetAmount) * 100));

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    addMoneyToGoal(targetGoal.id, num);
    setAmount('');
    setError('');
    onClose();
  };

  const quickPills = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Deposit to Goal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{targetGoal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
          <div className="flex justify-between items-baseline mb-2 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Current Progress</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{currentPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${currentPct}%` }} />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-400 dark:text-slate-500">
            <span>{formatINR(targetGoal.currentAmount)}</span>
            <span>Target: {formatINR(targetGoal.targetAmount)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleDeposit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Deposit Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="any"
                placeholder="Enter amount to add"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-base"
                autoFocus
              />
            </div>
            {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Quick preset amount pills */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Select</span>
            <div className="flex flex-wrap gap-2">
              {quickPills.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                >
                  +{formatINR(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
