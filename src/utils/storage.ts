import { Transaction, Budget, SavingsGoal, UserSettings } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_SAVINGS_GOALS, INITIAL_SETTINGS } from './seedData';

const KEYS = {
  TRANSACTIONS: 'spendwise_transactions_v2',
  BUDGETS: 'spendwise_budgets_v1',
  SAVINGS: 'spendwise_savings_goals_v1',
  SETTINGS: 'spendwise_settings_v1',
  THEME: 'spendwise_theme_v1',
};

export const storage = {
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  setTransactions: (transactions: Transaction[]) => {
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to localStorage', e);
    }
  },

  getBudgets: (): Budget[] => {
    try {
      const data = localStorage.getItem(KEYS.BUDGETS);
      return data ? JSON.parse(data) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  setBudgets: (budgets: Budget[]) => {
    try {
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Error saving budgets to localStorage', e);
    }
  },

  getSavingsGoals: (): SavingsGoal[] => {
    try {
      const data = localStorage.getItem(KEYS.SAVINGS);
      return data ? JSON.parse(data) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  },

  setSavingsGoals: (goals: SavingsGoal[]) => {
    try {
      localStorage.setItem(KEYS.SAVINGS, JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving goals to localStorage', e);
    }
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  setSettings: (settings: UserSettings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  },

  getTheme: (): 'light' | 'dark' => {
    try {
      const theme = localStorage.getItem(KEYS.THEME);
      if (theme === 'dark' || theme === 'light') return theme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  },

  setTheme: (theme: 'light' | 'dark') => {
    try {
      localStorage.setItem(KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error saving theme to localStorage', e);
    }
  },

  clearAllData: () => {
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.BUDGETS);
    localStorage.removeItem(KEYS.SAVINGS);
    localStorage.removeItem(KEYS.SETTINGS);
  },

  resetToDefaults: () => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(KEYS.SAVINGS, JSON.stringify(INITIAL_SAVINGS_GOALS));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  },
};
