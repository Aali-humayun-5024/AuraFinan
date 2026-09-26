// BudgetBasics — Expense Planner Demonstration Module
// Complies with TechWiz 7 SRS Section 1.6.5:
// - Add sample expense entries: date, category, description, amount
// - Display entered items into a temporary on-screen table
// - Calculate total planned expenses and remaining sample balance
// - Edit or remove entries during the current session
// - Category options: Food, Transport, Education, Entertainment, Shopping, Utilities, Miscellaneous
// - Clear input labels and helpful placeholders

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  TrendingDown,
  Wallet,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ExpenseEntry {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

const INITIAL_EXPENSES: ExpenseEntry[] = [
  { id: 'exp-1', date: '2026-09-24', category: 'Food', description: 'Campus Cafeteria Lunch & Tea', amount: 14.50 },
  { id: 'exp-2', date: '2026-09-25', category: 'Education', description: 'Calculus Laboratory Notebook & Printouts', amount: 22.00 },
  { id: 'exp-3', date: '2026-09-25', category: 'Transport', description: 'Metro Pass Weekly Recharge', amount: 15.00 },
  { id: 'exp-4', date: '2026-09-26', category: 'Entertainment', description: 'Weekend Cinema Ticket with Friends', amount: 18.00 },
];

export default function ExpensePlannerModule() {
  const { baseCurrency } = useAppStore();
  const symbol = baseCurrency === 'PKR' ? '₨' : baseCurrency === 'EUR' ? '€' : baseCurrency === 'GBP' ? '£' : '$';

  // Budget allowance
  const [sampleBudget, setSampleBudget] = useState<number>(500);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(INITIAL_EXPENSES);

  // Form Fields
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Food');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState<string>('');
  const [editAmt, setEditAmt] = useState<string>('');
  const [editCat, setEditCat] = useState<string>('Food');

  // Total Calculations
  const totalPlanned = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = sampleBudget - totalPlanned;
  const isOverBudget = remainingBalance < 0;

  // Add Handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError('Please enter an expense description.');
      return;
    }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setFormError('Please enter a positive numeric expense amount.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    const newEntry: ExpenseEntry = {
      id: `exp-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      category: finalCategory,
      description: description.trim(),
      amount: numAmt,
    };

    setExpenses((prev) => [newEntry, ...prev]);
    setDescription('');
    setAmount('');
    setCustomCategory('');
  };

  // Remove Handler
  const handleRemove = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Start Edit
  const startEdit = (entry: ExpenseEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditAmt(entry.amount.toString());
    setEditCat(entry.category);
  };

  // Save Edit
  const saveEdit = (id: string) => {
    const numAmt = parseFloat(editAmt);
    if (!editDesc.trim() || isNaN(numAmt) || numAmt <= 0) return;

    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, description: editDesc.trim(), amount: numAmt, category: editCat }
          : item
      )
    );
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
          <Receipt size={14} /> Daily Ledger Tracker
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Student Expense Planner Demonstration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Log day-to-day outlays into a live session ledger. Verify remaining sample balances, categorise expenses across seven student domains, and immediately notice budget overruns before they escalate.
        </p>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Sample Starting Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sample Starting Allowance</span>
            <Wallet size={16} className="text-cyan-500" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {symbol}{sampleBudget.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Baseline student monthly cap</div>
        </div>

        {/* Total Planned Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Planned Expenses</span>
            <TrendingDown size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 pt-1">
            {symbol}{totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">Sum of {expenses.length} logged items</div>
        </div>

        {/* Remaining Balance */}
        <div className={`p-5 rounded-2xl border space-y-1 shadow-xs ${
          isOverBudget
            ? 'bg-rose-500/10 border-rose-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Remaining Balance</span>
            <Sparkles size={16} className={isOverBudget ? 'text-rose-500' : 'text-emerald-500'} />
          </div>
          <div className={`text-2xl font-black font-mono pt-1 ${
            isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {symbol}{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            {isOverBudget ? '⚠️ Budget Exceeded!' : '✓ Safe Buffer Available'}
          </div>
        </div>
      </div>

      {/* Expense Input Form */}
      <form
        onSubmit={handleAddExpense}
        className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs"
      >
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Plus size={18} className="text-cyan-500" />
          Add Sample Expense Entry
        </h3>

        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
            <AlertCircle size={15} /> {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-hidden"
            />
          </div>

          {/* Category (SRS requirements: Food, Transport, Education, Entertainment, Shopping, Utilities, Miscellaneous) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-hidden"
            >
              <option value="Food">Food (Mess & Snacks)</option>
              <option value="Transport">Transport (Bus & Metro)</option>
              <option value="Education">Education (Books & Fees)</option>
              <option value="Entertainment">Entertainment & Hangouts</option>
              <option value="Shopping">Shopping & Personal Care</option>
              <option value="Utilities">Utilities & Mobile Internet</option>
              <option value="Miscellaneous">Miscellaneous</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Category Input if Other is selected */}
          {category === 'Other' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Gym, Medicine, Gadgets, Laundry..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-hidden"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. University Cafeteria Lunch"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-hidden"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Amount ({symbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 15.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> Add to Session Table
          </button>
        </div>
      </form>

      {/* Expense Session Table (SRS Requirement 1.6.5) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Temporary Session Expense Entries ({expenses.length})
          </h3>
          <span className="text-xs text-slate-400">Data persists within this browser session</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.04] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No expense entries logged yet. Use the form above to add your first expense!
                  </td>
                </tr>
              ) : (
                expenses.map((entry) => {
                  const isEditing = editingId === entry.id;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono">{entry.date}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={editCat}
                            onChange={(e) => setEditCat(e.target.value)}
                            className="px-2 py-1 rounded-md border text-xs bg-white dark:bg-slate-800"
                          >
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Education">Education</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                            {entry.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="px-2 py-1 rounded-md border text-xs w-full bg-white dark:bg-slate-800"
                          />
                        ) : (
                          entry.description
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editAmt}
                            onChange={(e) => setEditAmt(e.target.value)}
                            className="px-2 py-1 rounded-md border text-xs w-20 text-right bg-white dark:bg-slate-800 font-mono"
                          />
                        ) : (
                          `${symbol}${entry.amount.toFixed(2)}`
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(entry.id)}
                              className="p-1 rounded-md bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30"
                              title="Save changes"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500 hover:bg-slate-300"
                              title="Cancel edit"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(entry)}
                              className="text-slate-400 hover:text-cyan-500 p-1 rounded-md transition-colors"
                              title="Edit entry"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleRemove(entry.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                              title="Remove entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {expenses.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 dark:border-white/10 font-bold bg-slate-50 dark:bg-white/[0.03]">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-900 dark:text-white">TOTAL PLANNED OUTLAYS</td>
                  <td className="py-3 px-4 font-mono text-right text-amber-600 dark:text-amber-400">
                    {symbol}{totalPlanned.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
