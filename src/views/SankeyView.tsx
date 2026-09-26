// AuraFinance OS — Sankey Cash Flow Visualization (Custom SVG)
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, convertCurrency } from '../services/fxService';
import { useMemo, useState } from 'react';
import { TrendingUp, ArrowRight, Activity, Sparkles } from 'lucide-react';
import LiveCashFlowStream from '../components/charts/LiveCashFlowStream';

interface FlowNode {
  label: string;
  value: number;
  color: string;
  emoji: string;
  items: { name: string; amount: number }[];
}

export default function SankeyView() {
  const { baseCurrency, fxRates } = useAppStore();
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);

  const data = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const totalIncome = thisMonth
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const buckets: Record<string, { total: number; items: Record<string, number> }> = {
      needs: { total: 0, items: {} },
      wants: { total: 0, items: {} },
      savings: { total: 0, items: {} },
    };

    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      const amt = convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates);
      buckets[t.bucket].total += amt;
      buckets[t.bucket].items[t.category] = (buckets[t.bucket].items[t.category] || 0) + amt;
    });

    return { totalIncome, buckets };
  }, [transactions, baseCurrency, fxRates]);

  const flowNodes: FlowNode[] = [
    {
      label: 'Needs',
      value: data.buckets.needs.total,
      color: '#3b82f6',
      emoji: '🏠',
      items: Object.entries(data.buckets.needs.items).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount),
    },
    {
      label: 'Wants',
      value: data.buckets.wants.total,
      color: '#ec4899',
      emoji: '🎮',
      items: Object.entries(data.buckets.wants.items).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount),
    },
    {
      label: 'Future You',
      value: data.buckets.savings.total,
      color: '#22c55e',
      emoji: '🚀',
      items: Object.entries(data.buckets.savings.items).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount),
    },
  ];

  const totalExpense = flowNodes.reduce((s, n) => s + n.value, 0);

  if (transactions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <TrendingUp size={48} className="mx-auto text-aura-text-muted mb-4 opacity-30" />
          <p className="text-lg text-aura-text-secondary">No cash flow data yet</p>
          <p className="text-sm text-aura-text-muted mt-1">Add transactions to see your money flow</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-aura-text flex items-center gap-2">
          <TrendingUp size={24} className="text-aura-accent" /> Cash Flow Map
        </h1>
        <p className="text-sm text-aura-text-muted mt-1">
          Your 50/30/20 money flow · <span className="text-aura-text-secondary">Needs vs. Wants vs. Future You</span>
        </p>
      </div>

      {/* ─── LIVE AUTONOMOUS CASH-FLOW PARTICLE STREAM (SANKEY-CANVAS DUAL HYBRID) ─── */}
      <div className="mb-8">
        <LiveCashFlowStream />
      </div>

      {/* Visual 50/30/20 Breakdown Map */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Income Source */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-aura-green/20 to-aura-green/5 border border-aura-green/30 flex flex-col items-center justify-center mb-2"
              style={{ boxShadow: '0 0 30px rgba(34,197,94,0.15)' }}
            >
              <span className="text-3xl mb-1">💰</span>
              <span className="text-xs text-aura-text-muted font-semibold uppercase tracking-wider">Income</span>
              <span className="text-lg font-bold text-aura-green font-mono mt-1">
                {formatCurrency(data.totalIncome, baseCurrency)}
              </span>
            </div>
          </motion.div>

          {/* Flow Arrows */}
          <div className="flex flex-col gap-6 py-4">
            {flowNodes.map((node, i) => {
              const pct = totalExpense > 0 ? ((node.value / totalExpense) * 100).toFixed(0) : '0';
              const idealPct = i === 0 ? 50 : i === 1 ? 30 : 20;
              const actualPct = totalExpense > 0 ? (node.value / totalExpense) * 100 : 0;
              const diff = actualPct - idealPct;

              return (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="flex items-center gap-4"
                >
                  {/* Flow line */}
                  <div className="relative w-24 hidden sm:block">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                      className="h-1 rounded-full"
                      style={{ backgroundColor: node.color, opacity: 0.6 }}
                    />
                    <ArrowRight
                      size={16}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                      style={{ color: node.color }}
                    />
                  </div>

                  {/* Bucket */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setExpandedBucket(expandedBucket === node.label ? null : node.label)}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border transition-all cursor-pointer min-w-[240px]"
                    style={{
                      borderColor: `${node.color}33`,
                      backgroundColor: `${node.color}0d`,
                      boxShadow: expandedBucket === node.label ? `0 0 20px ${node.color}20` : 'none',
                    }}
                  >
                    <span className="text-2xl">{node.emoji}</span>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-aura-text">{node.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${node.color}20`, color: node.color }}>
                          {pct}%
                        </span>
                      </div>
                      <span className="text-base font-bold font-mono" style={{ color: node.color }}>
                        {formatCurrency(node.value, baseCurrency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-mono ${diff > 5 ? 'text-aura-red' : diff < -5 ? 'text-aura-green' : 'text-aura-text-muted'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                      </span>
                      <p className="text-[10px] text-aura-text-muted">vs {idealPct}% ideal</p>
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Bucket Details */}
      {expandedBucket && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10 }}
          className="glass-card p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-aura-text mb-4">
            {flowNodes.find(n => n.label === expandedBucket)?.emoji} {expandedBucket} Breakdown
          </h3>
          <div className="space-y-2">
            {flowNodes.find(n => n.label === expandedBucket)?.items.map((item, i) => {
              const bucketTotal = flowNodes.find(n => n.label === expandedBucket)?.value || 1;
              const pct = (item.amount / bucketTotal) * 100;
              const color = flowNodes.find(n => n.label === expandedBucket)?.color || '#7c5cfc';
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm text-aura-text-secondary w-32 truncate">{item.name}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full rounded-lg"
                      style={{ backgroundColor: `${color}40` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-mono text-aura-text">
                      {formatCurrency(item.amount, baseCurrency)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Ideal vs Actual Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {flowNodes.map((node, i) => {
          const idealPct = i === 0 ? 50 : i === 1 ? 30 : 20;
          const idealAmount = data.totalIncome * (idealPct / 100);
          const diff = node.value - idealAmount;

          return (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{node.emoji}</span>
                <span className="text-sm font-semibold text-aura-text">{node.label}</span>
                <span className="text-xs text-aura-text-muted ml-auto">Target: {idealPct}%</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <p className="text-xs text-aura-text-muted mb-1">Actual</p>
                  <p className="text-lg font-bold font-mono" style={{ color: node.color }}>
                    {formatCurrency(node.value, baseCurrency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-aura-text-muted mb-1">Ideal</p>
                  <p className="text-sm font-mono text-aura-text-secondary">
                    {formatCurrency(idealAmount, baseCurrency)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  diff > 0 ? 'bg-aura-red-soft text-aura-red' : 'bg-aura-green-soft text-aura-green'
                }`}>
                  {diff > 0 ? '+' : ''}{formatCurrency(Math.abs(diff), baseCurrency)} {diff > 0 ? 'over' : 'under'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
