import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const settingsUpdateSchema = z.object({
  currency: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  name: z.string().optional(),
  notifications: z.object({
    budgetAlerts: z.boolean().optional(),
    paymentReminders: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  }).optional(),
});

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    settings: {
      name: user.name,
      email: user.email,
      avatarUrl: '/avatar.svg',
      currency: user.currency,
      theme: user.theme as 'light' | 'dark',
      notifications: user.settings ? {
        budgetAlerts: user.settings.budgetAlerts,
        paymentReminders: user.settings.paymentReminders,
        weeklySummary: user.settings.weeklySummary,
      } : {
        budgetAlerts: true,
        paymentReminders: true,
        weeklySummary: true,
      },
    },
  });
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const data = settingsUpdateSchema.parse(req.body);

  if (data.name || data.currency || data.theme) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        currency: data.currency,
        theme: data.theme,
      },
    });
  }

  if (data.notifications) {
    await prisma.userSettings.upsert({
      where: { userId },
      update: data.notifications,
      create: {
        userId,
        budgetAlerts: data.notifications.budgetAlerts ?? true,
        paymentReminders: data.notifications.paymentReminders ?? true,
        weeklySummary: data.notifications.weeklySummary ?? true,
      },
    });
  }

  res.json({ message: 'Settings updated successfully' });
};