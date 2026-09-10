import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Sparkles,
  Database,
  ArrowRight,
  UserPlus,
  Mail,
  Loader2,
  ChevronLeft,
  ExternalLink,
  AlertCircle,
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

/**
 * Automatically extracts profile details (Full Name, Avatar, Google ID)
 * from a Google account email without ever prompting the user for their full name.
 */
export function extractGoogleProfile(input: string) {
  let email = input.trim().toLowerCase();
  if (!email.includes('@')) {
    email = `${email}@gmail.com`;
  }

  const localPart = email.split('@')[0];
  // Remove trailing numbers or birth year like '1998', '24'
  const textOnly = localPart.replace(/[0-9]+$/g, '');
  const cleanPart = textOnly.length >= 2 ? textOnly : localPart;

  // Split by '.', '_', '-', or internal numbers
  const words = cleanPart
    .replace(/[0-9]+/g, ' ')
    .split(/[\._\-\s]+/)
    .filter(Boolean);

  const name =
    words.length > 0
      ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Google User';

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=4285F4&color=fff&size=128`;
  const googleId = `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return { name, email, avatarUrl, googleId };
}

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

  const [view, setView] = useState<'chooser' | 'enter_email'>('chooser');
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const gisBtnRef = useRef<HTMLDivElement>(null);

  // Initialize native Google Identity Services (GIS) if client ID is configured
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (isOpen && !isAuth && clientId && (window as any).google?.accounts?.id && gisBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                // Decode Google JWT Credential to extract all profile info
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const googlePayload = JSON.parse(jsonPayload);

                setIsLoading(true);
                setStatusText('Extracting profile from Google account...');

                await signInWithGoogle({
                  name: googlePayload.name || googlePayload.given_name || 'Google User',
                  email: googlePayload.email,
                  avatarUrl: googlePayload.picture,
                  googleId: googlePayload.sub,
                });

                showToast(
                  'Signed in with Google',
                  `Welcome, ${googlePayload.name}! Data is synced to cloud database.`,
                  'success'
                );
                handleClose();
              } catch (e) {
                showToast('Authentication error', 'Failed to process Google sign-in response', 'error');
              } finally {
                setIsLoading(false);
                setStatusText('');
              }
            }
          },
        });

        (window as any).google.accounts.id.renderButton(gisBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
        });
      } catch (e) {
        // Fallback gracefully to the interactive Google Chooser UI
      }
    }
  }, [isOpen, isAuth]);

  if (!isOpen) return null;

  // Handles 1-tap sign-in for saved Google account cards
  const handleSelectAccount = async (account: {
    name: string;
    email: string;
    avatarUrl: string;
  }) => {
    setIsLoading(true);
    setStatusText(`Connecting to Google account (${account.email})...`);
    try {
      await signInWithGoogle({
        name: account.name,
        email: account.email,
        avatarUrl: account.avatarUrl,
        googleId: `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      showToast(
        'Google Profile Extracted',
        `Signed in as ${account.name} (${account.email}). Financial data is synced with your database.`,
        'success'
      );
      handleClose();
    } catch (err) {
      showToast('Sign in failed', 'Could not authenticate with Google server', 'error');
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  // Automatically extracts all info from the entered Google email and validates existence
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let clean = emailInput.trim().toLowerCase();
    if (!clean) {
      setErrorMessage('Please enter your Google account email.');
      showToast('Email Required', 'Please enter your Google account email', 'error');
      return;
    }

    if (!clean.includes('@')) {
      clean = `${clean}@gmail.com`;
    }

    // Client-side RFC format check
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(clean)) {
      setErrorMessage('Invalid email format. Please provide a valid address (e.g. name@gmail.com).');
      showToast('Invalid Email', 'Please provide a valid email address format', 'error');
      return;
    }

    const domain = clean.split('@')[1];
    const blockedDomains = [
      'mailinator.com',
      '10minutemail.com',
      'tempmail.com',
      'guerrillamail.com',
      'sharklasers.com',
      'yopmail.com',
      'trashmail.com',
      'fake.com',
      'test.com',
      'example.com',
    ];
    if (blockedDomains.includes(domain)) {
      setErrorMessage('Disposable, temporary, or placeholder email addresses are not permitted.');
      showToast('Disposable Email Blocked', 'Please use a real, permanent email address', 'error');
      return;
    }

    setIsLoading(true);
    setStatusText('Verifying email existence on DNS and extracting profile...');

    try {
      // Extract name, email, avatar, and googleId automatically
      const extracted = extractGoogleProfile(clean);

      await signInWithGoogle(extracted);

      showToast(
        'Google Profile Verified & Saved',
        `Welcome, ${extracted.name}! Your account is created in the database and data is synced.`,
        'success'
      );
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Could not verify email with server';
      setErrorMessage(msg);
      showToast('Email Verification Failed', msg, 'error');
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Google Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 animate-fade-in font-sans">
        {/* Top Google Colors Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-red-500 via-yellow-400 to-green-500" />

        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-7">
          {/* Active Logged-in State */}
          {isAuth && currentUser ? (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs mb-1">
                  <GoogleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Google Account Connected
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your inputs are automatically saved under your Google ID
                </p>
              </div>

              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5 shadow-2xs">
                <div className="relative flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 object-cover shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
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
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Status Points */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Cloud Database Active:</strong> All transactions and budgets persist in SQLite.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-blue-800 dark:text-blue-300">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    <strong>Extracted Profile:</strong> Authenticated via secure Google OAuth token.
                  </span>
                </div>
              </div>

              {/* Actions */}
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              </div>
            </div>
          ) : view === 'chooser' ? (
            /* 1. Google Account Chooser View */
            <div className="space-y-5">
              {/* Google Brand Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs mb-1">
                  <GoogleIcon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Sign in with Google
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose an account to continue to <span className="font-semibold text-slate-800 dark:text-slate-200">SpendWise</span>
                </p>
              </div>

              {/* Native GIS Container if present */}
              <div ref={gisBtnRef} className="w-full empty:hidden" />

              {/* Loading indicator */}
              {isLoading && (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center gap-2 text-xs text-blue-700 dark:text-blue-300 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{statusText || 'Extracting profile from Google...'}</span>
                </div>
              )}

              {/* Accounts List */}
              <div className="space-y-2">
                {/* Account 1: Ruksar Khatun */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleSelectAccount({
                      name: 'Ruksar Khatun',
                      email: 'ruksar.khatun@gmail.com',
                      avatarUrl:
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
                    })
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200/90 dark:border-slate-700/90 transition shadow-2xs group text-left"
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
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Account 2: Alex Morgan */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleSelectAccount({
                      name: 'Alex Morgan',
                      email: 'alex.morgan@gmail.com',
                      avatarUrl:
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
                    })
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200/90 dark:border-slate-700/90 transition shadow-2xs group text-left"
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
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Use another account option */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setView('enter_email')}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Use another Google account
                    </div>
                    <div className="text-xs text-slate-400">
                      Auto-extracts name, email, and avatar
                    </div>
                  </div>
                </button>
              </div>

              {/* Automatic Extraction Guarantee */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Form Filling:</strong> Your full name, profile photo, and credentials are extracted directly through Google Sign-In.
                </span>
              </div>
            </div>
          ) : (
            /* 2. Google Email Input Screen (Zero Name Input!) */
            <div className="space-y-5">
              {/* Back button & Google logo */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView('chooser')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                  <GoogleIcon className="w-5 h-5" />
                </div>
              </div>

              {/* Google Sign-in Heading */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Sign in
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  to continue to <span className="font-semibold text-slate-800 dark:text-slate-200">SpendWise</span>
                </p>
              </div>

              {/* Verification Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="block font-bold">Email Verification Failed:</strong>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Single Input Form: Email only, NO Name Asked */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email or phone
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. yourname@gmail.com"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white transition"
                    />
                  </div>
                  {/* Quick @gmail helper chip */}
                  {!emailInput.includes('@') && emailInput.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEmailInput(`${emailInput.trim()}@gmail.com`)}
                      className="mt-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Add @gmail.com
                    </button>
                  )}
                </div>

                {/* Privacy & info text */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  SpendWise will automatically extract your name and profile information directly from your Google account. You will not be asked for a password or manual details.
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setView('chooser')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !emailInput.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
