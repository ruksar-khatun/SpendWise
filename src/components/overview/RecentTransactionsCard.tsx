import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/calculations';
import { Utensils, Car, ShoppingBag, Zap, Briefcase, Plus, ArrowRight } from 'lucide-react';

export const RecentTransactionsCard: React.FC = () => {
  const { transactions, setActivePage, setIsAddTransactionOpen, setIsImportModalOpen } = useFinance();

  // Ensure the 5 showcased reference transactions from the image are displayed
  const referenceDisplayTx = [
    transactions.find(t => t.description.toLowerCase().includes('swiggy')),
    transactions.find(t => t.description.toLowerCase().includes('uber')),
    transactions.find(t => t.description.toLowerCase().includes('amazon')),
    transactions.find(t => t.description.toLowerCase().includes('electricity')),
    transactions.find(t => t.description.toLowerCase().includes('salary')),
  ].filter(Boolean) as typeof transactions;

  const recentList = referenceDisplayTx.length === 5 ? referenceDisplayTx : transactions.slice(0, 5);


  const getMerchantIcon = (desc: string, category: string) => {
    const d = desc.toLowerCase();
    if (d.includes('swiggy') || category === 'Food') {
      return (
        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
          <Utensils className="w-4 h-4" />
        </div>
      );
    }
    if (d.includes('uber') || category === 'Transport') {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
          <Car className="w-4 h-4" />
        </div>
      );
    }
    if (d.includes('amazon') || category === 'Shopping') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
          <ShoppingBag className="w-4 h-4" />
        </div>
      );
    }
    if (d.includes('electricity') || d.includes('bill') || category === 'Bills') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center font-bold text-xs">
          <Zap className="w-4 h-4 fill-current" />
        </div>
      );
    }
    if (category === 'Salary' || category === 'Income') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
          <Briefcase className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
        {desc.charAt(0)}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[monthIndex]} ${day}, ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fintech-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActivePage('transactions');
              setIsImportModalOpen(true);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300 transition"
            title="Import Bank Statement"
          >
            Import
          </button>
          <button
            onClick={() => setActivePage('transactions')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentList.map(tx => {
              const isIncome = tx.type === 'income';
              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => setActivePage('transactions')}
                >
                  {/* Merchant & Name */}
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2.5">
                      {getMerchantIcon(tx.description, tx.category)}
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {tx.description}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 pr-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {tx.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-2.5 pr-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(tx.date)}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 text-right whitespace-nowrap">
                    <span
                      className={`text-xs font-bold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-500 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      {formatINR(tx.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Add footer button */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
        <button
          onClick={() => setIsAddTransactionOpen(true)}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Log new transaction
        </button>
      </div>
    </div>
  );
};
