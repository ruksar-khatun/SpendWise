import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { OverviewPage } from './components/overview/OverviewPage';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { BudgetsPage } from './components/budgets/BudgetsPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { SavingsGoalsPage } from './components/savings/SavingsGoalsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { HelpPage } from './components/help/HelpPage';

import { TransactionModal } from './components/modals/TransactionModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { AddMoneyModal } from './components/modals/AddMoneyModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { ImportStatementModal } from './components/transactions/ImportStatementModal';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { Transaction, SavingsGoal } from './types';

const MainAppContent: React.FC = () => {
  const {
    activePage,
    deleteTransaction,
    deleteGoal,
    isAddTransactionOpen,
    setIsAddTransactionOpen,
    editingTransaction,
    setEditingTransaction,
    isAddGoalOpen,
    setIsAddGoalOpen,
    isSetBudgetOpen,
    setIsSetBudgetOpen,
  } = useFinance();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Deletion modals state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);

  // Goal modals state
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);

  // Budget modal state
  const [budgetCategoryToEdit, setBudgetCategoryToEdit] = useState<string | undefined>(undefined);
  const [budgetAmountToEdit, setBudgetAmountToEdit] = useState<number | undefined>(undefined);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7f6] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 transition-colors">
      {/* 1. Desktop Persistent Left Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable Page View */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 pb-20 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            {activePage === 'overview' && (
              <OverviewPage onOpenDepositModal={(id: string) => setDepositGoalId(id)} />
            )}
            {activePage === 'transactions' && (
              <TransactionsPage
                onAdd={() => {
                  setEditingTransaction(null);
                  setIsAddTransactionOpen(true);
                }}
                onEdit={(tx: Transaction) => {
                  setEditingTransaction(tx);
                  setIsAddTransactionOpen(true);
                }}
                onDelete={(tx: Transaction) => setTxToDelete(tx)}
              />
            )}
            {activePage === 'budgets' && (
              <BudgetsPage
                onOpenSetBudget={(cat?: string, amt?: number) => {
                  setBudgetCategoryToEdit(cat);
                  setBudgetAmountToEdit(amt);
                  setIsSetBudgetOpen(true);
                }}
              />
            )}
            {activePage === 'analytics' && <AnalyticsPage />}
            {activePage === 'savings' && (
              <SavingsGoalsPage
                onOpenAddGoal={() => {
                  setEditingGoal(null);
                  setIsAddGoalOpen(true);
                }}
                onOpenEditGoal={(goal: SavingsGoal) => {
                  setEditingGoal(goal);
                  setIsAddGoalOpen(true);
                }}
                onOpenDeposit={(id: string) => setDepositGoalId(id)}
                onDeleteGoal={(id: string) => setGoalToDeleteId(id)}
              />
            )}
            {activePage === 'settings' && <SettingsPage />}
            {activePage === 'profile' && <ProfilePage />}
            {activePage === 'help' && <HelpPage />}
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* 4. Global Modals */}
      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => {
          setIsAddTransactionOpen(false);
          setEditingTransaction(null);
        }}
        editTx={editingTransaction}
      />

      {/* Delete Transaction Confirmation */}
      <DeleteConfirmModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        title="Delete transaction?"
        message={`Are you sure you want to delete "${txToDelete?.description}"? All calculations and charts will update automatically.`}
      />

      {/* Savings Goal Modal (Add/Edit) */}
      <SavingsGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => {
          setIsAddGoalOpen(false);
          setEditingGoal(null);
        }}
        editGoal={editingGoal}
      />

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={!!depositGoalId}
        onClose={() => setDepositGoalId(null)}
        goalId={depositGoalId}
      />

      {/* Delete Goal Confirmation */}
      <DeleteConfirmModal
        isOpen={!!goalToDeleteId}
        onClose={() => setGoalToDeleteId(null)}
        onConfirm={() => {
          if (goalToDeleteId) {
            deleteGoal(goalToDeleteId);
            setGoalToDeleteId(null);
          }
        }}
        title="Delete savings goal?"
        message="Are you sure you want to remove this goal? Your savings progress and financial health calculations will update."
      />

      {/* Set Category Budget Modal */}
      <BudgetModal
        isOpen={isSetBudgetOpen}
        onClose={() => {
          setIsSetBudgetOpen(false);
          setBudgetCategoryToEdit(undefined);
          setBudgetAmountToEdit(undefined);
        }}
        defaultCategory={budgetCategoryToEdit}
        defaultAmount={budgetAmountToEdit}
      />

      {/* Bank & UPI Statement Import Modal */}
      <ImportStatementModal />

      {/* Google Authentication Modal */}
      <GoogleAuthModal />

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
