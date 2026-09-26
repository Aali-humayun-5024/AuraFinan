// AuraFinance OS — 50/30/20 Budget Allocation Engine UI Component
// Visualizes Needs (50%), Wants (30%), Savings (20%) with dynamic variances and alerts

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Shield, TrendingUp, Sparkles, PieChart } from 'lucide-react';
import type { Budget503020Result } from '../../services/budgetEngine';
import FinancialMetric from '../common/FinancialMetric';
import type { CurrencyCode } from '../../services/fxService';
import { useTranslation } from '../../i18n/useTranslation';

interface BudgetAllocationEngineProps {
  budget: Budget503020Result;
  currency: CurrencyCode | string;
}

export default function BudgetAllocationEngine({ budget, currency }: BudgetAllocationEngineProps) {
  const { t } = useTranslation();
  const {
    needsAmount,
    wantsAmount,
    savingsAmount,
    needsPct,
    wantsPct,
    savingsPct,
    targetNeedsAmount,
    targetWantsAmount,
    targetSavingsAmount,
    isWantsOverBudget,
    wantsOverrunAmount,
    healthGrade,
    alertMessage,
    recommendations,
  } = budget;

  return (
    <div className="glass-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <PieChart size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-aura-text text-sm md:text-base">
                {t.kpiCards.capitalEquilibrium}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  healthGrade === 'A+' || healthGrade === 'A'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : healthGrade === 'B'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                Grade {healthGrade}
              </span>
            </div>
            <p className="text-xs text-aura-text-muted">
              Golden Ratio: 50% Needs · 30% Wants · 20% Wealth & Savings
            </p>
          </div>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isWantsOverBudget ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Wants Exceeded by {wantsPct > 30 ? (wantsPct - 30).toFixed(1) : 0}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Disciplined Ratio On Track</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Alert Bar if Wants > 30% */}
      {isWantsOverBudget && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-aura-card to-rose-950/20 border border-rose-500/30 flex items-start gap-3"
        >
          <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-rose-300">{t.kpiCards.wantsAlertMessage}</p>
            <p className="text-aura-text-muted mt-1">
              Overrun Amount:{' '}
              <strong className="text-rose-400">
                <FinancialMetric value={wantsOverrunAmount} currency={currency} size="xs" color="text-rose-400 font-bold" />
              </strong>
            </p>
          </div>
        </motion.div>
      )}

      {/* 3 Interactive Ratio Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Needs (50%) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-aura-border hover:border-cyan-500/30 transition-all text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-aura-text flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              {t.kpiCards.needsLabel}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {needsPct.toFixed(1)}%
            </span>
          </div>

          <div className="my-2">
            <FinancialMetric
              value={needsAmount}
              currency={currency}
              size="md"
              color="text-aura-text font-bold"
              align="left"
            />
          </div>

          {/* Progress track with target notch */}
          <div className="relative w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, needsPct)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${needsPct > 55 ? 'bg-amber-400' : 'bg-cyan-400'}`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-aura-text-muted mt-1.5 font-mono">
            <span>Target: 50%</span>
            <span>
              Target:{' '}
              <FinancialMetric value={targetNeedsAmount} currency={currency} size="xs" color="text-aura-text-muted" />
            </span>
          </div>
        </div>

        {/* 2. Wants (30%) */}
        <div className={`p-3.5 rounded-2xl bg-white/[0.02] border transition-all text-left ${
          isWantsOverBudget ? 'border-rose-500/40 bg-rose-500/[0.02]' : 'border-aura-border hover:border-purple-500/30'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-aura-text flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${isWantsOverBudget ? 'bg-rose-400 animate-pulse' : 'bg-purple-400'}`} />
              {t.kpiCards.wantsLabel}
            </span>
            <span className={`text-xs font-mono font-bold tabular-nums ${isWantsOverBudget ? 'text-rose-400' : 'text-purple-400'}`}>
              {wantsPct.toFixed(1)}%
            </span>
          </div>

          <div className="my-2">
            <FinancialMetric
              value={wantsAmount}
              currency={currency}
              size="md"
              color={isWantsOverBudget ? 'text-rose-400 font-bold' : 'text-aura-text font-bold'}
              align="left"
            />
          </div>

          <div className="relative w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, wantsPct)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${isWantsOverBudget ? 'bg-rose-500' : 'bg-purple-400'}`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-aura-text-muted mt-1.5 font-mono">
            <span>Target: Max 30%</span>
            <span>
              Target:{' '}
              <FinancialMetric value={targetWantsAmount} currency={currency} size="xs" color="text-aura-text-muted" />
            </span>
          </div>
        </div>

        {/* 3. Savings (20%) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-aura-border hover:border-emerald-500/30 transition-all text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-aura-text flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              {t.kpiCards.savingsLabel}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
              {savingsPct.toFixed(1)}%
            </span>
          </div>

          <div className="my-2">
            <FinancialMetric
              value={savingsAmount}
              currency={currency}
              size="md"
              color="text-emerald-400 font-bold"
              symbolColor="text-emerald-400/80"
              fractionColor="text-emerald-400/80"
              align="left"
            />
          </div>

          <div className="relative w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, savingsPct)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-emerald-400"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-aura-text-muted mt-1.5 font-mono">
            <span>Target: Min 20%</span>
            <span>
              Target:{' '}
              <FinancialMetric value={targetSavingsAmount} currency={currency} size="xs" color="text-aura-text-muted" />
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Recommendation */}
      {recommendations.length > 0 && (
        <div className="pt-2 border-t border-aura-border flex items-center gap-2 text-xs text-aura-text-secondary">
          <Sparkles size={14} className="text-aura-accent shrink-0" />
          <span>{recommendations[0]}</span>
        </div>
      )}
    </div>
  );
}
