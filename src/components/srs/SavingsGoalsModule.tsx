// BudgetBasics — Savings Goals Module & Timeline Estimator
// Complies with TechWiz 7 SRS Section 1.6.4:
// - Enter goal name, target amount, current savings, expected monthly contribution
// - Calculates remaining amount and estimated months required to achieve goal
// - Displays a progress bar and an encouraging savings tip
// - Validates empty, negative, or non-numeric values
// - Clear input labels and helpful placeholders

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  PiggyBank,
  Calendar,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  category: string;
}

const DEFAULT_GOALS: SavingsGoal[] = [
  {
    id: 'g-1',
    name: 'Emergency Buffer Cash Fund',
    targetAmount: 500,
    currentSavings: 200,
    monthlyContribution: 50,
    category: 'Safety Net',
  },
  {
    id: 'g-2',
    name: 'Coding Laptop Upgrade (M3 / RTX)',
    targetAmount: 1200,
    currentSavings: 450,
    monthlyContribution: 100,
    category: 'Education Hardware',
  },
  {
    id: 'g-3',
    name: 'Semester Books & Certification Exam',
    targetAmount: 300,
    currentSavings: 180,
    monthlyContribution: 40,
    category: 'Certifications',
  },
];

export default function SavingsGoalsModule() {
  const { baseCurrency } = useAppStore();
  const symbol = baseCurrency === 'PKR' ? '₨' : baseCurrency === 'EUR' ? '€' : baseCurrency === 'GBP' ? '£' : '$';

  // State
  const [goals, setGoals] = useState<SavingsGoal[]>(DEFAULT_GOALS);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [contribution, setContribution] = useState('');
  const [category, setCategory] = useState('General');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handlers
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations (SRS 1.6.4: Validate empty, negative, or non-numeric values)
    if (!name.trim()) {
      setErrorMsg('Goal Name is required.');
      return;
    }
    const numTarget = parseFloat(target);
    const numCurrent = parseFloat(current || '0');
    const numMonthly = parseFloat(contribution);

    if (isNaN(numTarget) || numTarget <= 0) {
      setErrorMsg('Target Amount must be a valid positive number greater than 0.');
      return;
    }
    if (isNaN(numCurrent) || numCurrent < 0) {
      setErrorMsg('Current Savings cannot be negative.');
      return;
    }
    if (isNaN(numMonthly) || numMonthly <= 0) {
      setErrorMsg('Expected Monthly Contribution must be greater than 0.');
      return;
    }

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name: name.trim(),
      targetAmount: numTarget,
      currentSavings: numCurrent,
      monthlyContribution: numMonthly,
      category,
    };

    setGoals((prev) => [newGoal, ...prev]);
    setName('');
    setTarget('');
    setCurrent('');
    setContribution('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Target size={14} /> SRS Requirement 1.6.4
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Savings Goals & Timeline Estimator
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Define your financial goals, track current progress, and compute exactly how many months it will take to reach 100% completion based on your monthly contribution.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} /> {isAdding ? 'Close Form' : 'New Savings Goal'}
          </button>
        </div>
      </div>

      {/* Add New Goal Form Modal / Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddGoal}
            className="rounded-2xl bg-white dark:bg-slate-900/90 border border-emerald-500/30 p-6 space-y-4 shadow-sm"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-500" />
              Create a Student Savings Goal
            </h3>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                <AlertTriangle size={15} /> {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Goal Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Goal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Coding Laptop or Emergency Buffer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Amount ({symbol}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                />
              </div>

              {/* Current Savings */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Savings ({symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                />
              </div>

              {/* Expected Monthly Contribution */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Monthly Contribution ({symbol}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                >
                  <option value="Safety Net">Safety Net</option>
                  <option value="Education Hardware">Education Hardware</option>
                  <option value="Certifications">Certifications</option>
                  <option value="Travel & Break">Travel & Break</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-sm"
              >
                Save Goal & Calculate
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const remaining = Math.max(0, goal.targetAmount - goal.currentSavings);
          const progressPct = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100));
          const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : 0;
          const isCompleted = goal.currentSavings >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-4 shadow-xs relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10">
                    {goal.category}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1.5 leading-snug">
                    {goal.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                  title="Remove goal"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Numbers Overview */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Saved so far</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {symbol}{goal.currentSavings.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Target Amount</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {symbol}{goal.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">{progressPct}% Achieved</span>
                  <span className="text-slate-500">{symbol}{remaining.toLocaleString()} Remaining</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${progressPct}%` }}
                    className={`h-full transition-all duration-700 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                    }`}
                  />
                </div>
              </div>

              {/* Estimated Months & Monthly Rate */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-amber-500 shrink-0" />
                  <span>
                    {isCompleted ? (
                      <strong className="text-emerald-600 dark:text-emerald-400">Goal Reached! 🎉</strong>
                    ) : (
                      <>
                        Est. <strong className="font-mono font-bold text-slate-900 dark:text-white">{monthsLeft}</strong> months left
                      </>
                    )}
                  </span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">
                  @{symbol}{goal.monthlyContribution}/mo
                </span>
              </div>

              {/* Encouraging Savings Tip (SRS requirement) */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 flex items-start gap-1.5">
                <Sparkles size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  {isCompleted
                    ? 'Incredible dedication! You have successfully funded this goal.'
                    : monthsLeft <= 3
                    ? 'Almost there! Just a couple more deposits to victory.'
                    : 'Tip: Skip one fast-food meal a week to shorten this timeline by 2 whole months!'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
