import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

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

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { settings: true },
  });

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
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
      currency: true,
      theme: true,
      settings: true,
    },
  });

  res.json({ message: 'Profile updated successfully', user: updated });
};