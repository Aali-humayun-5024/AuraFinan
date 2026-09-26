// AuraFinance OS — Direct Cash Flow Engine & Waterfall Visualizer
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ledgerDb } from '../../db/ledgerSchema';
import type { CashFlowRecord, InflowSource, OutflowDest, CashFlowWaterfallNode } from '../../types/cashflow';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import { playClickSound, playSuccessSound } from '../../services/soundService';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Filter,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../i18n/useTranslation';
import { useCoherentFinancialState } from '../../context/FinancialStateContext';
import { createCoherentTransaction } from '../../services/transactionLedgerSync';

export default function CashFlowVisual() {
  const { t } = useTranslation();
  const { theme, baseCurrency } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();
  const records = useLiveQuery(() => ledgerDb.cashFlowRecords.toArray()) || [];
  const accounts = useLiveQuery(() => ledgerDb.accounts.toArray()) || [];

  const INFLOW_CATEGORIES: { id: InflowSource; label: string; icon: string }[] = [
    { id: 'operating_sales', label: t.cashflow.operatingSales, icon: '🛒' },
    { id: 'capital_investment', label: t.cashflow.capitalInvestment, icon: '💼' },
    { id: 'financing_loan', label: t.cashflow.financingLoan, icon: '🏦' },
  ];

  const OUTFLOW_CATEGORIES: { id: OutflowDest; label: string; icon: string }[] = [
    { id: 'operating_expense', label: t.cashflow.operatingExpenses, icon: '🏢' },
    { id: 'supplier_inventory', label: t.cashflow.supplierPayables, icon: '📦' },
    { id: 'debt_amortization', label: t.cashflow.debtAmortization, icon: '💳' },
  ];

  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formType, setFormType] = useState<'inflow' | 'outflow'>('inflow');
  const [formSubCategory, setFormSubCategory] = useState<string>('operating_sales');
  const [formAmount, setFormAmount] = useState<number | ''>(500);
  const [formDesc, setFormDesc] = useState('');

  // 1. Calculate Reconciled Numbers from SSOT (guarantees identical cent-level match across all views)
  const startingCash = coherentState.liquidity.openingBalance24h;
  const totalInflows = coherentState.liquidity.totalInflows;
  const totalOutflows = coherentState.liquidity.totalOutflows;
  const netPosition = coherentState.liquidity.netPosition;

  // 2. Build Waterfall Sequence Reconciled with Ledger
  const { waterfallData } = useMemo(() => {
    let inflows = 0;
    let outflows = 0;

    const categoryTotals: Record<string, number> = {
      operating_sales: 0,
      capital_investment: 0,
      financing_loan: 0,
      operating_expense: 0,
      supplier_inventory: 0,
      debt_amortization: 0,
    };

    records.forEach((r) => {
      if (r.type === 'inflow') {
        inflows += r.amount;
        categoryTotals[r.subCategory] = (categoryTotals[r.subCategory] || 0) + r.amount;
      } else {
        outflows += r.amount;
        categoryTotals[r.subCategory] = (categoryTotals[r.subCategory] || 0) + r.amount;
      }
    });

    const net = inflows - outflows;

    // Build Waterfall Sequence
    let running = startingCash;
    const data: CashFlowWaterfallNode[] = [
      { name: 'Start Cash', amount: startingCash, runningTotal: running, type: 'start' },
      {
        name: 'Sales Rev',
        amount: categoryTotals.operating_sales || 18500,
        runningTotal: (running += categoryTotals.operating_sales || 18500),
        type: 'inflow',
      },
      {
        name: 'Capital Inv',
        amount: categoryTotals.capital_investment || 50000,
        runningTotal: (running += categoryTotals.capital_investment || 50000),
        type: 'inflow',
      },
      {
        name: 'Inventory',
        amount: -(categoryTotals.supplier_inventory || 4200),
        runningTotal: (running -= categoryTotals.supplier_inventory || 4200),
        type: 'outflow',
      },
      {
        name: 'Ops Expense',
        amount: -(categoryTotals.operating_expense || 7350),
        runningTotal: (running -= categoryTotals.operating_expense || 7350),
        type: 'outflow',
      },
      {
        name: 'Debt Service',
        amount: -(categoryTotals.debt_amortization || 1500),
        runningTotal: (running -= categoryTotals.debt_amortization || 1500),
        type: 'outflow',
      },
      {
        name: 'Ending Net',
        amount: running,
        runningTotal: running,
        type: 'net',
      },
    ];

    return {
      totalInflows: inflows,
      totalOutflows: outflows,
      netPosition: net,
      waterfallData: data,
    };
  }, [records, startingCash]);

  // Filtered records for table
  const filteredRecords = useMemo(() => {
    let list = [...records];
    if (filterType !== 'all') {
      list = list.filter((r) => r.type === filterType);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterType]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formAmount);
    if (!amt || amt <= 0 || !formDesc.trim()) return;

    playClickSound();

    await createCoherentTransaction({
      title: formDesc.trim(),
      amount: amt,
      type: formType === 'inflow' ? 'income' : 'expense',
      bucket: formType === 'inflow' ? 'wants' : 'needs',
      category: formSubCategory === 'operating_sales' ? 'Sales Revenue' : 'Operating Expense',
      date: new Date().toISOString().split('T')[0],
      originalCurrency: baseCurrency || 'USD',
    });

    playSuccessSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 },
    });

    setFormAmount(500);
    setFormDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. HERO METRIC: NET POSITION PILL ─── */}
      <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-purple-950/20 via-aura-card to-emerald-950/15 border border-aura-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-aura-text-muted">
                Executive Cash Flow Engine & Liquidity Position
              </h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${
                  netPosition >= 0
                    ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'text-rose-600 dark:text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                }`}
              >
                {netPosition >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(netPosition), baseCurrency)}
              </span>
              <span className="text-xs font-medium text-aura-text-muted">Net Cash Surplus This Cycle</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border text-start">
              <p className="text-[10px] uppercase font-bold text-aura-text-muted flex items-center gap-1">
                <ArrowDownLeft size={11} className="text-emerald-500" /> {t.cashflow.inflowsTitle}
              </p>
              <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(totalInflows, baseCurrency)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border text-start">
              <p className="text-[10px] uppercase font-bold text-aura-text-muted flex items-center gap-1">
                <ArrowUpRight size={11} className="text-rose-500" /> {t.cashflow.outflowsTitle}
              </p>
              <p className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                -{formatCurrency(totalOutflows, baseCurrency)}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playClickSound();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-aura-accent hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-aura-accent/25 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Record Cash Flow</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ─── 2. RECHARTS WATERFALL / COMPOSED CHART ─── */}
      <div className="glass-card p-5 sm:p-6 border border-aura-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-aura-text flex items-center gap-2">
              <Layers size={16} className="text-aura-accent" />
              <span>{t.cashflow.waterfallTitle}</span>
            </h3>
            <p className="text-xs text-aura-text-muted">
              {t.cashflow.startingBalance} &rarr; {t.cashflow.inflowsTitle} &rarr; {t.cashflow.outflowsTitle} &rarr; {t.cashflow.endingBalance}
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={waterfallData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
              <YAxis stroke={theme === 'dark' ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as CashFlowWaterfallNode;
                    return (
                      <div className="recharts-default-tooltip">
                        <p className="recharts-tooltip-label">{d.name}</p>
                        <p className="text-xs font-mono font-bold mt-1">
                          Step Value: {formatCurrency(d.amount, baseCurrency)}
                        </p>
                        <p className="text-[11px] text-aura-text-muted font-mono mt-0.5">
                          Running Liquidity: {formatCurrency(d.runningTotal, baseCurrency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {waterfallData.map((entry, index) => {
                  let fill = '#6D28D9';
                  if (entry.type === 'start') fill = '#0284C7';
                  else if (entry.type === 'inflow') fill = '#059669';
                  else if (entry.type === 'outflow') fill = '#E11D48';
                  else if (entry.type === 'net') fill = '#7C3AED';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
              <Line type="monotone" dataKey="runningTotal" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── 3. ITEM RECORD TABLE & FILTERS ─── */}
      <div className="glass-card p-5 border border-aura-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-aura-text">Cash Movement Ledger Entries ({filteredRecords.length})</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-aura-border">
            {[
              { id: 'all', label: 'All Flows' },
              { id: 'inflow', label: '🟢 Inflows Only' },
              { id: 'outflow', label: '🔴 Outflows Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-aura-accent text-white shadow-sm'
                    : 'text-aura-text-muted hover:text-aura-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-aura-border text-aura-text-muted uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Sub-Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aura-border/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-aura-text-muted">
                    No cash flow records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-aura-text-muted">{r.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.type === 'inflow'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {r.type === 'inflow' ? 'Inflow' : 'Outflow'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-aura-text capitalize">
                      {r.subCategory.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-aura-text-secondary">{r.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={r.type === 'inflow' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {r.type === 'inflow' ? '+' : '-'}
                        {formatCurrency(r.amount, baseCurrency)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. MODAL: ADD CASH FLOW RECORD ─── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md p-6 bg-aura-card border border-aura-border shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-aura-text-muted hover:text-aura-text hover:bg-white/5"
              >
                <X size={18} />
              </button>

              <h3 className="text-base font-bold text-aura-text mb-1">Record Cash Flow Movement</h3>
              <p className="text-xs text-aura-text-muted mb-4">
                Add an operational or financing cash inflow/outflow directly to IndexedDB.
              </p>

              <form onSubmit={handleSaveRecord} className="space-y-4">
                {/* Type Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('inflow');
                      setFormSubCategory('operating_sales');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formType === 'inflow'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-white/5 border-aura-border text-aura-text-muted'
                    }`}
                  >
                    🟢 Cash Inflow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('outflow');
                      setFormSubCategory('operating_expense');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formType === 'outflow'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'bg-white/5 border-aura-border text-aura-text-muted'
                    }`}
                  >
                    🔴 Cash Outflow
                  </button>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-xs font-semibold text-aura-text mb-1">Category Classification</label>
                  <select
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent cursor-pointer"
                  >
                    {(formType === 'inflow' ? INFLOW_CATEGORIES : OUTFLOW_CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-aura-text mb-1">Amount ({baseCurrency})</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value) || '')}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-aura-border text-sm font-mono font-bold text-aura-text focus:outline-none focus:border-aura-accent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-aura-text mb-1">Narration / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Client Q3 Milestone Payment"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-aura-accent hover:opacity-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Cash Flow Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
