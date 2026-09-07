import React, { useState } from 'react';
import { HelpCircle, MessageSquare, BookOpen, ShieldCheck, Mail, ChevronDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const HelpPage: React.FC = () => {
  const { showToast } = useFinance();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How is the Financial Health score calculated?',
      a: 'Your health score uses a 100-point algorithm: Budget Adherence (30 pts), Savings Rate (30 pts), Expense Consistency (20 pts), and Savings Goal Milestones (20 pts). Scores above 80 indicate strong financial health.',
    },
    {
      q: 'Does SpendWise send my financial data to any external server?',
      a: 'No. SpendWise stores 100% of your transactions, budgets, and settings locally in your browser via localStorage. You can export your data at any time in JSON format under Settings.',
    },
    {
      q: 'How do I add money to an existing savings goal?',
      a: 'Navigate to Savings Goals and click "+ Deposit Funds" or click the goal card on the Overview dashboard. When your goal reaches 100%, you will unlock a celebratory milestone badge!',
    },
    {
      q: 'Can I customize category budgets for previous or future months?',
      a: 'Yes! Use the month selector in the top header to view or adjust figures for any monthly cycle.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Help & Support
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Frequently asked questions, scoring formulas, and guides to mastering SpendWise.
        </p>
      </div>

      {/* FAQs */}
      <div className="fintech-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-teal-600 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Box */}
      <div className="fintech-card p-6 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200/50 dark:border-teal-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Need personal assistance?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Our concierge team is available 24/7.</p>
          </div>
        </div>

        <button
          onClick={() => showToast('Support Request Sent', 'A support specialist will reach out to ruks@example.com')}
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition"
        >
          Contact Concierge
        </button>
      </div>
    </div>
  );
};
