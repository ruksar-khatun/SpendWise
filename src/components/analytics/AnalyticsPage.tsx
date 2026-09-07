import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatINR,
  getThisMonthWeeklyData,
  getThisYearQuarterlyData,
} from '../../utils/calculations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  Flame,
  Award,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { transactions, monthlyTrend, theme, selectedMonth, selectedMonthLabel } = useFinance();
  const [filterPeriod, setFilterPeriod] = useState<'This Month' | 'Last 3 Months' | 'Last 6 Months' | 'This Year'>('This Month');

  const isDark = theme === 'dark';

  // Compute key analytics metrics
  const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
  const currentIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 50000;
  const currentExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 27420;
  const savingsRate = Math.round(((currentIncome - currentExpense) / Math.max(1, currentIncome)) * 100);

  // Highest single expense
  const highestExpenseTx = useMemo(() => {
    const expenses = monthTx.filter(t => t.type === 'expense');
    if (expenses.length === 0) return null;
    return expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0]);
  }, [monthTx]);

  // Average daily spending (assuming 30 days)
  const avgDailySpending = Math.round(currentExpense / 30);

  // Bar chart data for Income vs Expenses - specifically tailored to filterPeriod
  const barChartData = useMemo(() => {
    if (filterPeriod === 'This Month') {
      return getThisMonthWeeklyData(transactions, selectedMonth);
    }
    if (filterPeriod === 'Last 3 Months') {
      return monthlyTrend.slice(-3);
    }
    if (filterPeriod === 'This Year') {
      return getThisYearQuarterlyData(transactions, '2026');
    }
    return monthlyTrend;
  }, [monthlyTrend, filterPeriod, transactions, selectedMonth]);

  const chartTitle = useMemo(() => {
    if (filterPeriod === 'This Month') return `Weekly Cashflow (${selectedMonthLabel})`;
    if (filterPeriod === 'Last 3 Months') return 'Past 3 Months Cashflow';
    if (filterPeriod === 'This Year') return '2026 Quarterly Performance';
    return 'Monthly Income vs Expenses';
  }, [filterPeriod, selectedMonthLabel]);

  const chartSubtitle = useMemo(() => {
    if (filterPeriod === 'This Month') return 'Weekly breakdown of income & expenses specifically for this month';
    if (filterPeriod === 'Last 3 Months') return 'Comparing July, August, and September';
    if (filterPeriod === 'This Year') return 'Quarterly trends across 2026';
    return '6-month trend from April to September 2026';
  }, [filterPeriod]);

  // Top spending categories ranking
  const topCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });
    return Array.from(catMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [monthTx]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Deep dive into your cashflow trends, spending ratios, and financial trajectory.
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          {(['This Month', 'Last 3 Months', 'Last 6 Months', 'This Year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterPeriod === period
                  ? 'bg-white dark:bg-teal-900 text-teal-700 dark:text-teal-200 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Spending Average */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Spending Avg</span>
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatINR(avgDailySpending)}
            <span className="text-xs font-normal text-slate-400"> / day</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Based on 30-day billing cycle</p>
        </div>

        {/* Highest Single Expense */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Expense</span>
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {highestExpenseTx ? formatINR(highestExpenseTx.amount) : '₹6,000'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {highestExpenseTx ? `${highestExpenseTx.description} (${highestExpenseTx.category})` : 'Fresh Groceries'}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {savingsRate}%
          </h3>
          <p className="text-xs text-slate-500 mt-1">Goal benchmark is 20%+</p>
        </div>

        {/* Net Monthly Margin */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatINR(currentIncome - currentExpense)}
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">+12.6% vs August</p>
        </div>
      </div>

      {/* Main Charts: Income vs Expense Comparison & Spending Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-7 fintech-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{chartTitle}</h3>
              <p className="text-xs text-slate-400">{chartSubtitle}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Expenses
              </span>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="monthShort" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => `${v / 1000}K`}
                />
                <Tooltip
                  formatter={(val: any) => formatINR(Number(val))}
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spending Categories List & Progress */}
        <div className="lg:col-span-5 fintech-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Spending Categories</h3>
            <p className="text-xs text-slate-400 mb-4">Highest expense drains this billing cycle</p>

            <div className="space-y-3">
              {topCategories.map((cat, idx) => {
                const pct = Math.round((cat.amount / currentExpense) * 100);
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {idx + 1}. {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{formatINR(cat.amount)}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              Food and Shopping represent over 56% of your monthly expenditure.
            </span>
          </div>
        </div>
      </div>

      {/* Key Takeaways Section */}
      <div className="fintech-card p-6 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/20 dark:from-slate-900 dark:via-teal-950/20 dark:to-emerald-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Key Takeaways</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Healthy Margin
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">Supercharged Savings Rate</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Your 45% savings rate exceeds standard fintech benchmarks by 25%, granting extra buffer for investments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Optimization Tip
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">Food Spending Optimization</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Food expenditures rose 18% month-over-month. Reducing dining out by 10% could save ₹800 monthly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
              Goal Pace
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">Emergency Fund Milestone</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              At your current trajectory, your Emergency Fund goal will be fully funded 2 months ahead of schedule!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
