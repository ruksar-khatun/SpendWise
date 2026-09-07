import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { GreetingHeader } from './GreetingHeader';
import { StatCard } from './StatCard';
import { SpendingOverviewChart } from './SpendingOverviewChart';
import { SpendingByCategoryChart } from './SpendingByCategoryChart';
import { FinancialHealthCard } from './FinancialHealthCard';
import { RecentTransactionsCard } from './RecentTransactionsCard';
import { BudgetStatusCard } from './BudgetStatusCard';
import { SmartInsightsCard } from './SmartInsightsCard';
import { SavingsGoalsSection } from './SavingsGoalsSection';
import { InvestBanner } from './InvestBanner';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface OverviewPageProps {
  onOpenDepositModal: (goalId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onOpenDepositModal }) => {
  const { summary, setActivePage } = useFinance();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Greeting & Quote */}
      <GreetingHeader />

      {/* 2. Four KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Balance */}
        <StatCard
          title="Total Balance"
          amount={summary.totalBalance}
          deltaPercent={summary.balanceChange}
          comparisonText="from last month"
          isPositiveDelta={true}
          icon={<Wallet className="w-5 h-5 text-teal-600" />}
          iconBgColor="#ccfbf1"
          onMenuAction={() => setActivePage('analytics')}
        />

        {/* Card 2: Monthly Income */}
        <StatCard
          title="Monthly Income"
          amount={summary.currentIncome}
          deltaPercent={summary.incomeChange}
          comparisonText="from last month"
          isPositiveDelta={true}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          iconBgColor="#a7f3d0"
          onMenuAction={() => setActivePage('transactions')}
        />

        {/* Card 3: Monthly Expenses */}
        <StatCard
          title="Monthly Expenses"
          amount={summary.currentExpense}
          deltaPercent={summary.expenseChange}
          comparisonText="from last month"
          isPositiveDelta={summary.expenseChange <= 0}
          reverseDeltaColor={true}
          icon={<TrendingDown className="w-5 h-5 text-rose-500" />}
          iconBgColor="#ffe4e6"
          onMenuAction={() => setActivePage('transactions')}
        />

        {/* Card 4: Savings */}
        <StatCard
          title="Savings"
          amount={summary.savings}
          deltaPercent={summary.savingsChange}
          comparisonText="from last month"
          isPositiveDelta={true}
          icon={<PiggyBank className="w-5 h-5 text-emerald-700" />}
          iconBgColor="#bbf7d0"
          onMenuAction={() => setActivePage('savings')}
        />
      </div>

      {/* 3. Middle Row: Spending Overview (6 cols), Category Donut (3 cols), Financial Health (3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
        <div className="md:col-span-2 xl:col-span-6 min-h-[340px]">
          <SpendingOverviewChart />
        </div>
        <div className="md:col-span-1 xl:col-span-3 min-h-[340px]">
          <SpendingByCategoryChart />
        </div>
        <div className="md:col-span-1 xl:col-span-3 min-h-[340px]">
          <FinancialHealthCard />
        </div>
      </div>

      {/* 4. Lower Row: Recent Transactions (4 cols), Budget Status (4 cols), Smart Insights (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 min-h-[380px]">
          <RecentTransactionsCard />
        </div>
        <div className="lg:col-span-4 min-h-[380px]">
          <BudgetStatusCard />
        </div>
        <div className="lg:col-span-4 min-h-[380px]">
          <SmartInsightsCard />
        </div>
      </div>

      {/* 5. Bottom Row: Savings Goals (9 cols) + Invest Banner (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
        <div className="lg:col-span-9">
          <SavingsGoalsSection onAddMoney={onOpenDepositModal} />
        </div>
        <div className="lg:col-span-3">
          <InvestBanner />
        </div>
      </div>
    </div>
  );
};
