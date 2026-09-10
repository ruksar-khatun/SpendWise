import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be formatted YYYY-MM-DD'),
  category: z.string().default('General'),
  currentAmount: z.number().min(0).default(0),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ goals });
};

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const data = goalSchema.parse(req.body);

  const goal = await prisma.savingsGoal.create({
    data: {
      ...data,
      userId,
    },
  });

  res.status(201).json({
    message: 'Savings goal created successfully',
    goal,
  });
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = goalSchema.partial().parse(req.body);

  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'Goal not found or unauthorized' });
    return;
  }

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data,
  });

  res.json({
    message: 'Savings goal updated successfully',
    goal: updated,
  });
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'Goal not found or unauthorized' });
    return;
  }

  await prisma.savingsGoal.delete({
    where: { id },
  });

  res.json({ message: 'Savings goal deleted successfully', id });
};

export const depositToGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { amount } = z.object({ amount: z.number().positive('Deposit amount must be positive') }).parse(req.body);

  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    res.status(404).json({ error: 'Goal not found or unauthorized' });
    return;
  }

  const newCurrent = goal.currentAmount + amount;
  const completed = newCurrent >= goal.targetAmount;

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: newCurrent },
  });

  res.json({
    message: `Deposited ₹${amount.toLocaleString()} into ${goal.name}`,
    goal: updated,
    completed,
  });
};