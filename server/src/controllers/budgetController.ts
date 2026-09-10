import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Budget limit must be positive'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be formatted YYYY-MM'),
});

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { month } = req.query;

  const where: any = { userId };
  if (typeof month === 'string' && month.trim().length > 0) {
    where.month = month.trim();
  }

  const budgets = await prisma.budget.findMany({
    where,
    orderBy: { category: 'asc' },
  });

  res.json({ budgets });
};

export const upsertBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { category, amount, month } = budgetSchema.parse(req.body);

  const budget = await prisma.budget.upsert({
    where: {
      userId_category_month: {
        userId,
        category,
        month,
      },
    },
    update: { amount },
    create: {
      userId,
      category,
      amount,
      month,
    },
  });

  res.status(200).json({
    message: 'Budget saved successfully',
    budget,
  });
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'Budget not found or unauthorized' });
    return;
  }

  await prisma.budget.delete({
    where: { id },
  });

  res.json({ message: 'Budget deleted successfully', id });
};