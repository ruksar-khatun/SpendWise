import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const PAGE_LABELS: Record<string, string> = {
  overview: 'Dashboard',
  transactions: 'Transactions',
  budgets: 'Budgets',
  analytics: 'Analytics',
  savings: 'Savings Goals',
  settings: 'Settings',
  profile: 'Profile',
  help: 'Help & Support',
};

interface PageBackButtonProps {
  className?: string;
  customLabel?: string;
  variant?: 'button' | 'breadcrumb';
}

export const PageBackButton: React.FC<PageBackButtonProps> = ({
  className = '',
  customLabel,
  variant = 'button',
}) => {
  const { goBack, canGoBack, previousPage } = useFinance();

  if (!canGoBack) return null;

  const targetLabel =
    customLabel || (previousPage ? PAGE_LABELS[previousPage] || 'Dashboard' : 'Dashboard');

  if (variant === 'breadcrumb') {
    return (
      <button
        type="button"
        onClick={goBack}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition group ${className}`}
        aria-label={`Go back to ${targetLabel}`}
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        <span>Back to {targetLabel}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 px-4 py-2 sm:py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500/50 shadow-2xs hover:shadow-xs transition active:scale-95 group touch-manipulation cursor-pointer ${className}`}
      aria-label={`Go back to ${targetLabel}`}
      title={`Go back to ${targetLabel}`}
    >
      <ArrowLeft className="w-4 h-4 text-teal-600 dark:text-teal-400 transition-transform group-hover:-translate-x-1" />
      <span>Back to {targetLabel}</span>
    </button>
  );
};
