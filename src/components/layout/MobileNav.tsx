import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveNavPage } from '../../types';
import { LayoutGrid, FileText, PieChart, BarChart3, Target, X, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, goBack, canGoBack, previousPage } = useFinance();

  const navButtons: { id: ActiveNavPage; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'transactions', label: 'Transfers', icon: FileText },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'savings', label: 'Goals', icon: Target },
  ];

  return (
    <>
      {/* Bottom bar for mobile screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
        {canGoBack && (activePage === 'settings' || activePage === 'profile' || activePage === 'help') ? (
          <div className="w-full flex items-center justify-between px-2 py-0.5">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 touch-manipulation active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {previousPage ? (previousPage.charAt(0).toUpperCase() + previousPage.slice(1)) : 'Dashboard'}</span>
            </button>
            <button
              onClick={() => setActivePage('overview')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white touch-manipulation"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        ) : (
          navButtons.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all touch-manipulation ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* Slide-over Drawer for full navigation */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-50 animate-fade-in">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onCloseMobileMenu={onClose} />
          </div>
        </div>
      )}
    </>
  );
};
