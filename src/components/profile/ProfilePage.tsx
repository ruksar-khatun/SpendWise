import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Mail, Shield, Award, Calendar } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const ProfilePage: React.FC = () => {
  const { settings, setActivePage, healthScore, transactions, goals } = useFinance();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Manage your personal credentials and membership tier.
        </p>
      </div>

      {/* Hero Profile Card */}
      <div className="fintech-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <UserAvatar
          src={settings.avatarUrl}
          alt={settings.name}
          size="xl"
          className="ring-4 ring-teal-500/30 shadow-md"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{settings.name}</h2>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 w-max self-center sm:self-auto">
              Pro Member
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {settings.email}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Member since January 2026 • Bangalore, India
          </p>
        </div>

        <button
          onClick={() => setActivePage('settings')}
          className="px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 transition"
        >
          Edit Profile
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fintech-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
            <Award className="w-4 h-4 text-teal-600" /> Financial Score
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {healthScore.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </p>
          <span className="text-xs font-bold text-emerald-600">{healthScore.status} Tier</span>
        </div>

        <div className="fintech-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
            <Calendar className="w-4 h-4 text-sky-600" /> Logged Entries
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {transactions.length}
          </p>
          <span className="text-xs text-slate-400">All-time active records</span>
        </div>

        <div className="fintech-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
            <Shield className="w-4 h-4 text-purple-600" /> Active Goals
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {goals.length}
          </p>
          <span className="text-xs text-slate-400">Milestones in progress</span>
        </div>
      </div>
    </div>
  );
};
