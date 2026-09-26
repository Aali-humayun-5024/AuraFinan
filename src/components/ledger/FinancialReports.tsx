// AuraFinance OS — CPA Financial Reports (Balance Sheet & Income Statement)
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ledgerDb } from '../../db/ledgerSchema';
import { generateFinancialStatements } from '../../services/financialReportGen';
import type { FinancialStatements } from '../../types/accounting';
import { formatCurrency } from '../../services/fxService';
import { useAppStore } from '../../store/useAppStore';
import { playClickSound } from '../../services/soundService';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
} from 'lucide-react';

export default function FinancialReports() {
  const { baseCurrency } = useAppStore();
  const [activeTab, setActiveTab] = useState<'balance_sheet' | 'income_statement'>('balance_sheet');
  const [reports, setReports] = useState<FinancialStatements | null>(null);

  // Re-run whenever accounts or journal entries change
  const accounts = useLiveQuery(() => ledgerDb.accounts.toArray()) || [];
  const entries = useLiveQuery(() => ledgerDb.journalEntries.toArray()) || [];

  useEffect(() => {
    generateFinancialStatements().then(setReports);
  }, [accounts, entries]);

  if (!reports) {
    return (
      <div className="glass-card p-8 text-center text-xs text-aura-text-muted">
        Generating live financial statements...
      </div>
    );
  }

  const { incomeStatement, balanceSheet } = reports;

  return (
    <div className="glass-card p-5 sm:p-6 border border-aura-border space-y-5">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-aura-accent" />
            <h2 className="text-base font-bold text-aura-text">CPA-Grade Financial Statements</h2>
          </div>
          <p className="text-xs text-aura-text-muted">
            GAAP/IFRS standard reporting generated directly from immutable IndexedDB ledger entries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-aura-border">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('balance_sheet');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'balance_sheet'
                  ? 'bg-aura-accent text-white shadow-sm'
                  : 'text-aura-text-muted hover:text-aura-text'
              }`}
            >
              🏛️ Balance Sheet
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('income_statement');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'income_statement'
                  ? 'bg-aura-accent text-white shadow-sm'
                  : 'text-aura-text-muted hover:text-aura-text'
              }`}
            >
              📈 Income Statement (P&L)
            </button>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: BALANCE SHEET ─── */}
      {activeTab === 'balance_sheet' && (
        <div className="space-y-5">
          {/* Fundamental Accounting Equation Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm ${
              balanceSheet.isEquationBalanced
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className={balanceSheet.isEquationBalanced ? 'text-emerald-500' : 'text-rose-500'} />
              <div>
                <span className="font-bold text-xs block">
                  {balanceSheet.isEquationBalanced
                    ? 'Fundamental Accounting Equation: Verified Balanced'
                    : 'Fundamental Accounting Equation: Out of Balance'}
                </span>
                <span className="text-[11px] opacity-80 font-mono">
                  Assets (${balanceSheet.totalAssets.toLocaleString()}) ≡ Liabilities (${balanceSheet.totalLiabilities.toLocaleString()}) + Equity (${balanceSheet.totalEquity.toLocaleString()})
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 self-start sm:self-auto font-mono">
              GAAP Verified
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Assets */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
              <div className="flex items-center justify-between border-b border-aura-border pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Current & Operating Assets
                </h3>
                <span className="text-xs font-mono font-bold text-aura-text">
                  ${balanceSheet.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="divide-y divide-aura-border/40 text-xs">
                {balanceSheet.assets.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span className="text-aura-text">{item.name}</span>
                    <span className="font-mono text-aura-text-secondary">
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t-2 border-aura-border flex items-center justify-between font-bold text-xs text-aura-text font-mono">
                <span>TOTAL ASSETS</span>
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  ${balanceSheet.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Right Column: Liabilities + Equity */}
            <div className="space-y-4">
              {/* Liabilities */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
                <div className="flex items-center justify-between border-b border-aura-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Liabilities & Obligations
                  </h3>
                  <span className="text-xs font-mono font-bold text-aura-text">
                    ${balanceSheet.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="divide-y divide-aura-border/40 text-xs">
                  {balanceSheet.liabilities.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="text-aura-text">{item.name}</span>
                      <span className="font-mono text-aura-text-secondary">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-aura-border flex items-center justify-between font-bold text-xs text-aura-text font-mono">
                  <span>TOTAL LIABILITIES</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    ${balanceSheet.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Equity */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
                <div className="flex items-center justify-between border-b border-aura-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Shareholders' & Owner's Equity
                  </h3>
                  <span className="text-xs font-mono font-bold text-aura-text">
                    ${balanceSheet.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="divide-y divide-aura-border/40 text-xs">
                  {balanceSheet.equity.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="text-aura-text">{item.name}</span>
                      <span className="font-mono text-aura-text-secondary">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="py-2 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Ending Retained Earnings (inc. Net Income)</span>
                    <span className="font-mono">
                      ${balanceSheet.retainedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-aura-border flex items-center justify-between font-bold text-xs text-aura-text font-mono">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span className="text-purple-600 dark:text-purple-400 text-sm">
                    ${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INCOME STATEMENT ─── */}
      {activeTab === 'income_statement' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border text-center">
              <span className="text-[10px] uppercase font-bold text-aura-text-muted">Total Revenue</span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                ${incomeStatement.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border text-center">
              <span className="text-[10px] uppercase font-bold text-aura-text-muted">Total Operating Expenses</span>
              <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                ${incomeStatement.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-aura-accent/15 to-emerald-500/10 border border-aura-accent/30 text-center">
              <span className="text-[10px] uppercase font-bold text-aura-accent">Net Operating Income</span>
              <p className="text-2xl font-black font-mono text-aura-text mt-1">
                ${incomeStatement.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenues */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-aura-border pb-2">
                Operating & Non-Operating Revenues
              </h3>
              <div className="divide-y divide-aura-border/40 text-xs">
                {incomeStatement.revenues.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span className="text-aura-text">{item.name}</span>
                    <span className="font-mono text-aura-text-secondary">
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border-b border-aura-border pb-2">
                Cost of Goods & Operating Outlays
              </h3>
              <div className="divide-y divide-aura-border/40 text-xs">
                {incomeStatement.expenses.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span className="text-aura-text">{item.name}</span>
                    <span className="font-mono text-aura-text-secondary">
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
