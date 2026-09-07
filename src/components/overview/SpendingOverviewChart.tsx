import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import {
  formatINR,
  getThisMonthWeeklyData,
  getThisYearQuarterlyData,
} from '../../utils/calculations';
import { ChevronDown } from 'lucide-react';

export const SpendingOverviewChart: React.FC = () => {
  const { monthlyTrend, theme, transactions, selectedMonth } = useFinance();
  const [metricType, setMetricType] = useState<'income' | 'expense' | 'savings'>('expense');
  const [timeRange, setTimeRange] = useState<'This Month' | '6 Months' | '3 Months' | 'This Year'>('6 Months');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);

  // Filter data based on time range
  const chartData = React.useMemo(() => {
    if (timeRange === 'This Month') {
      return getThisMonthWeeklyData(transactions, selectedMonth);
    }
    if (timeRange === '3 Months') {
      return monthlyTrend.slice(-3);
    }
    if (timeRange === 'This Year') {
      return getThisYearQuarterlyData(transactions, '2026');
    }
    return monthlyTrend;
  }, [monthlyTrend, timeRange, transactions, selectedMonth]);

  // Color config based on metric
  const metricConfig = {
    expense: {
      color: '#14b8a6',
      fillStart: 'rgba(20, 184, 166, 0.25)',
      fillEnd: 'rgba(20, 184, 166, 0.01)',
      label: 'Expense',
    },
    income: {
      color: '#10b981',
      fillStart: 'rgba(16, 185, 129, 0.25)',
      fillEnd: 'rgba(16, 185, 129, 0.01)',
      label: 'Income',
    },
    savings: {
      color: '#06b6d4',
      fillStart: 'rgba(6, 182, 212, 0.25)',
      fillEnd: 'rgba(6, 182, 212, 0.01)',
      label: 'Savings',
    },
  }[metricType];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const fullLabel = payload[0].payload?.month || label;
      return (
        <div className="bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{formatINR(val)}</span>
            <span className="text-emerald-500 font-semibold flex items-center text-[11px]">
              ▲ 12%
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-400 text-[11px] block mt-0.5">{fullLabel}</span>
        </div>
      );
    }
    return null;
  };

  const isDark = theme === 'dark';

  return (
    <div className="fintech-card p-6 flex flex-col justify-between h-full">
      {/* Top Header & Interactive Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Spending Overview</h2>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Segmented Pill: Income | Expense | Savings */}
          <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-full text-xs font-medium">
            <button
              onClick={() => setMetricType('income')}
              className={`px-3 py-1 rounded-full transition-all ${
                metricType === 'income'
                  ? 'bg-white dark:bg-teal-900 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setMetricType('expense')}
              className={`px-3 py-1 rounded-full transition-all ${
                metricType === 'expense'
                  ? 'bg-[#e2f6f2] dark:bg-brand-900/60 text-brand-800 dark:text-brand-200 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setMetricType('savings')}
              className={`px-3 py-1 rounded-full transition-all ${
                metricType === 'savings'
                  ? 'bg-white dark:bg-teal-900 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Savings
            </button>
          </div>

          {/* Time Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full hover:border-slate-300 transition"
            >
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTimeRangeOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30 text-xs">
                {(['This Month', '3 Months', '6 Months', 'This Year'] as const).map(tr => (
                  <button
                    key={tr}
                    onClick={() => {
                      setTimeRange(tr);
                      setIsTimeRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 ${
                      timeRange === tr
                        ? 'text-brand-600 font-semibold dark:text-brand-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke={isDark ? '#26344d' : '#f1f5f9'}
            />
            <XAxis
              dataKey="monthShort"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 11 }}
              tickFormatter={value => (value === 0 ? '0' : `${value / 1000}K`)}
              domain={[0, 40000]}
              ticks={[0, 10000, 20000, 30000, 40000]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#14b8a6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey={metricType}
              stroke={metricConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendingGradient)"
              activeDot={{
                r: 5,
                fill: metricConfig.color,
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
