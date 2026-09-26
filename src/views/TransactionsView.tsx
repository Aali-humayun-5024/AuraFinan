// AuraFinance OS — Transactions View with Full Reactive CRUD, Multi-sort, and Inline Edit Modal
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedLiveQuery } from '../hooks/useDebouncedLiveQuery';
import { db, type Transaction } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, convertCurrency } from '../services/fxService';
import FinancialMetric from '../components/common/FinancialMetric';
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
} from 'lucide-react';

type FilterType = 'all' | 'income' | 'expense';
type BucketFilter = 'all' | 'needs' | 'wants' | 'savings';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function TransactionsView() {
  const { baseCurrency, fxRates } = useAppStore();
  const rawTransactions = useDebouncedLiveQuery(() => db.transactions.toArray()) || [];

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

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
    await db.transactions.delete(id);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-aura-text">Transactions</h1>
          <p className="text-sm text-aura-text-muted mt-0.5">
            {filteredAndSorted.length} matching of {rawTransactions.length} total entries
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-aura-accent to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
          style={{ boxShadow: '0 4px 20px rgba(124,92,252,0.3)' }}
        >
          <Plus size={16} /> Add Transaction
        </motion.button>
      </div>

      {/* Control Bar: Search, Type, Bucket, Category & Sort */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-aura-text-muted" />
            <input
              type="text"
              placeholder="Search by title, merchant, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text placeholder:text-aura-text-muted focus:outline-none focus:border-aura-accent transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] rounded-xl border border-aura-border text-xs text-aura-text-muted">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort transactions by"
                className="bg-transparent text-aura-text focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-[#0f172a] text-white">Date: Newest First</option>
                <option value="date-asc" className="bg-[#0f172a] text-white">Date: Oldest First</option>
                <option value="amount-desc" className="bg-[#0f172a] text-white">Amount: Highest First</option>
                <option value="amount-asc" className="bg-[#0f172a] text-white">Amount: Lowest First</option>
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] rounded-xl border border-aura-border text-xs text-aura-text-muted">
              <Layers size={14} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter transactions by category"
                className="bg-transparent text-aura-text focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="all" className="bg-[#0f172a] text-white">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#0f172a] text-white">
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
          <div className="flex bg-white/[0.04] rounded-xl border border-aura-border p-0.5">
            {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  typeFilter === f ? 'bg-aura-accent/20 text-aura-accent' : 'text-aura-text-muted hover:text-aura-text'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Bucket Filter */}
          <div className="flex bg-white/[0.04] rounded-xl border border-aura-border p-0.5">
            {(['all', 'needs', 'wants', 'savings'] as BucketFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setBucketFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  bucketFilter === f ? 'bg-aura-accent/20 text-aura-accent' : 'text-aura-text-muted hover:text-aura-text'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List Rendering */}
      <div className="space-y-6">
        {grouped ? (
          Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider">{dateLabel}</h3>
                <div className="flex-1 h-px bg-aura-border" />
                <span className="text-xs text-aura-text-muted font-mono">
                  {txs.length} {txs.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <div className="space-y-1">
                <AnimatePresence>
                  {txs.map((tx) => renderTransactionRow(tx))}
                </AnimatePresence>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {filteredAndSorted.map((tx) => renderTransactionRow(tx))}
            </AnimatePresence>
          </div>
        )}

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12">
            <Filter size={40} className="mx-auto text-aura-text-muted mb-3 opacity-30" />
            <p className="text-sm text-aura-text-muted">No transactions match your filters</p>
          </div>
        )}
      </div>

      {/* Quick Inline Edit Modal */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card p-6 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 size={18} className="text-aura-accent" />
                  Edit Transaction
                </h3>
                <button
                  onClick={() => setEditingTx(null)}
                  className="p-1.5 rounded-lg text-aura-text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-aura-text-muted block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingTx.title}
                    onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-white focus:outline-none focus:border-aura-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-aura-text-muted block mb-1">Amount</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingTx.amount}
                      onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-white font-mono focus:outline-none focus:border-aura-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-aura-text-muted block mb-1">Currency</label>
                    <input
                      type="text"
                      value={editingTx.originalCurrency}
                      onChange={(e) => setEditingTx({ ...editingTx, originalCurrency: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-white font-mono focus:outline-none focus:border-aura-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-aura-text-muted block mb-1">Type</label>
                    <select
                      value={editingTx.type}
                      onChange={(e) => setEditingTx({ ...editingTx, type: e.target.value as 'income' | 'expense' })}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e293b] border border-aura-border text-sm text-white focus:outline-none focus:border-aura-accent"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-aura-text-muted block mb-1">50/30/20 Bucket</label>
                    <select
                      value={editingTx.bucket}
                      onChange={(e) => setEditingTx({ ...editingTx, bucket: e.target.value as 'needs' | 'wants' | 'savings' })}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e293b] border border-aura-border text-sm text-white focus:outline-none focus:border-aura-accent"
                    >
                      <option value="needs">Needs (50%)</option>
                      <option value="wants">Wants (30%)</option>
                      <option value="savings">Savings (20%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-aura-text-muted block mb-1">Category</label>
                    <input
                      type="text"
                      value={editingTx.category}
                      onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-white focus:outline-none focus:border-aura-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-aura-text-muted block mb-1">Merchant</label>
                    <input
                      type="text"
                      value={editingTx.merchant || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, merchant: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-white focus:outline-none focus:border-aura-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-aura-text-muted block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-white focus:outline-none focus:border-aura-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-aura-text-muted hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-aura-accent to-purple-500 text-xs font-semibold text-white shadow-lg transition-transform active:scale-95"
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50, height: 0 }}
        className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-aura-border"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              tx.type === 'income' ? 'bg-aura-green-soft text-aura-green' : 'bg-aura-red-soft text-aura-red'
            }`}
          >
            {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-aura-text truncate">{tx.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-aura-text-muted">{tx.category}</span>
              {tx.merchant && (
                <>
                  <span className="text-aura-text-muted">·</span>
                  <span className="text-xs text-aura-text-muted">{tx.merchant}</span>
                </>
              )}
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full badge-${tx.bucket}`}>
                {tx.bucket}
              </span>
              <span className="text-[10px] text-aura-text-muted font-mono">{tx.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tx.tags && tx.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              <Tag size={12} className="text-aura-text-muted" />
              {tx.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] text-aura-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-right">
            <div className="flex items-baseline justify-end">
              <FinancialMetric
                value={convertCurrency(tx.amount, tx.originalCurrency, baseCurrency, fxRates)}
                currency={baseCurrency}
                align="right"
                size="sm"
                prefixSign={tx.type === 'income' ? '+' : '-'}
                color={tx.type === 'income' ? 'text-aura-green font-semibold' : 'text-aura-red font-semibold'}
                symbolColor={tx.type === 'income' ? 'text-aura-green/80' : 'text-aura-red/80'}
                fractionColor={tx.type === 'income' ? 'text-aura-green/80' : 'text-aura-red/80'}
              />
            </div>
            {tx.originalCurrency !== baseCurrency && (
              <p className="text-[10px] text-aura-text-muted font-mono tabular-nums mt-0.5">
                {tx.amount.toLocaleString()} {tx.originalCurrency}
              </p>
            )}
          </div>

          {/* Action buttons: Edit & Delete */}
          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditingTx(tx)}
              title="Edit transaction"
              className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-aura-accent/20 text-aura-text-muted hover:text-aura-accent flex items-center justify-center transition-colors"
            >
              <Edit2 size={13} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => tx.id && handleDelete(tx.id)}
              title="Delete transaction"
              className="w-8 h-8 rounded-lg bg-aura-red-soft text-aura-red flex items-center justify-center transition-colors"
            >
              <Trash2 size={13} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }
}
