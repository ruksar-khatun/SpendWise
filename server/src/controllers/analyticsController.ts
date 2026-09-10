import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const month = typeof req.query.month === 'string' ? req.query.month : '2026-09';

  // All transactions for user to calculate all-time total balance
  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
  });

  const totalIncomeAllTime = allTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseAllTime = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncomeAllTime - totalExpenseAllTime;

  // Selected month transactions
  const monthTransactions = allTransactions.filter(t => t.date.startsWith(month));

  const monthlyIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  for (const t of monthTransactions) {
    if (t.type === 'expense') {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  res.json({
    summary: {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate: Math.round(savingsRate * 10) / 10,
      transactionCount: monthTransactions.length,
      categoryBreakdown,
    },
  });
};

export const getHealthScore = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const month = typeof req.query.month === 'string' ? req.query.month : '2026-09';

  const [transactions, budgets, goals] = await Promise.all([
    prisma.transaction.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId, month } }),
    prisma.savingsGoal.findMany({ where: { userId } }),
  ]);

  const monthTx = transactions.filter(t => t.date.startsWith(month));
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);

  // 1. Budget Adherence (30 pts)
  let budgetScore = 30;
  if (totalBudget > 0) {
    const ratio = expenses / totalBudget;
    if (ratio <= 0.8) budgetScore = 30;
    else if (ratio <= 1.0) budgetScore = 24;
    else if (ratio <= 1.15) budgetScore = 14;
    else budgetScore = 5;
  }

  // 2. Savings Rate (30 pts)
  let savingsScore = 20;
  if (income > 0) {
    const rate = ((income - expenses) / income) * 100;
    if (rate >= 40) savingsScore = 30;
    else if (rate >= 25) savingsScore = 25;
    else if (rate >= 15) savingsScore = 18;
    else if (rate >= 0) savingsScore = 10;
    else savingsScore = 0;
  }

  // 3. Consistency (20 pts)
  const consistencyScore = 18; // Benchmark baseline

  // 4. Goals velocity (20 pts)
  let goalsScore = 15;
  if (goals.length > 0) {
    const avgProgress = goals.reduce((s, g) => s + (g.currentAmount / g.targetAmount), 0) / goals.length;
    goalsScore = Math.min(20, Math.round(avgProgress * 25));
  }

  const totalScore = Math.min(100, Math.max(0, budgetScore + savingsScore + consistencyScore + goalsScore));

  let status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
  if (totalScore >= 85) status = 'Excellent';
  else if (totalScore >= 70) status = 'Good';
  else if (totalScore >= 50) status = 'Fair';
  else status = 'Needs Attention';

  const checklist = [
    {
      id: 'chk-1',
      text: `Total spending (${expenses.toLocaleString()}) within overall budget (${totalBudget.toLocaleString()})`,
      passed: totalBudget > 0 ? expenses <= totalBudget : true,
    },
    {
      id: 'chk-2',
      text: 'Healthy monthly savings rate maintained above 20%',
      passed: income > 0 && ((income - expenses) / income) >= 0.20,
    },
    {
      id: 'chk-3',
      text: 'Active progress recorded on personal savings goals',
      passed: goals.length > 0 && goals.some(g => g.currentAmount > 0),
    },
  ];

  res.json({
    healthScore: {
      score: totalScore,
      status,
      budgetScore,
      savingsScore,
      consistencyScore,
      goalsScore,
      checklist,
    },
  });
};