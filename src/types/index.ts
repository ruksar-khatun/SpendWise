export type TransactionType = 'income' | 'expense';

export type CategoryName = 
  | 'Food' 
  | 'Shopping' 
  | 'Transport' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Health' 
  | 'Education' 
  | 'Travel' 
  | 'Salary' 
  | 'Freelance' 
  | 'Investments' 
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: CategoryName | string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  merchant?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number; // monthly limit
  month: string; // e.g. "2026-09"
}

export interface SavingsGoal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string; // e.g. "2026-12-15"
  category: string;
  icon?: string;
  color?: string;
}

export interface UserNotificationPreferences {
  budgetAlerts: boolean;
  paymentReminders: boolean;
  weeklySummary: boolean;
}

export interface UserSettings {
  name: string;
  email: string;
  avatarUrl: string;
  currency: string;
  theme: 'light' | 'dark';
  notifications: UserNotificationPreferences;
}

export interface ChecklistItem {
  id: string;
  text: string;
  passed: boolean;
  isWarning?: boolean;
}

export interface HealthScoreResult {
  score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  budgetScore: number;
  savingsScore: number;
  consistencyScore: number;
  goalsScore: number;
  checklist: ChecklistItem[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyChartDataPoint {
  month: string;
  monthShort: string;
  income: number;
  expense: number;
  savings: number;
}

export interface SmartInsight {
  id: string;
  iconType: 'trend-up' | 'percent' | 'trend-down' | 'star' | 'info';
  message: string;
  type: 'danger' | 'warning' | 'success' | 'accent' | 'neutral';
}

export type ActiveNavPage = 
  | 'overview' 
  | 'transactions' 
  | 'budgets' 
  | 'analytics' 
  | 'savings' 
  | 'settings' 
  | 'profile' 
  | 'help';
