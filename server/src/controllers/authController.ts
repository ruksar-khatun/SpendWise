import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { verifyEmailExistence } from '../utils/emailValidator.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'spendwise_super_secret_jwt_key_2026';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    // Validate that email format is valid and domain exists on global DNS
    const emailVerification = await verifyEmailExistence(normalizedEmail);
    if (!emailVerification.valid) {
      res.status(400).json({ error: emailVerification.reason || 'Invalid email address' });
      return;
    }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      settings: {
        create: {
          budgetAlerts: true,
          paymentReminders: true,
          weeklySummary: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      theme: true,
      settings: true,
    },
  });

  const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { settings: true },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password. If you signed up with Google, please use Google Sign In.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
        settings: user.settings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      theme: true,
      settings: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const updateSchema = z.object({
    name: z.string().min(2).optional(),
    currency: z.string().optional(),
    theme: z.enum(['light', 'dark']).optional(),
  });

  const data = updateSchema.parse(req.body);

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      currency: true,
      theme: true,
      settings: true,
    },
  });

  res.json({ message: 'Profile updated successfully', user: updated });
};

const googleAuthSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().optional(),
  googleId: z.string().optional(),
});

export const googleAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, avatarUrl, googleId } = googleAuthSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    // Validate that email exists and domain is active on global DNS
    const emailVerification = await verifyEmailExistence(normalizedEmail);
    if (!emailVerification.valid) {
      res.status(400).json({ error: emailVerification.reason || 'Invalid email address' });
      return;
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(googleId ? [{ googleId }] : []),
        ],
      },
      include: { settings: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          avatarUrl: avatarUrl || undefined,
          googleId: googleId || `google-${Date.now()}`,
          settings: {
            create: {
              budgetAlerts: true,
              paymentReminders: true,
              weeklySummary: true,
            },
          },
          budgets: {
            createMany: {
              data: [
                { category: 'Food', amount: 8000, month: '2026-09' },
                { category: 'Shopping', amount: 5000, month: '2026-09' },
                { category: 'Transport', amount: 4000, month: '2026-09' },
                { category: 'Bills', amount: 6000, month: '2026-09' },
                { category: 'Entertainment', amount: 3000, month: '2026-09' },
                { category: 'Health', amount: 3000, month: '2026-09' },
                { category: 'Other', amount: 6000, month: '2026-09' },
              ],
            },
          },
        },
        include: { settings: true },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          avatarUrl: avatarUrl || user.avatarUrl,
          googleId: googleId || user.googleId,
        },
        include: { settings: true },
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
        theme: user.theme,
        settings: user.settings,
      },
    });
  } catch (err) {
    next(err);
  }
};