import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  notes: z.string().optional(),
  merchant: z.string().optional(),
});

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { month, category, type } = req.query;

  const where: any = { userId };

  if (typeof month === 'string' && month.trim().length > 0) {
    where.date = { startsWith: month.trim() };
  }

  if (typeof category === 'string' && category.trim().length > 0 && category !== 'All') {
    where.category = category.trim();
  }

  if (typeof type === 'string' && (type === 'income' || type === 'expense')) {
    where.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  res.json({ transactions });
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const data = transactionSchema.parse(req.body);

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      userId,
    },
  });

  res.status(201).json({
    message: 'Transaction created successfully',
    transaction,
  });
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = transactionSchema.partial().parse(req.body);

  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
    return;
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data,
  });

  res.json({
    message: 'Transaction updated successfully',
    transaction: updated,
  });
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
    return;
  }

  await prisma.transaction.delete({
    where: { id },
  });

  res.json({ message: 'Transaction deleted successfully', id });
};

export const bulkCreateTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const bulkSchema = z.object({
    transactions: z.array(transactionSchema).min(1, 'At least one transaction required'),
  });

  const { transactions } = bulkSchema.parse(req.body);

  const dataToInsert = transactions.map(t => ({
    ...t,
    userId,
  }));

  const result = await prisma.transaction.createMany({
    data: dataToInsert,
  });

  res.status(201).json({
    message: `Successfully imported ${result.count} transactions`,
    count: result.count,
  });
};