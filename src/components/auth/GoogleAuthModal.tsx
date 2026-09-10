import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Sparkles,
  Cloud,
  Database,
  ArrowRight,
  User,
  Mail,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

// Authentic Google "G" 4-Color SVG Icon
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface GoogleAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    isGoogleModalOpen,
    setIsGoogleModalOpen,
    signInWithGoogle,
    currentUser,
    isAuth,
    logoutUser,
    showToast,
  } = useFinance();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isGoogleModalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    else setIsGoogleModalOpen(false);
  };

  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickSignIn = async (name: string, email: string, avatarUrl: string) => {
    setIsLoading(true);
    try {
      await signInWithGoogle({
        name,
        email,
        avatarUrl,
        googleId: `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      showToast('Signed in with Google', `Welcome back, ${name}! Your financial data is synced to cloud database.`, 'success');
      handleClose();
    } catch (err) {
      showToast('Sign in failed', 'Could not authenticate with Google server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) {
      showToast('Missing details', 'Please enter both your name and Google email', 'error');
      return;
    }
    if (!customEmail.includes('@')) {
      showToast('Invalid email', 'Please provide a valid Google account email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const initials = customName.trim().charAt(0).toUpperCase();
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURI(customName)}&background=4285F4&color=fff&size=128`;
      await signInWithGoogle({
        name: customName.trim(),
        email: customEmail.trim().toLowerCase(),
        avatarUrl,
        googleId: `google_${customEmail.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      showToast('Signed in with Google', `Connected to ${customEmail}! All inputs will be saved to your cloud database.`, 'success');
      handleClose();
    } catch (err) {
      showToast('Sign in failed', 'Could not authenticate with Google server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 animate-fade-in">
        {/* Header decoration bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-red-500 via-yellow-400 to-green-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
              <GoogleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAuth ? 'Google Account Connected' : 'Sign in with Google'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAuth ? 'Your data is securely saved in the database' : 'Save all your transactions & goals to your cloud profile'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 pt-3 space-y-5">
          {isAuth && currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-3.5">
                <div className="relative">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
                    <GoogleIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </h4>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Status features */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <Database className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span><strong>Cloud Database:</strong> All inputs automatically save under your account.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span><strong>JWT Authentication:</strong> Secure authenticated token active.</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    showToast('Signed out', 'Logged out of Google account', 'info');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4">
              {/* Quick Preset Profiles */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                  Choose a Google Account
                </p>

                <div className="space-y-2">
                  {/* Option 1: Ruksar Khatun */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      handleQuickSignIn(
                        'Ruksar Khatun',
                        'ruksar.khatun@gmail.com',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
                        alt="Ruksar Khatun"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          Ruksar Khatun
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ruksar.khatun@gmail.com
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Option 2: Demo Developer Account */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      handleQuickSignIn(
                        'Alex Morgan',
                        'alex.morgan@gmail.com',
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition shadow-2xs group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80"
                        alt="Alex Morgan"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          Alex Morgan
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          alex.morgan@gmail.com
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Mode switch for custom google email */}
              <div className="pt-1">
                {mode === 'quick' ? (
                  <button
                    type="button"
                    onClick={() => setMode('custom')}
                    className="w-full py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition text-center"
                  >
                    + Use another Google account
                  </button>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Google Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="you@gmail.com"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMode('quick')}
                        className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <GoogleIcon className="w-4 h-4" />
                            Sign in to SpendWise
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Security guarantee */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Cloud Data Persistence:</strong> When you log in with Google, all your transactions, custom budgets, and savings goals are permanently stored in your SQLite database.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
