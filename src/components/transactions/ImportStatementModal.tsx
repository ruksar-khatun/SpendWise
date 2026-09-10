import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  parseStatementCSV,
  ParsedTransactionPreview,
  SAMPLE_HDFC_BANK_CSV,
  SAMPLE_SBI_BANK_CSV,
  SAMPLE_GOOGLE_PAY_CSV,
} from '../../utils/statementParser';
import { CategoryName } from '../../types';

const CATEGORIES: CategoryName[] = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];

export const ImportStatementModal: React.FC = () => {
  const { isImportModalOpen, setIsImportModalOpen, bulkImportTransactions, showToast } = useFinance();
  const [parsedRows, setParsedRows] = useState<ParsedTransactionPreview[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportModalOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      showToast('Invalid file format', 'Please upload a valid .csv bank statement file', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const rows = parseStatementCSV(text);
        if (rows.length === 0) {
          showToast('No valid transactions found', 'Check the CSV headers or use one of the sample bank presets', 'warning');
        } else {
          setParsedRows(rows);
          showToast('Statement Parsed', `Extracted and auto-categorized ${rows.length} transactions`, 'success');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (sampleType: 'hdfc' | 'sbi' | 'gpay') => {
    let csv = SAMPLE_HDFC_BANK_CSV;
    let name = 'HDFC_Bank_Statement.csv';

    if (sampleType === 'sbi') {
      csv = SAMPLE_SBI_BANK_CSV;
      name = 'SBI_Bank_Statement.csv';
    } else if (sampleType === 'gpay') {
      csv = SAMPLE_GOOGLE_PAY_CSV;
      name = 'GooglePay_Statement.csv';
    }

    setFileName(name);
    const rows = parseStatementCSV(csv);
    setParsedRows(rows);
    showToast('Loaded Demo Statement', `Loaded sample ${name.replace('.csv', '')} transactions`, 'info');
  };

  const handleDownloadTemplate = () => {
    const templateCSV = `Date,Description,Amount,Transaction Type,Category
2026-09-08,Swiggy Food Delivery,450,Debit,Food
2026-09-08,Uber Office Ride,180,Debit,Transport
2026-09-07,Amazon India Order,1299,Debit,Shopping
2026-09-05,Electricity Bill BESCOM,1850,Debit,Bills
2026-09-01,Monthly Company Payroll,50000,Credit,Salary`;

    const blob = new Blob([templateCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SpendWise_Bank_Statement_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template Downloaded', 'Blank CSV template saved to your Downloads', 'info');
  };

  const handleToggleSelectAll = () => {
    const allSelected = parsedRows.every(r => r.selected);
    setParsedRows(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const handleToggleRow = (id: string) => {
    setParsedRows(prev =>
      prev.map(r => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleCategoryChange = (id: string, category: string) => {
    setParsedRows(prev =>
      prev.map(r => (r.id === id ? { ...r, category } : r))
    );
  };

  const selectedRows = parsedRows.filter(r => r.selected);
  const totalExpense = selectedRows
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalIncome = selectedRows
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleConfirmImport = async () => {
    if (selectedRows.length === 0) {
      showToast('No transactions selected', 'Please select at least one transaction to import', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = selectedRows.map(r => ({
        type: r.type,
        description: r.description,
        category: r.category,
        amount: r.amount,
        date: r.date,
        merchant: r.merchant,
        notes: `Imported via Bank Statement (${fileName || 'CSV'})`,
      }));

      await bulkImportTransactions(payload);
      setIsImportModalOpen(false);
      setParsedRows([]);
      setFileName('');
    } catch (err: any) {
      showToast('Import Error', err.message || 'Failed to import transactions', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Import Bank Statement & UPI
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 uppercase">
                  Auto-Categorize
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload CSV statements from <strong>HDFC, SBI, ICICI, Axis, Kotak, Google Pay, PhonePe</strong>, or Paytm.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsImportModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Privacy Guarantee Banner */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>100% Client-Side Privacy:</strong> All files are parsed locally inside your browser. Account numbers, IFSC codes, and mobile handles are automatically stripped and never stored.
            </span>
          </div>

          {parsedRows.length === 0 ? (
            /* Upload Dropzone View */
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500/50 bg-slate-50/50 dark:bg-slate-900/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Drag and drop your Bank Statement CSV here, or <span className="text-teal-600 dark:text-teal-400 underline">browse</span>
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Export your statement from your Netbanking portal or UPI app as a CSV file.
                </p>
              </div>

              {/* Sample Bank Statement Loaders */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Try with Sample Bank Statements (1-Click Demo)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Download className="w-3 h-3" />
                    Download Blank CSV Template
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('hdfc')}
                    className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition text-left flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-700 dark:text-teal-400">🏦 HDFC Bank</span>
                      <span className="text-[10px] text-slate-400">11 items</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">Salary, Swiggy, Zepto, Bills</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSample('sbi')}
                    className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition text-left flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600 dark:text-blue-400">🏛️ SBI Bank</span>
                      <span className="text-[10px] text-slate-400">8 items</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">UPI Transfers, Amazon, Cult</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSample('gpay')}
                    className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition text-left flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-600 dark:text-purple-400">📱 Google Pay</span>
                      <span className="text-[10px] text-slate-400">12 items</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">Swiggy, Uber, Starbucks, Metro</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Review Table */
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedRows.length} of {parsedRows.length} selected
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    Expenses: ₹{totalExpense.toLocaleString()}
                  </span>
                  {totalIncome > 0 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Income: ₹{totalIncome.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  Upload different file
                </button>
              </div>

              {/* Transactions List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={parsedRows.length > 0 && parsedRows.every(r => r.selected)}
                          onChange={handleToggleSelectAll}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Clean Narration / Merchant</th>
                      <th className="p-2.5">Auto Category</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition ${
                          !row.selected ? 'opacity-40 bg-slate-50/40 dark:bg-slate-900/20' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => handleToggleRow(row.id)}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="p-2.5 max-w-[220px]">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {row.description}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {row.merchant}
                          </p>
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={row.category}
                              onChange={(e) => handleCategoryChange(row.id, e.target.value)}
                              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {row.confidence === 'high' && (
                              <span title="High confidence auto-match" className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-medium whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              row.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {row.type === 'income' ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                            )}
                            ₹{row.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30">
          {parsedRows.length > 0 ? (
            <button
              type="button"
              onClick={() => setParsedRows([])}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Upload</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setParsedRows([]);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition"
            >
              Cancel
            </button>
          )}

          {parsedRows.length > 0 && (
            <button
              type="button"
              disabled={isSubmitting || selectedRows.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-500/20 flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Importing to Database...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Import ({selectedRows.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
