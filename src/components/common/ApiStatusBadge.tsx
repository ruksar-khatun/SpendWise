import React, { useState } from 'react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ApiStatusBadge: React.FC = () => {
  const { isOnline, isAuth, currentUser, loginAsDemo, logoutUser, checkApiConnection } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = async () => {
    setIsChecking(true);
    await checkApiConnection();
    setTimeout(() => setIsChecking(false), 500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        }`}
        title="Click to view API & Backend Server details"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <Server className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {isOnline ? (isAuth ? 'API Connected' : 'API Online') : 'Local Mode'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 text-slate-800 dark:text-slate-100 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold">Backend Status</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isChecking}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-slate-700 transition"
                title="Re-check connection"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Server Status:</span>
                <span className={`flex items-center gap-1 font-medium ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isOnline ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected (Port 5000)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Offline / Fallback
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Database:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {isOnline ? 'SQLite (Prisma ORM)' : 'Browser LocalStorage'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Account:</span>
                <span className="font-medium truncate max-w-[140px] text-slate-700 dark:text-slate-300">
                  {currentUser ? currentUser.email : 'Demo Local Mode'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              {isOnline ? (
                isAuth ? (
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsOpen(false);
                    }}
                    className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await loginAsDemo();
                      setIsOpen(false);
                    }}
                    className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Connect Demo User (ruks@example.com)
                  </button>
                )
              ) : (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg leading-relaxed">
                  💡 Start backend with <code className="text-teal-600 dark:text-teal-400 font-mono font-bold">npm run dev</code> to enable live SQL database persistence.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
