// AuraFinance OS — Transactions View with Full Reactive Dual-Store CRUD and System-Wide Reconciliation
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedLiveQuery } from '../hooks/useDebouncedLiveQuery';
import { db, type Transaction } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, convertCurrency } from '../services/fxService';
import { useCoherentFinancialState } from '../context/FinancialStateContext';
import { createCoherentTransaction, deleteCoherentTransaction } from '../services/transactionLedgerSync';
import { playClickSound, playSuccessSound } from '../services/soundService';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  ArrowUpDown,
  X,
  Check,
  Calendar,
  DollarSign,
  Layers,
  Store,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';

type FilterType = 'all' | 'income' | 'expense';
type BucketFilter = 'all' | 'needs' | 'wants' | 'savings';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function TransactionsView() {
  const { baseCurrency, fxRates, activeProfileId } = useAppStore();
  const rawTransactions = useDebouncedLiveQuery(() => db.transactions.toArray()) || [];
  const { state: coherentState } = useCoherentFinancialState();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>(1200);
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newBucket, setNewBucket] = useState<'needs' | 'wants' | 'savings'>('wants');
  const [newCategory, setNewCategory] = useState('Consulting Revenue');
  const [newMerchant, setNewMerchant] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawTransactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [rawTransactions]);

  // Filtered and Sorted list
  const filteredAndSorted = useMemo(() => {
    const list = rawTransactions.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.merchant && t.merchant.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === 'all' || t.type === typeFilter;
      const matchBucket = bucketFilter === 'all' || t.bucket === bucketFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchSearch && matchType && matchBucket && matchCategory;
    });

    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      const valA = convertCurrency(a.amount, a.originalCurrency, baseCurrency, fxRates);
      const valB = convertCurrency(b.amount, b.originalCurrency, baseCurrency, fxRates);
      if (sortBy === 'amount-desc') {
        return valB - valA;
      }
      if (sortBy === 'amount-asc') {
        return valA - valB;
      }
      return 0;
    });

    return list;
  }, [rawTransactions, search, typeFilter, bucketFilter, categoryFilter, sortBy, baseCurrency, fxRates]);

  const handleDelete = async (id: number) => {
    playClickSound();
    await deleteCoherentTransaction(id);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editingTx.id) return;

    await db.transactions.update(editingTx.id, {
      title: editingTx.title,
      amount: Number(editingTx.amount),
      type: editingTx.type,
      bucket: editingTx.bucket,
      category: editingTx.category,
      merchant: editingTx.merchant,
      date: editingTx.date,
      originalCurrency: editingTx.originalCurrency,
      amountInUSD: convertCurrency(editingTx.amount, editingTx.originalCurrency, 'USD', fxRates),
    });

    setEditingTx(null);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount || Number(newAmount) <= 0) return;

    setIsSubmitting(true);
    playClickSound();

    try {
      await createCoherentTransaction(
        {
          title: newTitle,
          amount: Number(newAmount),
          type: newType,
          bucket: newBucket,
          category: newCategory,
          merchant: newMerchant,
          date: newDate,
          originalCurrency: baseCurrency,
          profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
        },
        fxRates
      );

      playSuccessSound();
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.5 } });

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewAmount(1200);
      setNewMerchant('');
    } catch (err) {
      console.error('Failed to post transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group by date when sorted by date
  const isDateSort = sortBy === 'date-desc' || sortBy === 'date-asc';
  const grouped = useMemo(() => {
    if (!isDateSort) return null;
    const groups: Record<string, typeof filteredAndSorted> = {};
    filteredAndSorted.forEach((t) => {
      const dateLabel = new Date(t.date).toLocaleDateString('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(t);
    });
    return groups;
  }, [filteredAndSorted, isDateSort]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* 1. Header with SSOT Metrics & Add Transaction Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Ledger Transactions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              GAAP Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Central mutation vector with real-time double-entry posting to General Ledger, Cash Flow & Sliders.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClickSound();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} /> Post Transaction
        </motion.button>
      </div>

      {/* 2. Coherent Financial Summary Strip (Zero-Discrepancy Law) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Liquid Cash (1010+1020)</span>
            <Wallet size={14} className="text-cyan-500" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(coherentState.liquidity.liquidCash, baseCurrency)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Reconciled Inflows</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(coherentState.liquidity.totalInflows, baseCurrency)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Reconciled Outflows</span>
            <TrendingDown size={14} className="text-rose-500" />
          </div>
          <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            -{formatCurrency(coherentState.liquidity.totalOutflows, baseCurrency)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Remaining 30% Wants</span>
            <Zap size={14} className={coherentState.buckets.isWantsBreached ? 'text-amber-500' : 'text-emerald-500'} />
          </div>
          <p className={`text-lg font-bold font-mono tabular-nums ${coherentState.buckets.isWantsBreached ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {formatCurrency(coherentState.buckets.remainingWantsBudget, baseCurrency)}
          </p>
        </div>
      </div>

      {/* 3. Control Bar: Search, Type, Bucket, Category & Sort */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions by title, merchant, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-aura-border text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200/90 dark:border-aura-border text-xs text-slate-600 dark:text-slate-400">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort transactions by"
                className="bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer text-xs"
              >
                <option value="date-desc" className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">Date: Newest First</option>
                <option value="date-asc" className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">Date: Oldest First</option>
                <option value="amount-desc" className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">Amount: Highest First</option>
                <option value="amount-asc" className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">Amount: Lowest First</option>
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200/90 dark:border-aura-border text-xs text-slate-600 dark:text-slate-400">
              <Layers size={14} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter transactions by category"
                className="bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[140px] truncate text-xs"
              >
                <option value="all" className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-aura-border p-0.5">
            {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                  typeFilter === f
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Bucket Filter */}
          <div className="flex bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-aura-border p-0.5">
            {(['all', 'needs', 'wants', 'savings'] as BucketFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setBucketFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                  bucketFilter === f
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Transaction List Rendering */}
      <div className="space-y-6">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching transactions found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search filters or click "Post Transaction" above.</p>
          </div>
        ) : grouped ? (
          Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-2.5">
                <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dateLabel}</h3>
                <div className="flex-1 h-px bg-slate-200/80 dark:bg-aura-border" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {txs.length} {txs.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <div className="space-y-1.5">
                <AnimatePresence>
                  {txs.map((tx) => renderTransactionRow(tx))}
                </AnimatePresence>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {filteredAndSorted.map((tx) => renderTransactionRow(tx))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 5. Add Transaction Modal (Synchronized GAAP Dual-Write) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.12] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Post Synchronized Transaction</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Atomically balances General Ledger & Cash Flow</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTransaction} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Title / Narration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consulting Revenue, Weekly Rashan, AWS Cloud Bill"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Amount ({baseCurrency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0.01"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => {
                        const t = e.target.value as 'income' | 'expense';
                        setNewType(t);
                        if (t === 'income') {
                          setNewCategory('Consulting Revenue');
                          setNewBucket('wants');
                        } else {
                          setNewCategory('Food & Groceries');
                          setNewBucket('needs');
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="income">Income (Revenue 4010)</option>
                      <option value="expense">Expense (Outflow 5000s)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">50/30/20 Partition</label>
                    <select
                      value={newBucket}
                      onChange={(e) => setNewBucket(e.target.value as 'needs' | 'wants' | 'savings')}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="needs">Needs (50% Essential)</option>
                      <option value="wants">Wants (30% Discretionary)</option>
                      <option value="savings">Savings (20% Wealth Building)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g. Sales, Groceries, Cloud"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Merchant / Client</label>
                    <input
                      type="text"
                      value={newMerchant}
                      onChange={(e) => setNewMerchant(e.target.value)}
                      placeholder="e.g. Acme Corp, Al-Fatah, AWS"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400">
                    <ShieldCheck size={13} />
                    <span>Automatic GAAP Journal Balancing:</span>
                  </div>
                  <p>
                    {newType === 'income'
                      ? `Dr. 1010 Cash on Hand: ${formatCurrency(Number(newAmount) || 0, baseCurrency)} | Cr. 4010 Consulting Revenue: ${formatCurrency(Number(newAmount) || 0, baseCurrency)}`
                      : `Dr. 5000 Expense: ${formatCurrency(Number(newAmount) || 0, baseCurrency)} | Cr. 1010 Cash on Hand: ${formatCurrency(Number(newAmount) || 0, baseCurrency)}`}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    <Check size={14} />
                    {isSubmitting ? 'Posting...' : 'Post to Ledger'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Edit Transaction Modal */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.12] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Transaction</h3>
                <button
                  onClick={() => setEditingTx(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingTx.title}
                    onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Amount</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingTx.amount}
                      onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Currency</label>
                    <input
                      type="text"
                      value={editingTx.originalCurrency}
                      onChange={(e) => setEditingTx({ ...editingTx, originalCurrency: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                    <select
                      value={editingTx.type}
                      onChange={(e) => setEditingTx({ ...editingTx, type: e.target.value as 'income' | 'expense' })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">50/30/20 Bucket</label>
                    <select
                      value={editingTx.bucket}
                      onChange={(e) => setEditingTx({ ...editingTx, bucket: e.target.value as 'needs' | 'wants' | 'savings' })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="needs">Needs (50%)</option>
                      <option value="wants">Wants (30%)</option>
                      <option value="savings">Savings (20%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                    <input
                      type="text"
                      value={editingTx.category}
                      onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Merchant</label>
                    <input
                      type="text"
                      value={editingTx.merchant || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, merchant: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    <Check size={14} />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  function renderTransactionRow(tx: Transaction) {
    return (
      <motion.div
        key={tx.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -30, height: 0 }}
        className="group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all border border-slate-200/80 dark:border-aura-border shadow-xs dark:shadow-none"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {tx.type === 'income' ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{tx.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{tx.category}</span>
              {tx.merchant && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{tx.merchant}</span>
                </>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                tx.bucket === 'needs' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                tx.bucket === 'wants' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {tx.bucket}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{tx.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p
            className={`text-xs font-mono font-bold tabular-nums ${
              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatCurrency(tx.amount, (tx.originalCurrency || baseCurrency) as any)}
          </p>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingTx(tx)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Edit Transaction"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => tx.id && handleDelete(tx.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Transaction"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
}
