import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  User,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  RotateCcw,
  Check,
  Shield,
  Moon,
  Sun,
  DollarSign,
} from 'lucide-react';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';
import { UserAvatar } from '../common/UserAvatar';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    theme,
    toggleTheme,
    resetToDefaults,
    clearAllData,
    exportDataJSON,
    showToast,
  } = useFinance();

  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [currency, setCurrency] = useState(settings.currency);

  const [budgetAlerts, setBudgetAlerts] = useState(settings.notifications.budgetAlerts);
  const [paymentReminders, setPaymentReminders] = useState(settings.notifications.paymentReminders);
  const [weeklySummary, setWeeklySummary] = useState(settings.notifications.weeklySummary);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name,
      email,
      currency,
      notifications: {
        budgetAlerts,
        paymentReminders,
        weeklySummary,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Customize your profile, alerts, appearance, and local storage data.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: User Profile */}
        <div className="fintech-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h3>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <UserAvatar
              src={settings.avatarUrl}
              alt={settings.name}
              size="lg"
              className="ring-4 ring-teal-500/20"
            />
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Preferences (Currency & Theme) */}
        <div className="fintech-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">App Preferences</h3>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Display Theme
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    theme === 'light'
                      ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    theme === 'dark'
                      ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4 text-yellow-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="fintech-card p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Budget alerts</p>
                <p className="text-[11px] text-slate-400">Get notified when any category crosses 80% limit</p>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={e => setBudgetAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment reminders</p>
                <p className="text-[11px] text-slate-400">Upcoming utility bill and card due date alerts</p>
              </div>
              <input
                type="checkbox"
                checked={paymentReminders}
                onChange={e => setPaymentReminders(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly financial summary</p>
                <p className="text-[11px] text-slate-400">Digest of weekly cashflow and savings velocity</p>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={e => setWeeklySummary(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Section 4: Data Management */}
      <div className="fintech-card p-6 border-rose-200/50 dark:border-rose-950/50">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Management</h3>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportDataJSON}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 text-left transition group"
          >
            <Download className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Data</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Download full database backup as JSON</p>
          </button>

          {/* Reset to Seed Data */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 text-left transition group"
          >
            <RotateCcw className="w-5 h-5 text-amber-500 mb-2 group-hover:rotate-45 transition-transform" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Reset Demo Data</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Restore reference figures and seed transactions</p>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-800 text-left transition group"
          >
            <Trash2 className="w-5 h-5 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">Clear Local Data</h4>
            <p className="text-[11px] text-rose-500/80 mt-0.5">Permanently delete stored entries</p>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <DeleteConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={clearAllData}
        title="Clear All Local Data?"
        message="This will delete all stored transactions, category budgets, and savings goals from your browser. Are you sure you want to proceed?"
      />

      <DeleteConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetToDefaults}
        title="Restore Default Demo Data?"
        message="This will reset your dashboard figures, budgets, and sample transactions to the reference state from the screenshot."
      />
    </div>
  );
};
