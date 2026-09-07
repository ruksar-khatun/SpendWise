import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { X, Target } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: SavingsGoal | null;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  editGoal,
}) => {
  const { addGoal, editGoal: updateGoalAction } = useFinance();

  const [name, setName] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-01-01');
  const [category, setCategory] = useState('General');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name);
      setCurrentAmount(editGoal.currentAmount.toString());
      setTargetAmount(editGoal.targetAmount.toString());
      setTargetDate(editGoal.targetDate);
      setCategory(editGoal.category);
    } else {
      setName('');
      setCurrentAmount('0');
      setTargetAmount('');
      setTargetDate('2027-06-30');
      setCategory('Personal');
    }
    setErrors({});
  }, [editGoal, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Goal name is required';
    const target = parseFloat(targetAmount);
    if (!targetAmount || isNaN(target) || target <= 0) {
      errs.targetAmount = 'Enter a target amount greater than 0';
    }
    const current = parseFloat(currentAmount);
    if (isNaN(current) || current < 0) {
      errs.currentAmount = 'Starting amount cannot be negative';
    }
    if (!targetDate) errs.targetDate = 'Target date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount) || 0;

    if (editGoal) {
      updateGoalAction(editGoal.id, {
        name: name.trim(),
        currentAmount: parsedCurrent,
        targetAmount: parsedTarget,
        targetDate,
        category,
      });
    } else {
      addGoal({
        name: name.trim(),
        currentAmount: parsedCurrent,
        targetAmount: parsedTarget,
        targetDate,
        category,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Goal Name *</label>
            <input
              type="text"
              placeholder="e.g. Dream Vacation, New Car, Emergency Fund"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {errors.name && <p className="text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Amount (₹) *</label>
              <input
                type="number"
                placeholder="50,000"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              {errors.targetAmount && <p className="text-rose-500 mt-1">{errors.targetAmount}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Current Saved (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              {errors.currentAmount && <p className="text-rose-500 mt-1">{errors.currentAmount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Date *</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              {errors.targetDate && <p className="text-rose-500 mt-1">{errors.targetDate}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Safety">Safety & Emergency</option>
                <option value="Vacation">Vacation & Travel</option>
                <option value="Education">Education</option>
                <option value="Personal">Personal</option>
                <option value="Vehicle">Vehicle</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20"
            >
              {editGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
