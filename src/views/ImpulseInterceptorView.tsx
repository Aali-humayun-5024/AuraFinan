// AuraFinance OS — Impulse Buy Interceptor Sandbox
// Converts prospective purchases into Hours of Labor Required and Days Delayed on Primary Goal
// Dynamic slider evaluated against live remaining 30% Wants budget
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { useCoherentFinancialState } from '../context/FinancialStateContext';
import { createCoherentTransaction } from '../services/transactionLedgerSync';
import { formatCurrency } from '../services/fxService';
import { playClickSound, playSuccessSound, playCoinSound } from '../services/soundService';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Clock,
  Target,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  TrendingDown,
  Zap,
  Lock,
  Check,
} from 'lucide-react';
import FinancialMetric from '../components/common/FinancialMetric';

export default function ImpulseInterceptorView() {
  const { baseCurrency, fxRates, activeProfileId } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();

  const settings = useLiveQuery(() => db.settings.toArray()) || [];
  const goals = useLiveQuery(() => db.goals.toArray()) || [];

  // Sandbox Input State
  const defaultPrice = baseCurrency === 'PKR' ? 35000 : 250;
  const [itemName, setItemName] = useState('AirPods Pro / Designer Sneakers');
  const [itemPrice, setItemPrice] = useState<number>(defaultPrice);
  const [category, setCategory] = useState('Electronics & Gadgets');

  // Outcome Feedback State
  const [walkedAway, setWalkedAway] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [karmaStreak, setKarmaStreak] = useState(150);

  // Remaining Wants Budget from SSOT
  const remainingWantsBudget = coherentState.buckets.remainingWantsBudget;
  const isBudgetBreached = itemPrice > remainingWantsBudget;
  const breachAmount = Math.max(0, itemPrice - remainingWantsBudget);

  // Compute User's Monthly Income & Hourly Wage
  const monthlyIncome = useMemo(() => {
    const settingsIncome = settings[0]?.monthlyIncomeTarget;
    if (settingsIncome && settingsIncome > 0) return settingsIncome;
    return coherentState.liquidity.totalInflows > 0
      ? coherentState.liquidity.totalInflows
      : baseCurrency === 'PKR' ? 180000 : 4500;
  }, [settings, coherentState.liquidity.totalInflows, baseCurrency]);

  // Hourly wage (standard 160 working hours / month)
  const hourlyWage = useMemo(() => {
    return Math.max(1, monthlyIncome / 160);
  }, [monthlyIncome]);

  // Daily savings capacity (assuming ~20% of daily income)
  const dailySavingsRate = useMemo(() => {
    const dailyIncome = monthlyIncome / 30;
    return Math.max(1, dailyIncome * 0.2);
  }, [monthlyIncome]);

  // 1. Hours of Labor Required
  const hoursOfLabor = useMemo(() => {
    if (hourlyWage <= 0) return 0;
    return Math.round((itemPrice / hourlyWage) * 10) / 10;
  }, [itemPrice, hourlyWage]);

  // 2. Primary Goal & Days Delayed
  const primaryGoal = useMemo(() => {
    return (
      goals[0] || {
        title: 'Emergency Runway & Wealth Fund',
        targetAmount: baseCurrency === 'PKR' ? 500000 : 5000,
        currentAmount: baseCurrency === 'PKR' ? 220000 : 2400,
      }
    );
  }, [goals, baseCurrency]);

  const daysDelayed = useMemo(() => {
    if (dailySavingsRate <= 0) return 0;
    return Math.max(1, Math.round(itemPrice / dailySavingsRate));
  }, [itemPrice, dailySavingsRate]);

  // 3. Karma Walk-Away Action (+50 Karma Points)
  const handleWalkAway = async () => {
    playSuccessSound();
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#10b981', '#06b6d4', '#7c5cfc'],
    });

    setKarmaStreak((prev) => prev + 50);
    setWalkedAway(true);

    await db.auditLogs.add({
      timestamp: new Date().toISOString(),
      action: 'IMPULSE_DEFLECTED',
      details: `Walked away from "${itemName}" (${itemPrice} ${baseCurrency}). Earned +50 Karma Points & saved ${hoursOfLabor} hrs of labor!`,
      aiGenerated: false,
    });

    setTimeout(() => {
      setWalkedAway(false);
    }, 4000);
  };

  // 4. Proceed with Purchase Action (GAAP Synchronized Dual-Store Write)
  const handleProceed = async () => {
    playClickSound();
    setPurchased(true);

    try {
      await createCoherentTransaction(
        {
          title: itemName,
          amount: itemPrice,
          originalCurrency: baseCurrency,
          type: 'expense',
          bucket: 'wants',
          category,
          merchant: 'Impulse Store',
          date: new Date().toISOString().split('T')[0],
          tags: ['impulse-sandbox', 'conscious-spend'],
          profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
        },
        fxRates
      );

      await db.auditLogs.add({
        timestamp: new Date().toISOString(),
        action: 'IMPULSE_EXECUTED',
        details: `Consciously purchased "${itemName}" for ${itemPrice} ${baseCurrency} after labor-cost evaluation.`,
        aiGenerated: false,
      });
    } catch (err) {
      console.error('Error posting impulse transaction:', err);
    }

    setTimeout(() => {
      setPurchased(false);
    }, 3500);
  };

  const sliderMax = Math.max(
    baseCurrency === 'PKR' ? 200000 : 2000,
    Math.round(remainingWantsBudget * 2.5) || 5000
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <ShieldAlert size={22} />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Impulse Buy Interceptor</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate prospective purchases against your live 30% Wants budget before spending. Trade money for life energy.
          </p>
        </div>

        {/* Karma Points Counter */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <Award size={18} className="text-emerald-500" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Discipline Karma</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">{karmaStreak} pts</p>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prospective Purchase Input (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-6 bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border rounded-3xl space-y-5 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag size={18} className="text-cyan-500" />
              Item Under Consideration
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live 50/30/20 Link</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Item Name / Urge</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-aura-border text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Dynamic Price Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Purchase Price</label>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {formatCurrency(itemPrice, baseCurrency)}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={sliderMax}
                step={baseCurrency === 'PKR' ? 250 : 5}
                value={itemPrice}
                onChange={(e) => setItemPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full accent-cyan-500 cursor-pointer mb-2"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{formatCurrency(1, baseCurrency)}</span>
                <span>Max: {formatCurrency(sliderMax, baseCurrency)}</span>
              </div>

              {/* Live Mathematical Budget Alert Indicator */}
              <div className="mt-3">
                {!isBudgetBreached ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Safe to purchase within 30% Wants limit ({formatCurrency(remainingWantsBudget, baseCurrency)} remaining).</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <Lock size={16} className="text-rose-500 shrink-0" />
                    <span>Breaches Wants Budget by {formatCurrency(breachAmount, baseCurrency)}! Requires a 48-Hour Cooling Off Lock.</span>
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-3">
                {[
                  { label: 'Coffee / Snack', val: baseCurrency === 'PKR' ? 1200 : 15 },
                  { label: 'Fancy Dinner', val: baseCurrency === 'PKR' ? 6500 : 75 },
                  { label: 'Sneakers / Watch', val: baseCurrency === 'PKR' ? 35000 : 220 },
                  { label: 'Flagship Phone', val: baseCurrency === 'PKR' ? 250000 : 999 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setItemName(preset.label);
                      setItemPrice(preset.val);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-aura-border text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                <option value="Apparel & Footwear">Apparel & Footwear</option>
                <option value="Dining Out & Delivery">Dining Out & Delivery</option>
                <option value="Gaming & Subscriptions">Gaming & Subscriptions</option>
                <option value="Travel & Luxury">Travel & Luxury</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            💡 <strong>The 72-Hour Rule:</strong> Impulse dopamine spikes fade after 72 hours. Test your purchase
            psychology below before tapping checkout.
          </div>
        </div>

        {/* Right Column: Mathematical Impact Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Real-time Labor & Goal Impact Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: Hours of Labor Required */}
            <div className="glass-card p-5 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-3xl relative overflow-hidden shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Clock size={20} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Life Energy
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hours of Labor Required</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {hoursOfLabor}
                </span>
                <span className="text-xs font-bold text-rose-500">hours of work</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-snug">
                Based on your effective hourly wage of{' '}
                <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(hourlyWage, baseCurrency)}/hr</strong>.
              </p>
            </div>

            {/* Metric 2: Days Delayed on Primary Goal */}
            <div className="glass-card p-5 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-3xl relative overflow-hidden shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Target size={20} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Goal Retardation
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Delay on Primary Goal</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-300 tabular-nums">
                  +{daysDelayed}
                </span>
                <span className="text-xs font-bold text-amber-500">days delayed</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-snug truncate">
                Pushes back <strong className="text-slate-900 dark:text-white">"{primaryGoal.title}"</strong> target date.
              </p>
            </div>
          </div>

          {/* Interactive Decision Cockpit */}
          <div className="glass-card p-6 bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border rounded-3xl space-y-4 shadow-xs dark:shadow-none">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">The Interceptor Decision</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every unit of currency you spend is a vote for the type of life you want to live. Will you yield to short-term
              dopamine or defend your financial sovereignty?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option A: Walk Away (+50 Karma Points) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWalkAway}
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Walk Away (+50 Karma)</span>
              </motion.button>

              {/* Option B: Proceed with Purchase */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceed}
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>Proceed with Purchase</span>
              </motion.button>
            </div>

            {/* Success Notifications */}
            <AnimatePresence>
              {walkedAway && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                >
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span>
                    🎉 Masterful discipline! You reclaimed {hoursOfLabor} hours of life energy and earned +50 Karma Points.
                  </span>
                </motion.div>
              )}

              {purchased && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-300 text-xs font-semibold"
                >
                  <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                  <span>
                    Recorded conscious expenditure of {formatCurrency(itemPrice, baseCurrency)} in Wants. Reconciled across ledger and 50/30/20 bars!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
