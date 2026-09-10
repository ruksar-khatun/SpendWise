import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Ruks',
      email: 'ruks@example.com',
      passwordHash,
      currency: '₹',
      theme: 'light',
      settings: {
        create: {
          budgetAlerts: true,
          paymentReminders: true,
          weeklySummary: true,
        },
      },
    },
  });

  console.log('👤 Created demo user: ruks@example.com (password: password123)');

  // Budgets
  const budgets = [
    { category: 'Food', amount: 8000, month: '2026-09' },
    { category: 'Shopping', amount: 5000, month: '2026-09' },
    { category: 'Transport', amount: 4000, month: '2026-09' },
    { category: 'Bills', amount: 6000, month: '2026-09' },
    { category: 'Entertainment', amount: 3000, month: '2026-09' },
    { category: 'Health', amount: 3000, month: '2026-09' },
    { category: 'Other', amount: 6000, month: '2026-09' },
  ];

  for (const b of budgets) {
    await prisma.budget.create({
      data: {
        ...b,
        userId: user.id,
      },
    });
  }

  // Savings Goals
  const goals = [
    {
      name: 'MacBook',
      currentAmount: 65000,
      targetAmount: 90000,
      targetDate: '2026-12-15',
      category: 'Electronics',
      icon: 'laptop',
      color: '#8b5cf6',
    },
    {
      name: 'Emergency Fund',
      currentAmount: 35000,
      targetAmount: 50000,
      targetDate: '2027-06-30',
      category: 'Safety',
      icon: 'shield',
      color: '#0ea5e9',
    },
    {
      name: 'Travel',
      currentAmount: 18500,
      targetAmount: 30000,
      targetDate: '2027-09-01',
      category: 'Vacation',
      icon: 'plane',
      color: '#14b8a6',
    },
  ];

  for (const g of goals) {
    await prisma.savingsGoal.create({
      data: {
        ...g,
        userId: user.id,
      },
    });
  }

  // September Transactions
  const transactions = [
    { type: 'expense', description: 'Swiggy', category: 'Food', amount: 420, date: '2026-09-07', notes: 'Dinner delivery with friends', merchant: 'Swiggy' },
    { type: 'expense', description: 'Uber', category: 'Transport', amount: 180, date: '2026-09-06', notes: 'Ride to city center', merchant: 'Uber' },
    { type: 'expense', description: 'Amazon', category: 'Shopping', amount: 1299, date: '2026-09-05', notes: 'Wireless ergonomic mouse and desk mat', merchant: 'Amazon' },
    { type: 'expense', description: 'Electricity Bill', category: 'Bills', amount: 1850, date: '2026-09-04', notes: 'BESCOM utilities', merchant: 'Electricity Board' },
    { type: 'income', description: 'Salary', category: 'Salary', amount: 50000, date: '2026-09-01', notes: 'Monthly company payroll credit', merchant: 'TechCorp Pvt Ltd' },
    { type: 'expense', description: 'Fresh Groceries', category: 'Food', amount: 2000, date: '2026-09-03', notes: 'Weekly staples and vegetables', merchant: 'Nature Basket' },
    { type: 'expense', description: 'Netflix', category: 'Entertainment', amount: 649, date: '2026-09-02', notes: 'Premium 4K plan renewal', merchant: 'Netflix' },
    { type: 'expense', description: 'Gym Membership', category: 'Health', amount: 2500, date: '2026-09-01', notes: 'Quarterly fitness center renewal', merchant: 'Gold Fitness' },
    { type: 'expense', description: 'Zomato Dining', category: 'Food', amount: 1850, date: '2026-09-05', notes: 'Weekend brunch', merchant: 'Zomato' },
    { type: 'expense', description: 'Metro Card Recharge', category: 'Transport', amount: 1000, date: '2026-09-02', notes: 'Monthly metro pass', merchant: 'Metro Rail' },
    { type: 'expense', description: 'Wifi Internet', category: 'Bills', amount: 999, date: '2026-09-03', notes: 'Fiber high speed broadband', merchant: 'Airtel Broadband' },
    { type: 'expense', description: 'Zara Apparel', category: 'Shopping', amount: 3450, date: '2026-09-04', notes: 'Autumn work collection', merchant: 'Zara' },
    { type: 'expense', description: 'Pharmacy & Vitamins', category: 'Health', amount: 520, date: '2026-09-06', notes: 'Supplements and vitamins', merchant: 'Apollo Pharmacy' },
    { type: 'expense', description: 'Coffee & Snacks', category: 'Food', amount: 350, date: '2026-09-07', notes: 'Blue Tokai roasters', merchant: 'Blue Tokai' },
    { type: 'expense', description: 'Bookstore', category: 'Other', amount: 890, date: '2026-09-05', notes: 'Personal finance & tech books', merchant: 'Crossword' },
    { type: 'expense', description: 'Gas Utility', category: 'Bills', amount: 1100, date: '2026-09-02', notes: 'Piped natural gas', merchant: 'Adani Gas' },
    { type: 'expense', description: 'Cinema Tickets', category: 'Entertainment', amount: 720, date: '2026-09-06', notes: 'Weekend IMAX movie', merchant: 'PVR Inox' },
    { type: 'expense', description: 'Fuel', category: 'Transport', amount: 2000, date: '2026-09-03', notes: 'Petrol fill up', merchant: 'Indian Oil' },
    { type: 'expense', description: 'Household Supplies', category: 'Other', amount: 1450, date: '2026-09-04', notes: 'Cleaning & pantry items', merchant: 'D-Mart' },
    { type: 'expense', description: 'Mobile Recharge', category: 'Bills', amount: 719, date: '2026-09-01', notes: 'Quarterly unlimited plan', merchant: 'Jio 5G' },
    { type: 'expense', description: 'Electronics Accessories', category: 'Shopping', amount: 1200, date: '2026-09-05', notes: 'USB-C hubs and cables', merchant: 'Croma' },
    { type: 'expense', description: 'Online Course', category: 'Other', amount: 1644, date: '2026-09-03', notes: 'Full stack development masterclass', merchant: 'Udemy' },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        ...t,
        userId: user.id,
      },
    });
  }

  console.log(`✅ Successfully seeded ${transactions.length} transactions, ${budgets.length} budgets, and ${goals.length} goals.`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
