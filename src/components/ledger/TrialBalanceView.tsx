// AuraFinance OS — CPA Trial Balance Ledger View
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ledgerDb } from '../../db/ledgerSchema';
import type { AccountHeading, TrialBalanceRow } from '../../types/accounting';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import { useCoherentFinancialState } from '../../context/FinancialStateContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
} from 'lucide-react';

export default function TrialBalanceView() {
  const { baseCurrency } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();
  const { ledgerBalances } = coherentState;
  const accounts = useLiveQuery(() => ledgerDb.accounts.toArray()) || [];
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Compute live trial balance rows
  const { rows, totalDebits, totalCredits, isBalanced, variance } = useMemo(() => {
    let tDebits = 0;
    let tCredits = 0;
    const sorted = [...accounts].sort((a, b) => a.code.localeCompare(b.code));

    const computedRows: TrialBalanceRow[] = sorted.map((acc) => {
      let debitBalance = 0;
      let creditBalance = 0;

      if (acc.normalBalance === 'debit') {
        if (acc.currentBalance >= 0) {
          debitBalance = acc.currentBalance;
        } else {
          creditBalance = Math.abs(acc.currentBalance);
        }
      } else {
        if (acc.currentBalance >= 0) {
          creditBalance = acc.currentBalance;
        } else {
          debitBalance = Math.abs(acc.currentBalance);
        }
      }

      tDebits += debitBalance;
      tCredits += creditBalance;

      return {
        accountCode: acc.code,
        accountName: acc.name,
        category: acc.category,
        debitBalance: Math.round(debitBalance * 100) / 100,
        creditBalance: Math.round(creditBalance * 100) / 100,
      };
    });

    const diff = Math.abs(tDebits - tCredits);
    return {
      rows: computedRows,
      totalDebits: Math.round(tDebits * 100) / 100,
      totalCredits: Math.round(tCredits * 100) / 100,
      isBalanced: diff < 0.01,
      variance: Math.round(diff * 100) / 100,
    };
  }, [accounts]);

  const filteredRows = useMemo(() => {
    if (filterCategory === 'all') return rows;
    return rows.filter((r) => r.category === filterCategory);
  }, [rows, filterCategory]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Account Code,Account Name,Category,Debit Balance,Credit Balance']
        .concat(
          rows.map(
            (r) =>
              `"${r.accountCode}","${r.accountName}","${r.category}",${r.debitBalance},${r.creditBalance}`
          )
        )
        .concat([`"","TOTALS","",${totalDebits},${totalCredits}`])
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AuraFinance_Trial_Balance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 rounded-3xl bg-white/85 dark:bg-[#0D121E]/70 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.03),0_10px_30px_-5px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.40)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale size={18} className="text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Chart of Accounts Trial Balance</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mathematical verification of double-entry ledger equilibrium across all 5 account classes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-xs ${
              ledgerBalances.variance === 0
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-400'
            }`}
          >
            {ledgerBalances.variance === 0 ? (
              <>
                <CheckCircle2 size={14} />
                <span>Balanced (Variance: $0.00)</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>Discrepancy: ${ledgerBalances.variance.toFixed(2)}</span>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/60 dark:bg-white/[0.02] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
        {[
          { id: 'all', label: 'All Accounts' },
          { id: 'asset', label: 'Assets (1000s)' },
          { id: 'liability', label: 'Liabilities (2000s)' },
          { id: 'equity', label: 'Equity (3000s)' },
          { id: 'revenue', label: 'Revenue (4000s)' },
          { id: 'expense', label: 'Expenses (5000s)' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterCategory === c.id
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Trial Balance Table (Master Spec 5.4) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-white/[0.08]">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead className="bg-slate-50/80 dark:bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                Code
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                Account Title
              </th>
              <th className="px-4 py-3 w-32 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                Classification
              </th>
              <th className="px-4 py-3 w-36 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                Debit Balance
              </th>
              <th className="px-4 py-3 w-36 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                Credit Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filteredRows.map((row) => (
              <tr key={row.accountCode} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors duration-100">
                <td className="px-4 py-3.5 font-mono font-bold text-cyan-600 dark:text-cyan-400 border-b border-slate-100 dark:border-white/[0.04]">
                  {row.accountCode}
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/[0.04]">
                  {row.accountName}
                </td>
                <td className="px-4 py-3.5 text-center border-b border-slate-100 dark:border-white/[0.04]">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      row.category === 'asset'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                        : row.category === 'liability'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        : row.category === 'equity'
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400'
                        : row.category === 'revenue'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200 tabular-nums border-b border-slate-100 dark:border-white/[0.04]">
                  {row.debitBalance > 0
                    ? `$${row.debitBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : '—'}
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200 tabular-nums border-b border-slate-100 dark:border-white/[0.04]">
                  {row.creditBalance > 0
                    ? `$${row.creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Mathematical Totals Footer (Master Spec 5.4) */}
          <tfoot className="border-t-2 border-slate-300 dark:border-white/[0.16] bg-slate-50/50 dark:bg-white/[0.01]">
            <tr>
              <td colSpan={3} className="px-4 py-3.5 uppercase text-xs font-bold tracking-wider text-slate-800 dark:text-slate-100">
                Equalized Ledger Sum (Σ)
              </td>
              <td
                className={`px-4 py-3.5 text-right font-bold tabular-nums transition-colors ${
                  ledgerBalances.variance === 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                }`}
              >
                ${ledgerBalances.totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td
                className={`px-4 py-3.5 text-right font-bold tabular-nums transition-colors ${
                  ledgerBalances.variance === 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                }`}
              >
                ${ledgerBalances.totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
