import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/calculations';
import { MoreHorizontal } from 'lucide-react';

export const SpendingByCategoryChart: React.FC = () => {
  const { categorySpending, setActivePage } = useFinance();
  const { categories, totalSpent } = categorySpending;

  // Ensure categories fit cleanly and don't overflow vertically or horizontally
  const displayData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { category: 'Food', amount: 8774, percentage: 32, color: '#14b8a6' },
        { category: 'Shopping', amount: 6580, percentage: 24, color: '#38bdf8' },
        { category: 'Transport', amount: 4935, percentage: 18, color: '#6366f1' },
        { category: 'Bills', amount: 4113, percentage: 15, color: '#f59e0b' },
        { category: 'Entertainment', amount: 3016, percentage: 11, color: '#a855f7' },
        { category: 'Health', amount: 1645, percentage: 6, color: '#2dd4bf' },
        { category: 'Other', amount: 1097, percentage: 4, color: '#cbd5e1' },
      ];
    }

    if (categories.length <= 7) return categories;

    const top6 = categories.slice(0, 6);
    const otherAmount = categories.slice(6).reduce((sum, c) => sum + c.amount, 0);
    const otherPct = totalSpent > 0 ? Math.round((otherAmount / totalSpent) * 100) : 0;

    return [
      ...top6,
      { category: 'Other', amount: otherAmount, percentage: otherPct, color: '#94a3b8' },
    ];
  }, [categories, totalSpent]);

  return (
    <div className="fintech-card p-4 sm:p-5 flex flex-col justify-between h-full overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
          Spending by Category
        </h2>
        <button
          onClick={() => setActivePage('analytics')}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition flex-shrink-0"
          aria-label="View category analytics"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Donut Chart and Legend Container */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 my-auto min-w-0">
        {/* Left: Donut Chart with Center Label */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 xl:w-36 xl:h-36 flex items-center justify-center flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [formatINR(Number(value)), name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                }}
              />
              <Pie
                data={displayData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={2.5}
                stroke="none"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              {formatINR(totalSpent || 27420)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
              Total Spent
            </span>
          </div>
        </div>

        {/* Right: Legend with Category & Percentage */}
        <div className="flex flex-col justify-center gap-1 flex-1 min-w-0 pl-1">
          {displayData.map(item => (
            <div
              key={item.category}
              className="flex items-center justify-between text-xs group cursor-pointer hover:opacity-80 transition min-w-0 py-0.5"
              onClick={() => setActivePage('transactions')}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[10px] sm:text-[11px] truncate">
                  {item.category}
                </span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-bold text-[10px] sm:text-[11px] flex-shrink-0">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
