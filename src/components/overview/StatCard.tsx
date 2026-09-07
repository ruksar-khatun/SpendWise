import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { formatINR } from '../../utils/calculations';

interface StatCardProps {
  title: string;
  amount: number;
  deltaPercent: number;
  comparisonText?: string;
  isPositiveDelta?: boolean;
  reverseDeltaColor?: boolean; // For expenses, negative is good
  icon: React.ReactNode;
  iconBgColor: string;
  onMenuAction?: (action: string) => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  deltaPercent,
  comparisonText = 'from last month',
  isPositiveDelta = true,
  reverseDeltaColor = false,
  icon,
  iconBgColor,
  onMenuAction,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine delta color semantics
  const isGood = reverseDeltaColor ? !isPositiveDelta : isPositiveDelta;
  const deltaColorClass = isGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-500 dark:text-rose-400';

  return (
    <div className="fintech-card p-5 relative group hover:shadow-card-hover transition-all">
      {/* Top row: Icon, Title, and 3-dot Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs"
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            {title}
          </span>
        </div>

        {/* 3-dot Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
            aria-label="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30 animate-fade-in text-xs">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onMenuAction?.('view');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                View Breakdown
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onMenuAction?.('export');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Quick Summary
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Stat Amount */}
      <div className="mt-3.5">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {formatINR(amount)}
        </h3>

        {/* Delta percentage indicator */}
        <div className="flex items-center gap-1 mt-1 text-xs">
          <span className={`font-semibold flex items-center gap-0.5 ${deltaColorClass}`}>
            {isPositiveDelta ? (
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 4l-8 8h16l-8-8z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 20l8-8H4l8 8z" />
              </svg>
            )}
            {Math.abs(deltaPercent).toFixed(1)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">{comparisonText}</span>
        </div>
      </div>
    </div>
  );
};
