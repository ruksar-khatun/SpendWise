import { Transaction, Budget, SavingsGoal, UserSettings } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'spendwise_token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
  theme: string;
}

export const api = {
  // Token Helpers
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Auth Header helper
  getHeaders: (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Health Check
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Authentication
  login: async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }

    const data = await res.json();
    api.setToken(data.token);
    return data;
  },

  register: async (name: string, email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }

    const data = await res.json();
    api.setToken(data.token);
    return data;
  },

  googleLogin: async (profile: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<{ token: string; user: AuthUser }> => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Google login failed' }));
      throw new Error(err.error || 'Google login failed');
    }

    const data = await res.json();
    api.setToken(data.token);
    return data;
  },

  getMe: async (): Promise<AuthUser | null> => {
    const token = api.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: api.getHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  // Transactions
  getTransactions: async (month?: string): Promise<Transaction[]> => {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`${API_BASE}/transactions${query}`, {
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  },

  createTransaction: async (tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(tx),
    });

    if (!res.ok) throw new Error('Failed to create transaction');
    const data = await res.json();
    return data.transaction;
  },

  bulkCreateTransactions: async (txs: Omit<Transaction, 'id'>[]): Promise<{ count: number }> => {
    const res = await fetch(`${API_BASE}/transactions/bulk`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ transactions: txs }),
    });

    if (!res.ok) throw new Error('Failed to bulk import transactions');
    return res.json();
  },

  updateTransaction: async (id: string, tx: Partial<Transaction>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(tx),
    });

    if (!res.ok) throw new Error('Failed to update transaction');
    const data = await res.json();
    return data.transaction;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  // Budgets
  getBudgets: async (month?: string): Promise<Budget[]> => {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`${API_BASE}/budgets${query}`, {
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch budgets');
    const data = await res.json();
    return data.budgets;
  },

  upsertBudget: async (budget: { category: string; amount: number; month: string }): Promise<Budget> => {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(budget),
    });

    if (!res.ok) throw new Error('Failed to save budget');
    const data = await res.json();
    return data.budget;
  },

  deleteBudget: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete budget');
  },

  // Savings Goals
  getGoals: async (): Promise<SavingsGoal[]> => {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch savings goals');
    const data = await res.json();
    return data.goals;
  },

  createGoal: async (goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> => {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(goal),
    });

    if (!res.ok) throw new Error('Failed to create savings goal');
    const data = await res.json();
    return data.goal;
  },

  updateGoal: async (id: string, goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(goal),
    });

    if (!res.ok) throw new Error('Failed to update goal');
    const data = await res.json();
    return data.goal;
  },

  deleteGoal: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete goal');
  },

  depositToGoal: async (id: string, amount: number): Promise<{ goal: SavingsGoal; completed: boolean }> => {
    const res = await fetch(`${API_BASE}/goals/${id}/deposit`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) throw new Error('Failed to deposit into goal');
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<UserSettings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: api.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.settings;
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<void> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(settings),
    });

    if (!res.ok) throw new Error('Failed to update settings');
  },
};
