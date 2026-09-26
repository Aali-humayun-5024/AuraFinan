// AuraFinance OS — Goals View with Progress Rings
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../services/fxService';
import FinancialMetric from '../components/common/FinancialMetric';
import { Plus, Target, Trophy, Clock, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCoherentFinancialState } from '../context/FinancialStateContext';
import { ShieldCheck, Wallet, Coins } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

function ProgressRing({ percent, size = 80, strokeWidth = 6 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none"
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="url(#progressGrad)" strokeWidth={strokeWidth} fill="none"
        strokeLinecap="round"
        className="progress-ring-circle"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        strokeDasharray={circumference}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c5cfc" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function GoalsView() {
  const { baseCurrency } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();
  const goals = useLiveQuery(() => db.goals.toArray()) || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', deadline: '', icon: '🎯' });

  // Dedicated savings balances strictly bound to ledger accounts 3020 Retained Earnings and 1060 Bullion Reserve
  const retainedEarnings = coherentState?.ledger?.accountBalances?.['3020'] ?? 0;
  const bullionReserve = coherentState?.commodities?.totalBullionValue ?? (coherentState?.ledger?.accountBalances?.['1060'] ?? 0);
  const monthlySavingsBucket = coherentState?.buckets?.savingsTotal ?? 0;
  const liquidCashAvailable = coherentState?.liquidity?.liquidCash ?? 0;
  const totalLedgerSavingsReserve = Math.round((retainedEarnings + bullionReserve + monthlySavingsBucket) * 100) / 100;

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    await db.goals.add({
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      category: 'Custom',
      icon: newGoal.icon,
    });
    setNewGoal({ title: '', targetAmount: '', deadline: '', icon: '🎯' });
    setShowAdd(false);
  };

  const handleDelete = async (id: number) => {
    await db.goals.delete(id);
  };

  const handleAddFunds = async (id: number, amount: number) => {
    const goal = await db.goals.get(id);
    if (goal) {
      await db.goals.update(id, { currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) });
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-aura-text flex items-center gap-2">
            <Target size={24} className="text-aura-accent" /> Financial Goals & Asset Accumulation
          </h1>
          <p className="text-sm text-aura-text-muted mt-1">Track life milestones bound to dedicated ledger savings reserves</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-aura-accent to-purple-500 text-white text-sm font-semibold"
          style={{ boxShadow: '0 4px 20px rgba(124,92,252,0.3)' }}
        >
          <Plus size={16} /> New Goal
        </motion.button>
      </div>

      {/* Dedicated Ledger Savings Ledger Strip (Account 3020 & 1060 Synchronization) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">3020 Retained Earnings + Savings</p>
            <p className="text-sm font-bold text-white tabular-nums">
              {formatCurrency(retainedEarnings + monthlySavingsBucket, baseCurrency)}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Coins size={18} />
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">1060 Bullion Reserve</p>
            <p className="text-sm font-bold text-white tabular-nums">
              {formatCurrency(bullionReserve, baseCurrency)}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Liquid Cash Backing (1010+1020)</p>
            <p className="text-sm font-bold text-white tabular-nums">
              {formatCurrency(liquidCashAvailable, baseCurrency)}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-6">
            <ProgressRing percent={overallPct} size={100} strokeWidth={8} />
            <div>
              <h3 className="text-lg font-bold text-aura-text mb-1">Overall Goal Milestones</h3>
              <div className="flex items-baseline flex-wrap gap-1.5 text-sm text-aura-text-secondary">
                <FinancialMetric value={totalSaved} currency={baseCurrency} size="sm" color="text-emerald-400 font-bold" />
                <span className="text-aura-text-muted">saved of</span>
                <FinancialMetric value={totalTarget} currency={baseCurrency} size="sm" color="text-aura-text font-bold" />
                <span className="text-aura-text-muted">total target</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-aura-text-muted">
                  <Trophy size={12} className="text-aura-amber" /> {goals.filter(g => g.currentAmount >= g.targetAmount).length} completed
                </span>
                <span className="flex items-center gap-1.5 text-xs text-aura-text-muted">
                  <Clock size={12} className="text-aura-cyan" /> {goals.filter(g => g.currentAmount < g.targetAmount).length} in progress
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Goal Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-aura-text mb-4">Create New Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Goal title (e.g., New Laptop)"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text placeholder:text-aura-text-muted focus:outline-none focus:border-aura-accent"
            />
            <input
              type="number"
              placeholder="Target amount"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text placeholder:text-aura-text-muted focus:outline-none focus:border-aura-accent"
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text focus:outline-none focus:border-aura-accent"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddGoal}
              className="px-4 py-2.5 rounded-xl bg-aura-accent text-white text-sm font-semibold"
            >
              <Sparkles size={14} className="inline mr-1" /> Create
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {goals.map((goal) => {
          const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = pct >= 100;
          const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000));

          return (
            <motion.div
              key={goal.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`glass-card p-5 relative group ${isComplete ? 'border-aura-green/30' : ''}`}
            >
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-aura-green-soft flex items-center justify-center"
                >
                  <Trophy size={16} className="text-aura-green" />
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => goal.id && handleDelete(goal.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-aura-red-soft text-aura-red flex items-center justify-center transition-opacity"
                style={{ display: isComplete ? 'none' : undefined }}
              >
                <Trash2 size={12} />
              </motion.button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{goal.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-aura-text">{goal.title}</h3>
                  <p className="text-xs text-aura-text-muted">{goal.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <ProgressRing percent={pct} size={90} strokeWidth={7} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-aura-text font-mono">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <FinancialMetric
                  value={goal.currentAmount}
                  currency={baseCurrency}
                  size="md"
                  color="text-aura-text font-bold"
                  align="left"
                />
                <div className="flex items-baseline gap-1 text-xs text-aura-text-muted">
                  <span>of</span>
                  <FinancialMetric
                    value={goal.targetAmount}
                    currency={baseCurrency}
                    size="xs"
                    color="text-aura-text-secondary font-semibold"
                    align="right"
                  />
                </div>
              </div>

              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full ${isComplete ? 'bg-aura-green' : 'bg-gradient-to-r from-aura-accent to-purple-400'}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-aura-text-muted flex items-center gap-1">
                  <Clock size={11} /> {daysLeft} days left
                </span>
                {!isComplete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goal.id && handleAddFunds(goal.id, goal.targetAmount * 0.1)}
                    className="text-xs px-3 py-1 rounded-lg bg-aura-accent/15 text-aura-accent font-semibold hover:bg-aura-accent/25 transition-colors"
                  >
                    + Add Funds
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <Target size={48} className="mx-auto text-aura-text-muted mb-4 opacity-30" />
          <p className="text-lg text-aura-text-secondary mb-2">No goals yet</p>
          <p className="text-sm text-aura-text-muted">Set your first financial goal and start building toward it!</p>
        </div>
      )}
    </motion.div>
  );
}
