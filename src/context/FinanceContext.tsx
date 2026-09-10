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
import { api, AuthUser } from '../services/api';
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

  // Full-Stack API Status & Auth
  isOnline: boolean;
  isAuth: boolean;
  currentUser: AuthUser | null;
  checkApiConnection: () => Promise<boolean>;
  loginAsDemo: () => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => Promise<void>;
  registerUser: (name: string, email: string, pass: string) => Promise<void>;
  signInWithGoogle: (profile: { email: string; name: string; avatarUrl?: string; googleId?: string }) => Promise<void>;
  logoutUser: () => void;
  isGoogleModalOpen: boolean;
  setIsGoogleModalOpen: (open: boolean) => void;

  // Navigation & Page State
  setActivePage: (page: ActiveNavPage) => void;
  goBack: () => void;
  canGoBack: boolean;
  previousPage: ActiveNavPage | null;
  setSelectedMonth: (month: string) => void;
  setSearchQuery: (q: string) => void;
  toggleTheme: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  bulkImportTransactions: (txs: Omit<Transaction, 'id'>[]) => Promise<number>;

  // Budget CRUD
  setBudget: (category: string, amount: number, month?: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Savings Goal CRUD
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  editGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMoneyToGoal: (id: string, amount: number) => Promise<void>;

  // User Settings & Data
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
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
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => storage.getBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => storage.getSavingsGoals());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => storage.getTheme());
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activePage, setActivePageState] = useState<ActiveNavPage>('overview');
  const [navHistory, setNavHistory] = useState<ActiveNavPage[]>(['overview']);

  const setActivePage = (page: ActiveNavPage) => {
    setActivePageState(page);
    setNavHistory((prev) => (prev[prev.length - 1] === page ? prev : [...prev, page]));
  };

  const goBack = () => {
    setNavHistory((prev) => {
      if (prev.length > 1) {
        const next = prev.slice(0, prev.length - 1);
        setActivePageState(next[next.length - 1]);
        return next;
      }
      setActivePageState('overview');
      return ['overview'];
    });
  };

  const canGoBack = activePage !== 'overview' || navHistory.length > 1;

  const previousPage = useMemo<ActiveNavPage | null>(() => {
    if (navHistory.length > 1) {
      return navHistory[navHistory.length - 2];
    }
    return activePage !== 'overview' ? 'overview' : null;
  }, [navHistory, activePage]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // API & Auth State
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Modals state
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  // Sync backend data to state
  const loadDataFromApi = async () => {
    try {
      const [apiTxs, apiBudgets, apiGoals] = await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
        api.getGoals(),
      ]);

      if (apiTxs && apiTxs.length > 0) {
        setTransactions(apiTxs);
        storage.setTransactions(apiTxs);
      }
      if (apiBudgets && apiBudgets.length > 0) {
        setBudgets(apiBudgets);
        storage.setBudgets(apiBudgets);
      }
      if (apiGoals && apiGoals.length > 0) {
        setGoals(apiGoals);
        storage.setSavingsGoals(apiGoals);
      }
    } catch (err) {
      console.warn('Could not sync with backend data:', err);
    }
  };

  // Check API health and authenticate
  const checkApiConnection = async (): Promise<boolean> => {
    const healthy = await api.checkHealth();
    setIsOnline(healthy);

    if (healthy) {
      // Check existing token
      let user = await api.getMe();
      if (!user) {
        // Auto-login demo account for seamless showcase
        try {
          const authRes = await api.login('ruks@example.com', 'password123');
          user = authRes.user;
        } catch {
          // Demo login fallback
        }
      }

      if (user) {
        setIsAuth(true);
        setCurrentUser(user);
        await loadDataFromApi();
      }
    } else {
      setIsAuth(false);
      setCurrentUser(null);
    }

    return healthy;
  };

  // Initial connect on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Auth Actions
  const loginAsDemo = async () => {
    try {
      const res = await api.login('ruks@example.com', 'password123');
      setIsAuth(true);
      setCurrentUser(res.user);
      setIsOnline(true);
      showToast('Connected to Backend', 'Logged in as Demo User (ruks@example.com)', 'success');
      await loadDataFromApi();
    } catch (err: any) {
      showToast('Connection failed', err.message || 'Make sure backend server is running', 'error');
    }
  };

  const loginWithCredentials = async (email: string, pass: string) => {
    try {
      const res = await api.login(email, pass);
      setIsAuth(true);
      setCurrentUser(res.user);
      setIsOnline(true);
      showToast('Login successful', `Welcome back, ${res.user.name}!`, 'success');
      await loadDataFromApi();
    } catch (err: any) {
      showToast('Login failed', err.message, 'error');
      throw err;
    }
  };

  const registerUser = async (name: string, email: string, pass: string) => {
    try {
      const res = await api.register(name, email, pass);
      setIsAuth(true);
      setCurrentUser(res.user);
      setIsOnline(true);
      showToast('Account created', `Welcome to SpendWise, ${name}!`, 'success');
      await loadDataFromApi();
    } catch (err: any) {
      showToast('Registration failed', err.message, 'error');
      throw err;
    }
  };

  const signInWithGoogle = async (profile: { email: string; name: string; avatarUrl?: string; googleId?: string }) => {
    try {
      const res = await api.googleLogin(profile);
      setIsAuth(true);
      setCurrentUser(res.user);
      setIsOnline(true);

      const updatedSettings: UserSettings = {
        ...settings,
        name: res.user.name,
        email: res.user.email,
        avatarUrl: res.user.avatarUrl || settings.avatarUrl,
      };
      setSettings(updatedSettings);
      storage.setSettings(updatedSettings);

      showToast('Google Account Connected', `Signed in as ${res.user.name}`, 'success');
      await loadDataFromApi();
    } catch (err: any) {
      showToast('Google Sign-In Failed', err.message || 'Could not authenticate with Google', 'error');
      throw err;
    }
  };

  const logoutUser = () => {
    api.removeToken();
    setIsAuth(false);
    setCurrentUser(null);
    showToast('Logged out', 'Switched to offline local storage mode', 'info');
  };

  // Transaction Actions
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const tempId = `tx-${Date.now()}`;
    const newTx: Transaction = { ...tx, id: tempId };
    
    // Optimistic UI update
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    storage.setTransactions(updated);
    showToast('Transaction added', `Successfully logged ₹${tx.amount.toLocaleString()} for ${tx.description}`);

    if (isOnline && isAuth) {
      try {
        const savedTx = await api.createTransaction(tx);
        setTransactions(prev => prev.map(t => (t.id === tempId ? savedTx : t)));
      } catch (err) {
        console.error('Failed to sync transaction to backend:', err);
      }
    }
  };

  const editTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    const updated = transactions.map(t => (t.id === id ? { ...t, ...updatedFields } : t));
    setTransactions(updated);
    storage.setTransactions(updated);
    showToast('Transaction updated', 'Your changes have been saved successfully');

    if (isOnline && isAuth) {
      try {
        await api.updateTransaction(id, updatedFields);
      } catch (err) {
        console.error('Failed to sync transaction update to backend:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const target = transactions.find(t => t.id === id);
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    storage.setTransactions(updated);
    showToast('Transaction deleted', target ? `Removed ${target.description}` : undefined, 'info');

    if (isOnline && isAuth) {
      try {
        await api.deleteTransaction(id);
      } catch (err) {
        console.error('Failed to sync transaction deletion to backend:', err);
      }
    }
  };

  const bulkImportTransactions = async (txs: Omit<Transaction, 'id'>[]): Promise<number> => {
    if (!txs || txs.length === 0) return 0;

    const newTxs: Transaction[] = txs.map((t, idx) => ({
      ...t,
      id: `tx-import-${Date.now()}-${idx}`,
    }));

    // Optimistically update local state & localStorage
    const updated = [...newTxs, ...transactions];
    setTransactions(updated);
    storage.setTransactions(updated);

    if (isOnline && isAuth) {
      try {
        await api.bulkCreateTransactions(txs);
        // Refresh with server transactions
        const freshTxs = await api.getTransactions();
        if (freshTxs && freshTxs.length > 0) {
          setTransactions(freshTxs);
          storage.setTransactions(freshTxs);
        }
      } catch (err) {
        console.error('Failed to sync bulk transactions to backend:', err);
      }
    }

    showToast(
      'Statement Imported! 🎉',
      `Successfully added ${txs.length} transactions to your dashboard`,
      'success'
    );

    return txs.length;
  };

  // Budget Actions
  const setBudget = async (category: string, amount: number, month = selectedMonth) => {
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

    if (isOnline && isAuth) {
      try {
        await api.upsertBudget({ category, amount, month });
      } catch (err) {
        console.error('Failed to sync budget to backend:', err);
      }
    }
  };

  const deleteBudget = async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    storage.setBudgets(updated);
    showToast('Budget removed', undefined, 'info');

    if (isOnline && isAuth) {
      try {
        await api.deleteBudget(id);
      } catch (err) {
        console.error('Failed to sync budget deletion to backend:', err);
      }
    }
  };

  // Goal Actions
  const addGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    const tempId = `goal-${Date.now()}`;
    const newGoal: SavingsGoal = { ...goal, id: tempId };
    const updated = [...goals, newGoal];
    setGoals(updated);
    storage.setSavingsGoals(updated);
    showToast('Goal created', `Started tracking ${goal.name}!`);

    if (isOnline && isAuth) {
      try {
        const savedGoal = await api.createGoal(goal);
        setGoals(prev => prev.map(g => (g.id === tempId ? savedGoal : g)));
      } catch (err) {
        console.error('Failed to sync goal to backend:', err);
      }
    }
  };

  const editGoal = async (id: string, updatedFields: Partial<SavingsGoal>) => {
    const updated = goals.map(g => (g.id === id ? { ...g, ...updatedFields } : g));
    setGoals(updated);
    storage.setSavingsGoals(updated);
    showToast('Goal updated', 'Savings goal updated');

    if (isOnline && isAuth) {
      try {
        await api.updateGoal(id, updatedFields);
      } catch (err) {
        console.error('Failed to sync goal update to backend:', err);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    storage.setSavingsGoals(updated);
    showToast('Goal removed', undefined, 'info');

    if (isOnline && isAuth) {
      try {
        await api.deleteGoal(id);
      } catch (err) {
        console.error('Failed to sync goal deletion to backend:', err);
      }
    }
  };

  const addMoneyToGoal = async (id: string, amount: number) => {
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

    if (isOnline && isAuth) {
      try {
        await api.depositToGoal(id, amount);
      } catch (err) {
        console.error('Failed to sync deposit to backend:', err);
      }
    }
  };

  // User Settings Actions
  const updateSettings = async (newFields: Partial<UserSettings>) => {
    const updated = { ...settings, ...newFields };
    setSettings(updated);
    storage.setSettings(updated);
    showToast('Preferences saved', 'Your profile and settings were updated');

    if (isOnline && isAuth) {
      try {
        await api.updateSettings(newFields);
      } catch (err) {
        console.error('Failed to sync settings to backend:', err);
      }
    }
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

        isOnline,
        isAuth,
        currentUser,
        checkApiConnection,
        loginAsDemo,
        loginWithCredentials,
        registerUser,
        signInWithGoogle,
        logoutUser,

        setActivePage,
        goBack,
        canGoBack,
        previousPage,
        setSelectedMonth,
        setSearchQuery,
        toggleTheme,
        showToast,
        removeToast,

        addTransaction,
        editTransaction,
        deleteTransaction,
        bulkImportTransactions,

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
        isImportModalOpen,
        setIsImportModalOpen,
        isGoogleModalOpen,
        setIsGoogleModalOpen,
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
