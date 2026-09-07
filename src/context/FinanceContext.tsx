import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  UserSettings,
  ActiveNavPage,
  HealthScoreResult,
  CategorySpending,
  MonthlyChartDataPoint,
  SmartInsight,
} from '../types';
import { storage } from '../utils/storage';
import {
  calculateFinancialSummary,
  calculateHealthScore,
  calculateCategorySpending,
  getMonthlyTrendData,
  generateSmartInsights,
} from '../utils/calculations';
import confetti from 'canvas-confetti';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  settings: UserSettings;
  theme: 'light' | 'dark';
  selectedMonth: string; // e.g. "2026-09"
  selectedMonthLabel: string; // "September 2026"
  activePage: ActiveNavPage;
  searchQuery: string;
  toasts: ToastItem[];

  // Navigation & Page State
  setActivePage: (page: ActiveNavPage) => void;
  setSelectedMonth: (month: string) => void;
  setSearchQuery: (q: string) => void;
  toggleTheme: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budget CRUD
  setBudget: (category: string, amount: number, month?: string) => void;
  deleteBudget: (id: string) => void;

  // Savings Goal CRUD
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  editGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addMoneyToGoal: (id: string, amount: number) => void;

  // User Settings & Data
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;

  // Derived Analytics Data
  summary: ReturnType<typeof calculateFinancialSummary>;
  healthScore: HealthScoreResult;
  categorySpending: { categories: CategorySpending[]; totalSpent: number };
  monthlyTrend: MonthlyChartDataPoint[];
  insights: SmartInsight[];

  // Global Modals State
  isAddTransactionOpen: boolean;
  setIsAddTransactionOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  isAddGoalOpen: boolean;
  setIsAddGoalOpen: (open: boolean) => void;
  isSetBudgetOpen: boolean;
  setIsSetBudgetOpen: (open: boolean) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => storage.getBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => storage.getSavingsGoals());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => storage.getTheme());
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activePage, setActivePage] = useState<ActiveNavPage>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals state
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);

  // Month label helper
  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === '2026-09') return 'September 2026';
    if (selectedMonth === '2026-08') return 'August 2026';
    if (selectedMonth === '2026-07') return 'July 2026';
    if (selectedMonth === '2026-06') return 'June 2026';
    if (selectedMonth === '2026-05') return 'May 2026';
    if (selectedMonth === '2026-04') return 'April 2026';
    return selectedMonth;
  }, [selectedMonth]);

  // Sync theme with html class & storage
  useEffect(() => {
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    storage.setTransactions(updated);
    showToast('Transaction added', `Successfully logged ₹${tx.amount.toLocaleString()} for ${tx.description}`);
  };

  const editTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    const updated = transactions.map(t => (t.id === id ? { ...t, ...updatedFields } : t));
    setTransactions(updated);
    storage.setTransactions(updated);
    showToast('Transaction updated', 'Your changes have been saved successfully');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    storage.setTransactions(updated);
    showToast('Transaction deleted', target ? `Removed ${target.description}` : undefined, 'info');
  };

  // Budget Actions
  const setBudget = (category: string, amount: number, month = selectedMonth) => {
    const existingIndex = budgets.findIndex(b => b.category === category && b.month === month);
    let updated: Budget[];
    if (existingIndex >= 0) {
      updated = [...budgets];
      updated[existingIndex] = { ...updated[existingIndex], amount };
    } else {
      updated = [...budgets, { id: `b-${Date.now()}`, category, amount, month }];
    }
    setBudgets(updated);
    storage.setBudgets(updated);
    showToast('Budget saved', `Budget for ${category} set to ₹${amount.toLocaleString()}`);
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    storage.setBudgets(updated);
    showToast('Budget removed', undefined, 'info');
  };

  // Goal Actions
  const addGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    storage.setSavingsGoals(updated);
    showToast('Goal created', `Started tracking ${goal.name}!`);
  };

  const editGoal = (id: string, updatedFields: Partial<SavingsGoal>) => {
    const updated = goals.map(g => (g.id === id ? { ...g, ...updatedFields } : g));
    setGoals(updated);
    storage.setSavingsGoals(updated);
    showToast('Goal updated', 'Savings goal updated');
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    storage.setSavingsGoals(updated);
    showToast('Goal removed', undefined, 'info');
  };

  const addMoneyToGoal = (id: string, amount: number) => {
    let completed = false;
    let goalName = '';
    const updated = goals.map(g => {
      if (g.id === id) {
        goalName = g.name;
        const newTotal = g.currentAmount + amount;
        if (newTotal >= g.targetAmount && g.currentAmount < g.targetAmount) {
          completed = true;
        }
        return { ...g, currentAmount: newTotal };
      }
      return g;
    });

    setGoals(updated);
    storage.setSavingsGoals(updated);

    if (completed) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14b8a6', '#2dd4bf', '#f59e0b', '#8b5cf6'],
        });
      } catch {
        // ignore if confetti blocked
      }
      showToast('🎉 Goal Achieved!', `Congratulations! You reached 100% of your ${goalName} goal!`);
    } else {
      showToast('Money added to goal', `Added ₹${amount.toLocaleString()} to ${goalName}`);
    }
  };

  // User Settings Actions
  const updateSettings = (newFields: Partial<UserSettings>) => {
    const updated = { ...settings, ...newFields };
    setSettings(updated);
    storage.setSettings(updated);
    showToast('Preferences saved', 'Your profile and settings were updated');
  };

  const resetToDefaults = () => {
    storage.resetToDefaults();
    setTransactions(storage.getTransactions());
    setBudgets(storage.getBudgets());
    setGoals(storage.getSavingsGoals());
    setSettings(storage.getSettings());
    showToast('Reset complete', 'Application restored to default reference state', 'info');
  };

  const clearAllData = () => {
    storage.clearAllData();
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    showToast('Data cleared', 'All local data was cleared', 'warning');
  };

  const exportDataJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings,
      transactions,
      budgets,
      goals,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `spendwise_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export successful', 'Data backup downloaded as JSON');
  };

  // Derived Calculations
  const summary = useMemo(
    () => calculateFinancialSummary(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const healthScore = useMemo(
    () => calculateHealthScore(transactions, budgets, goals, selectedMonth),
    [transactions, budgets, goals, selectedMonth]
  );

  const categorySpending = useMemo(
    () => calculateCategorySpending(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const monthlyTrend = useMemo(() => getMonthlyTrendData(transactions), [transactions]);

  const insights = useMemo(
    () => generateSmartInsights(transactions, budgets, goals, selectedMonth),
    [transactions, budgets, goals, selectedMonth]
  );

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        settings,
        theme,
        selectedMonth,
        selectedMonthLabel,
        activePage,
        searchQuery,
        toasts,

        setActivePage,
        setSelectedMonth,
        setSearchQuery,
        toggleTheme,
        showToast,
        removeToast,

        addTransaction,
        editTransaction,
        deleteTransaction,

        setBudget,
        deleteBudget,

        addGoal,
        editGoal,
        deleteGoal,
        addMoneyToGoal,

        updateSettings,
        resetToDefaults,
        clearAllData,
        exportDataJSON,

        summary,
        healthScore,
        categorySpending,
        monthlyTrend,
        insights,

        isAddTransactionOpen,
        setIsAddTransactionOpen,
        editingTransaction,
        setEditingTransaction,
        isAddGoalOpen,
        setIsAddGoalOpen,
        isSetBudgetOpen,
        setIsSetBudgetOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
