// AuraFinance OS — Dedicated Precious Metals Bento Plate (Gold, Silver, Platinum)
// Interactive Tola / Gram / Troy Ounce unit switcher & zero-discrepancy spot valuation

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  Trash2,
  RefreshCw,
  Coins,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useCommodities } from '../../hooks/useCommodities';
import { useAppStore } from '../../store/useAppStore';
import { PrecisionMath, TOLA_IN_GRAMS, TROY_OUNCE_IN_GRAMS } from '../../utils/financialMath';
import { formatCurrency } from '../../services/fxService';
import { ReconciledValueDisplay } from '../common/ReconciledValueDisplay';
import { AddCommodityModal } from '../modals/AddCommodityModal';
import { playClickSound, playCoinSound } from '../../services/soundService';
import type { WeightUnit, PreciousMetalType } from '../../types/commodities';
import { useCoherentFinancialState } from '../../context/FinancialStateContext';

export const PreciousMetalsCard: React.FC = () => {
  const { baseCurrency } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();
  const { commodities: coherentCommodities, ledgerBalances } = coherentState;
  const {
    marketRates,
    holdings,
    summary,
    removeCommodityHolding,
    refreshRates,
  } = useCommodities();

  const [activeUnit, setActiveUnit] = useState<WeightUnit>('tola');
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    playClickSound();
    await refreshRates();
    setIsRefreshing(false);
  };

  // Convert raw grams into active display unit (Grams / Troy Oz / Tola)
  const formatWeight = (grams: number, targetUnit: WeightUnit): { value: string; unitLabel: string } => {
    const val = PrecisionMath.fromGrams(grams, targetUnit);
    let unitLabel = 'g';
    if (targetUnit === 'tola') unitLabel = 'Tola';
    else if (targetUnit === 'troy_ounce') unitLabel = 'oz t';
    else if (targetUnit === 'kilograms') unitLabel = 'kg';

    return {
      value: val.toFixed(targetUnit === 'grams' ? 2 : 3),
      unitLabel,
    };
  };

  // Total weight of gold in active unit
  const goldWeightActive = useMemo(() => {
    return formatWeight(summary.gold.grams, activeUnit);
  }, [summary.gold.grams, activeUnit]);

  // Total weight of silver in active unit
  const silverWeightActive = useMemo(() => {
    return formatWeight(summary.silver.grams, activeUnit);
  }, [summary.silver.grams, activeUnit]);

  return (
    <>
      <div className="relative rounded-3xl bg-aura-card border border-aura-border-bright p-5 md:p-6 shadow-xl backdrop-blur-2xl overflow-hidden group">
        {/* Ambient Shimmers: Gold (#F59E0B) and Silver (#94A3B8) highlights */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 rounded-full opacity-20 pointer-events-none blur-3xl transition-opacity group-hover:opacity-30"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full opacity-15 pointer-events-none blur-3xl transition-opacity group-hover:opacity-25"
          style={{ background: 'radial-gradient(circle, #94A3B8 0%, transparent 70%)' }}
        />

        {/* ─── Top Row: Real-Time Spot Ticker ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-aura-border/60 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-aura-text">Commodities & Bullion Vault</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                  Account 1060
                </span>
              </div>
              <p className="text-[11px] text-aura-text-muted">
                Precious metals live spot pricing • Zero-discrepancy conversion
              </p>
            </div>
          </div>

          {/* Spot Ticker & Valuation Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Gold Valuation Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold text-aura-text-secondary">Gold:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {formatCurrency(coherentCommodities.totalGoldValue, baseCurrency)}
              </span>
            </div>

            {/* Silver Valuation Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-400/10 border border-slate-400/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="font-semibold text-aura-text-secondary">Silver:</span>
              <span className="font-mono font-bold text-slate-300 tabular-nums">
                {formatCurrency(coherentCommodities.totalSilverValue, baseCurrency)}
              </span>
            </div>

            {/* Platinum Valuation Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-300" />
              <span className="font-semibold text-aura-text-secondary">Pt:</span>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {formatCurrency(coherentCommodities.totalPlatinumValue, baseCurrency)}
              </span>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-aura-text-muted hover:text-aura-text transition-colors cursor-pointer"
              title="Refresh spot market rates"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ─── Center Hero Metric & Unit Switcher ─── */}
        <div className="py-5 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
          <div>
            <ReconciledValueDisplay
              value={coherentCommodities.totalPreciousMetalsValue}
              currency={baseCurrency}
              decimals={2}
              label={`Total Precious Metals (Account 1060: ${formatCurrency(ledgerBalances.accountBalances['1060'] || coherentCommodities.totalPreciousMetalsValue, baseCurrency)})`}
              size="lg"
            />
            {summary.netUnrealizedGainLoss !== 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-mono font-semibold">
                <span className="text-aura-text-muted">Unrealized P&L:</span>
                <span
                  className={`flex items-center gap-0.5 ${
                    summary.netUnrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {summary.netUnrealizedGainLoss >= 0 ? (
                    <TrendingUp size={13} />
                  ) : (
                    <TrendingDown size={13} />
                  )}
                  {summary.netUnrealizedGainLoss >= 0 ? '+' : ''}
                  {formatCurrency(summary.netUnrealizedGainLoss, baseCurrency)} ({summary.netGainLossPct >= 0 ? '+' : ''}
                  {summary.netGainLossPct}%)
                </span>
              </div>
            )}
          </div>

          {/* Interactive Unit Toggle Pill [Grams] | [Troy Oz] | [Tola] */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-aura-text-muted">
              Display Weight Standard
            </span>
            <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-aura-border">
              {[
                { id: 'grams' as const, label: 'Grams (g)' },
                { id: 'troy_ounce' as const, label: 'Troy Oz (oz t)' },
                { id: 'tola' as const, label: 'Tola (11.66g)' },
              ].map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    playClickSound();
                    setActiveUnit(u.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeUnit === u.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                      : 'text-aura-text-muted hover:text-aura-text'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>

            {/* Quick aggregate weight pills */}
            <div className="flex items-center gap-2 text-xs font-mono text-aura-text-secondary mt-1">
              <span className="flex items-center gap-1">
                🟡 <strong className="text-aura-text tabular-nums">{goldWeightActive.value}</strong>{' '}
                {goldWeightActive.unitLabel} Gold
              </span>
              <span className="text-aura-text-muted">•</span>
              <span className="flex items-center gap-1">
                ⚪ <strong className="text-aura-text tabular-nums">{silverWeightActive.value}</strong>{' '}
                {silverWeightActive.unitLabel} Silver
              </span>
            </div>
          </div>
        </div>

        {/* ─── Holdings Breakdown List ─── */}
        <div className="mt-2 space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs text-aura-text-muted pb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Allocated Bullion Assets ({holdings.length})
            </span>
            <button
              onClick={() => {
                playClickSound();
                setModalOpen(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={13} />
              <span>Log Bullion</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
            {holdings.map((h) => {
              const displayWeight = formatWeight(h.weightInGrams, activeUnit);
              const metalColors = {
                gold: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
                silver: 'border-slate-400/30 bg-slate-400/5 text-slate-300',
                platinum: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
              };

              return (
                <div
                  key={h.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-aura-border hover:border-aura-accent/30 transition-all flex items-center justify-between group/item"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {h.metal === 'gold' ? '🟡' : h.metal === 'silver' ? '⚪' : '🔘'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-aura-text capitalize">
                          {h.metal} {h.purity.toUpperCase()}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            metalColors[h.metal]
                          }`}
                        >
                          {h.purity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-aura-text-muted">
                        <span className="font-semibold text-aura-text tabular-nums">
                          {displayWeight.value}
                        </span>{' '}
                        {displayWeight.unitLabel} • Spot {formatCurrency(h.currentSpotPricePerGram, baseCurrency)}/g
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-end">
                    <div>
                      <p className="text-xs font-bold font-mono text-aura-text tabular-nums">
                        {formatCurrency(h.currentValueBaseCurrency, baseCurrency)}
                      </p>
                      <p
                        className={`text-[10px] font-mono font-semibold tabular-nums ${
                          h.unrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {h.unrealizedGainLoss >= 0 ? '+' : ''}
                        {formatCurrency(h.unrealizedGainLoss, baseCurrency)} (
                        {h.unrealizedGainLossPercentage >= 0 ? '+' : ''}
                        {h.unrealizedGainLossPercentage}%)
                      </p>
                    </div>

                    <button
                      onClick={() => h.id && removeCommodityHolding(h.id)}
                      className="opacity-0 group-hover/item:opacity-100 p-1 rounded-lg text-aura-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Remove holding"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Commodity Modal */}
      <AddCommodityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default PreciousMetalsCard;
