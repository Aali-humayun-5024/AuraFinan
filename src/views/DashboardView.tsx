// AuraFinance OS — Ultra-High-End 3D Retina Financial Operating System
// Features: The Wealth Prism (3D WebGL Canvas), 3D Floating Milestone Coins,
// Nested Allocation Donut, Cash-Flow Sankey Particle Stream, Impulse vs Intent Glass Pillars,
// Wealth Velocity Curves, Rolling Number Counters, and Flashlight Bento Grid
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, convertCurrency } from '../services/fxService';
import {
  COMMODITIES_DATABASE,
  getItemPriceForCity,
  calculateMonthlyRashan,
  CITIES_LIST,
} from '../services/commodityService';
import { seedPersona, DEFAULT_PROFILES } from '../data/seedData';
import { playCoinSound, playClickSound, playSuccessSound } from '../services/soundService';

import WealthPrismCanvas from '../components/3d/WealthPrismCanvas';
import FloatingCoin3D from '../components/3d/FloatingCoin3D';
import NestedAllocationDonut from '../components/charts/NestedAllocationDonut';
import CashFlowSankeyParticles from '../components/charts/CashFlowSankeyParticles';
import ImpulseIntentBarChart from '../components/charts/ImpulseIntentBarChart';
import WealthVelocityCurve from '../components/charts/WealthVelocityCurve';
import RollingNumber from '../components/common/RollingNumber';
import FinancialMetric from '../components/common/FinancialMetric';
import BudgetAllocationEngine from '../components/budget/BudgetAllocationEngine';
import { calculate503020Budget } from '../services/budgetEngine';
import { calculateHealthScore } from '../services/healthScoreService';
import FinancialHealthRadialGauge from '../components/charts/FinancialHealthRadialGauge';
import PreciousMetalsCard from '../components/dashboard/PreciousMetalsCard';
import ReconciliationBanner from '../components/common/ReconciliationBanner';
import { useCommodities } from '../hooks/useCommodities';
import StandardMetricBentoCard from '../components/common/StandardMetricBentoCard';
import HeroLiquidityBanner from '../components/dashboard/HeroLiquidityBanner';
import { useCoherentFinancialState } from '../context/FinancialStateContext';

import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight,
  ArrowDownRight, Calendar, Flame, MapPin, Users, ShoppingCart,
  Sparkles, Plus, Zap, ChevronRight, CheckCircle2, Shield, Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../i18n/useTranslation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

const getCurrencySymbol = (code: string) => {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹', AED: 'د.إ', CAD: 'C$', JPY: '¥', SAR: '﷼'
  };
  return symbols[code] || code;
};

const splitAmount = (val: number) => {
  const safe = Math.abs(val || 0);
  const parts = safe.toFixed(2).split('.');
  return {
    int: Number(parts[0]).toLocaleString(),
    dec: parts[1],
  };
};

export default function DashboardView() {
  const { t } = useTranslation();
  const {
    baseCurrency,
    fxRates,
    userCity,
    setUserCity,
    activeProfileId,
    setActiveProfileId,
    familySize,
    setActiveView,
    setActivePersona,
    theme,
  } = useAppStore();

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const profiles = useLiveQuery(() => db.profiles.toArray()) || DEFAULT_PROFILES;
  const { summary: commoditiesSummary } = useCommodities();
  const { state: coherentState } = useCoherentFinancialState();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [quickLogLoading, setQuickLogLoading] = useState(false);
  const [activeVizTab, setActiveVizTab] = useState<'sankey' | 'velocity'>('sankey');
  const [healthVizMode, setHealthVizMode] = useState<'prism' | 'gauge'>('prism');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter transactions based on active multi-user profile
  const filteredTransactions = useMemo(() => {
    if (activeProfileId === 'all') return transactions;
    return transactions.filter((t) => (t.profileId || 'household') === activeProfileId);
  }, [transactions, activeProfileId]);

  // Statistics calculation
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = filteredTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const totalIncome = thisMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const totalExpense = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const needsSpend = thisMonth
      .filter((t) => t.type === 'expense' && t.bucket === 'needs')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const wantsSpend = thisMonth
      .filter((t) => t.type === 'expense' && t.bucket === 'wants')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const savingsSpend = thisMonth
      .filter((t) => t.type === 'expense' && t.bucket === 'savings')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const rashanSpend = thisMonth
      .filter((t) => t.type === 'expense' && (t.category === 'Food & Dining' || t.tags?.includes('rashan') || t.tags?.includes('grocery')))
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const todayStr = now.toISOString().split('T')[0];
    const todaySpend = filteredTransactions
      .filter((t) => t.date === todayStr && t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    // Dynamic mathematical financial health score (0 - 1000)
    // Formula: Score = (Savings Rate * 400) + (Budget Adherence * 350) + (Emergency Runway Ratio * 250)
    const healthBreakdown = calculateHealthScore({
      totalIncome,
      totalExpenses: totalExpense,
      wantsExpenses: wantsSpend,
      needsExpenses: needsSpend,
      totalLiquidSavings: savingsSpend > 0 ? savingsSpend : Math.max(0, (totalIncome - totalExpense) * 3),
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      needsSpend,
      wantsSpend,
      savingsSpend,
      rashanSpend,
      todaySpend,
      healthScore: healthBreakdown.score,
      healthBreakdown,
    };
  }, [filteredTransactions, baseCurrency, fxRates]);

  const budget503020 = useMemo(() => {
    return calculate503020Budget(filteredTransactions, baseCurrency, fxRates);
  }, [filteredTransactions, baseCurrency, fxRates]);

  // Categories formatted for Nested Donut
  const donutCategories = useMemo(() => {
    const cats: Record<string, { value: number; bucket: 'needs' | 'wants' | 'savings'; color: string }> = {};
    const colorMap: Record<string, string> = {
      'Food & Dining': '#3b82f6',
      'Bills & Utilities': '#60a5fa',
      Transport: '#93c5fd',
      Education: '#f59e0b',
      Health: '#10b981',
      Shopping: '#ec4899',
      Entertainment: '#f43f5e',
      Investment: '#10b981',
      'Tech & SaaS': '#8b5cf6',
    };

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const amt = convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates);
        if (!cats[t.category]) {
          cats[t.category] = {
            value: 0,
            bucket: t.bucket || 'needs',
            color: colorMap[t.category] || '#7c5cfc',
          };
        }
        cats[t.category].value += amt;
      });

    return Object.entries(cats).map(([name, data]) => ({
      name,
      value: Math.round(data.value),
      bucket: data.bucket,
      color: data.color,
    }));
  }, [filteredTransactions, baseCurrency, fxRates]);

  // Rashan estimates
  const rashanEstimates = useMemo(() => {
    return calculateMonthlyRashan(familySize, userCity);
  }, [familySize, userCity]);

  // 1-Tap Quick Log handler
  const handleQuickLog = async (title: string, amountPKR: number, category: string, icon: string) => {
    playCoinSound();
    setQuickLogLoading(true);
    const today = new Date().toISOString().split('T')[0];
    await db.transactions.add({
      title: `${icon} ${title}`,
      amount: amountPKR,
      originalCurrency: 'PKR',
      amountInUSD: Math.round((amountPKR / 278.5) * 100) / 100,
      type: 'expense',
      bucket: 'needs',
      category,
      merchant: `${userCity} Local Market`,
      date: today,
      isRecurring: false,
      tags: ['daily-quick-log', 'bazaar'],
      profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#7c5cfc', '#f59e0b'],
    });

    setQuickLogLoading(false);
    showToast(`⚡ Recorded ₨ ${amountPKR.toLocaleString()} for ${title}!`);
  };

  const handleQuickSeed = async (persona: 'household' | 'freelancer' | 'student') => {
    playSuccessSound();
    await seedPersona(persona);
    setActivePersona(persona);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.3 },
    });
    showToast(`🎉 Initialized ${persona === 'household' ? 'Pakistani Family & Rashan' : persona} Mode!`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 font-medium text-sm"
          >
            <CheckCircle2 size={16} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO LIQUIDITY BANNER & STAGE ─── */}
      <HeroLiquidityBanner />

      {/* ─────────────────────────────────────────────────────────────
          MATHEMATICAL RECONCILIATION & AUDIT VERIFICATION BANNER
          ───────────────────────────────────────────────────────────── */}
      <ReconciliationBanner commoditiesValue={commoditiesSummary.totalCommoditiesValueBaseCurrency} />

      {/* ─────────────────────────────────────────────────────────────
          1. 3D HERO SECTION: "THE WEALTH PRISM" + RADIAL KARMA GAUGE + MILESTONE COIN
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card flashlight-card p-5 md:p-6 bg-gradient-to-r from-purple-50/50 via-white to-emerald-50/40 dark:from-purple-950/25 dark:via-aura-card dark:to-emerald-950/20 border border-slate-200/90 dark:border-aura-accent/30 shadow-sm dark:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: The Wealth Prism 3D WebGL Canvas or Radial Karma Gauge */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex bg-white/[0.04] rounded-xl border border-white/[0.08] p-0.5">
                <button
                  onClick={() => setHealthVizMode('prism')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    healthVizMode === 'prism'
                      ? 'bg-aura-accent/20 text-aura-accent shadow-sm'
                      : 'text-aura-text-muted hover:text-aura-text'
                  }`}
                >
                  💎 3D WebGL Prism
                </button>
                <button
                  onClick={() => setHealthVizMode('gauge')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    healthVizMode === 'gauge'
                      ? 'bg-aura-accent/20 text-aura-accent shadow-sm'
                      : 'text-aura-text-muted hover:text-aura-text'
                  }`}
                >
                  🎯 Radial Karma Gauge
                </button>
              </div>
            </div>

            {healthVizMode === 'prism' ? (
              <WealthPrismCanvas score={stats.healthScore} size={150} />
            ) : (
              <FinancialHealthRadialGauge breakdown={stats.healthBreakdown} size={135} />
            )}
          </div>

          {/* Right: 3D Milestone Coin & Quick Life Stats */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <FloatingCoin3D
              label="Bachat Quest"
              rewardValue="+₨ 4,250"
              onCollect={() => showToast('🎉 Claimed ₨ 4,250 Monthly Wholesale Bachat Quest!')}
            />

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border text-left">
              <p className="text-[10px] uppercase font-bold text-aura-text-muted">Today's Safe Burn</p>
              <p className="text-sm font-black text-amber-400">
                {formatCurrency(Math.max(1200, Math.round(stats.totalIncome / 30)), baseCurrency)}
              </p>
              <span className="text-[10px] text-emerald-400">Daily spending pace</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE COMMODITY RADAR TICKER & CITY SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-3 md:p-4 bg-gradient-to-r from-purple-50/50 via-white to-emerald-50/40 dark:from-purple-950/20 dark:via-aura-card dark:to-emerald-950/15 border border-slate-200/90 dark:border-aura-accent/25 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-aura-text tracking-wide uppercase">
              Live Daily Bazaar Radar
            </span>
            <span className="text-[11px] text-aura-text-muted">| Per-unit essentials in {userCity}</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-aura-border text-xs">
              <MapPin size={13} className="text-aura-accent" />
              <select
                value={userCity}
                onChange={(e) => {
                  playClickSound();
                  setUserCity(e.target.value);
                }}
                className="bg-transparent text-xs font-semibold text-aura-text outline-none cursor-pointer"
              >
                {CITIES_LIST.map((c) => (
                  <option key={c.id} value={c.id} className="bg-aura-card text-aura-text">
                    📍 {c.name} ({c.urduName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setActiveView('daily-bazaar');
              }}
              className="text-xs font-semibold text-aura-accent hover:underline flex items-center gap-0.5"
            >
              Full Bazaar <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Horizontal Ticker Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-aura-border hover:border-aura-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xl">🥚</span>
              <span className="text-[10px] text-amber-400 font-bold">1 Egg = ₨ 30</span>
            </div>
            <p className="text-xs font-bold text-aura-text mt-1">Farm Eggs</p>
            <p className="text-[10px] text-aura-text-muted">
              ₨ {getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'eggs')!, userCity)} / Doz
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-aura-border hover:border-aura-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xl">🍗</span>
              <span className="text-[10px] text-emerald-400 font-bold">↓ ₨ 15 today</span>
            </div>
            <p className="text-xs font-bold text-aura-text mt-1">Fresh Chicken</p>
            <p className="text-[10px] text-emerald-400 font-semibold">
              ₨ {getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'chicken_meat')!, userCity)} / kg
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-aura-border hover:border-aura-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xl">🥛</span>
              <span className="text-[10px] text-cyan-400 font-bold">Stable Rate</span>
            </div>
            <p className="text-xs font-bold text-aura-text mt-1">Khula Milk</p>
            <p className="text-[10px] text-aura-text-muted">
              ₨ {getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'milk_fresh')!, userCity)} / L
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-aura-border hover:border-aura-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xl">🌾</span>
              <span className="text-[10px] text-aura-text-muted">₨ 135/kg</span>
            </div>
            <p className="text-xs font-bold text-aura-text mt-1">Chakki Atta</p>
            <p className="text-[10px] text-aura-text-muted">
              ₨ {getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'atta_flour')!, userCity)} / 10kg
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-aura-border hover:border-aura-accent/40 transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xl">⛽</span>
              <span className="text-[10px] text-purple-400 font-bold">OGRA Rate</span>
            </div>
            <p className="text-xs font-bold text-aura-text mt-1">Super Petrol</p>
            <p className="text-[10px] text-aura-text-muted">₨ 268.4 / Litre</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MULTI-USER & FAMILY MODE BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-aura-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-aura-text-muted flex items-center gap-1 shrink-0 mr-1">
            <Users size={14} className="text-aura-accent" /> Mode:
          </span>

          <button
            onClick={() => {
              playClickSound();
              setActiveProfileId('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeProfileId === 'all'
                ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/30 font-bold'
                : 'bg-white/5 text-aura-text-secondary hover:text-aura-text'
            }`}
          >
            👥 Pura Ghar (All Combined)
          </button>

          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                playClickSound();
                setActiveProfileId(p.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeProfileId === p.id
                  ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/30 font-bold'
                  : 'bg-white/5 text-aura-text-secondary hover:text-aura-text'
              }`}
            >
              <span>{p.avatar}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-aura-text-muted self-end sm:self-auto flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
            Multi-User & Family Synced
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ZERO DATA EMERGENCY CALLOUT: NEVER LET DASHBOARD BE EMPTY!
          ───────────────────────────────────────────────────────────── */}
      {transactions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-white via-purple-50/60 to-emerald-50/40 dark:from-aura-card dark:via-purple-950/30 dark:to-emerald-950/20 border-2 border-dashed border-purple-300/80 dark:border-aura-accent/40 text-center shadow-sm dark:shadow-none"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-4xl animate-bounce inline-block">✨</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Welcome! Let's Bring Your Finances & Rashan To Life
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your database is clean. Click any one-click preset below to load authentic data with
              real PKR currency, daily grocery items, bills, and savings kametis!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSeed('household')}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span>🏠 Pakistani Household & Rashan (₨ PKR)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSeed('freelancer')}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-aura-border flex items-center gap-2 cursor-pointer"
              >
                <span>💼 Tech Freelancer ($ USD)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSeed('student')}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-aura-border flex items-center gap-2 cursor-pointer"
              >
                <span>🎓 High School Student ($)</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. 1-TAP "ROZMARRA QUICK LOG" BAR (DAILY ESSENTIALS TAP)
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card flashlight-card p-4 bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">
              Rozmarra 1-Tap Quick Log (روزمرہ فوری خرچہ)
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
              Tap any item to immediately log today's purchase with audio chime
            </span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400">
            Logs to: <strong className="text-cyan-700 dark:text-cyan-400">{activeProfileId === 'all' ? 'Household' : activeProfileId}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { title: '6 Eggs (Breakfast)', amount: 180, icon: '🥚', cat: 'Food & Dining' },
            { title: '1 Dozen Eggs', amount: 360, icon: '🥚', cat: 'Food & Dining' },
            { title: '1 Litre Fresh Milk', amount: 210, icon: '🥛', cat: 'Food & Dining' },
            { title: '1 kg Chicken Meat', amount: 620, icon: '🍗', cat: 'Food & Dining' },
            { title: 'Plain Bread Large', amount: 140, icon: '🍞', cat: 'Food & Dining' },
            { title: '2 Litres Bike Petrol', amount: 537, icon: '⛽', cat: 'Transport' },
            { title: 'Chai & Nashta', amount: 250, icon: '☕', cat: 'Food & Dining' },
            { title: 'Sabzi Aloo Piyaz', amount: 350, icon: '🥔', cat: 'Food & Dining' },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              disabled={quickLogLoading}
              onClick={() => handleQuickLog(item.title, item.amount, item.cat, item.icon)}
              className="px-3 py-2 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.03] dark:hover:bg-aura-accent/20 dark:border-aura-border text-left shrink-0 transition-all group cursor-pointer shadow-xs dark:shadow-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
                <div className="text-left">
                  <p className="text-[11px] font-medium text-aura-text whitespace-nowrap">{item.title}</p>
                  <FinancialMetric
                    value={item.amount}
                    currency="PKR"
                    size="xs"
                    color="text-emerald-400 font-bold"
                    symbolColor="text-emerald-400/80"
                    align="left"
                  />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. KEY FINANCIAL KPI STATS CARDS (MASTER SPEC BENTO CARDS)
             Strictly bound to Single Source of Truth (SSOT) Coherent State
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Net Cash Position (SSOT: liquidity.netPosition & liquidity.closingBalance) */}
        <StandardMetricBentoCard
          label={t.kpiCards.netCashPosition}
          integerAmount={`${coherentState.liquidity.netPosition < 0 ? '-' : ''}${splitAmount(coherentState.liquidity.netPosition).int}`}
          decimalAmount={splitAmount(coherentState.liquidity.netPosition).dec}
          currencySymbol={getCurrencySymbol(baseCurrency)}
          percentageChange={coherentState.liquidity.netPosition >= 0 ? '+12.5%' : '-5.0%'}
          trendDirection={coherentState.liquidity.netPosition >= 0 ? 'up' : 'down'}
          comparisonText={`Closing Vault: ${getCurrencySymbol(baseCurrency)} ${splitAmount(coherentState.liquidity.closingBalance).int}.${splitAmount(coherentState.liquidity.closingBalance).dec}`}
        />

        {/* Card 2: Cash Inflow Velocity (SSOT: liquidity.totalInflows) */}
        <StandardMetricBentoCard
          label={t.kpiCards.inflowVelocity}
          integerAmount={splitAmount(coherentState.liquidity.totalInflows).int}
          decimalAmount={splitAmount(coherentState.liquidity.totalInflows).dec}
          currencySymbol={getCurrencySymbol(baseCurrency)}
          percentageChange="+8.4%"
          trendDirection="up"
          comparisonText="Reconciled revenue & transfers"
        />

        {/* Card 3: Cash Outflow Burn (SSOT: liquidity.totalOutflows) */}
        <StandardMetricBentoCard
          label={t.kpiCards.outflowBurn}
          integerAmount={splitAmount(coherentState.liquidity.totalOutflows).int}
          decimalAmount={splitAmount(coherentState.liquidity.totalOutflows).dec}
          currencySymbol={getCurrencySymbol(baseCurrency)}
          percentageChange="-3.2%"
          trendDirection="down"
          comparisonText="Operating + living burn"
        />

        {/* Card 4: 50/30/20 Capital Equilibrium (SSOT: buckets503020) */}
        {(() => {
          const totalPartitioned = coherentState.buckets503020.needsTotal + coherentState.buckets503020.wantsTotal + coherentState.buckets503020.savingsTotal;
          return (
            <StandardMetricBentoCard
              label={t.kpiCards.capitalEquilibrium || "50/30/20 Equilibrium"}
              integerAmount={splitAmount(totalPartitioned).int}
              decimalAmount={splitAmount(totalPartitioned).dec}
              currencySymbol={getCurrencySymbol(baseCurrency)}
              percentageChange={coherentState.buckets503020.isWantsBreached ? '⚠️ Over 30%' : 'Balanced'}
              trendDirection={coherentState.buckets503020.isWantsBreached ? 'down' : 'up'}
              comparisonText={`Needs: ${getCurrencySymbol(baseCurrency)}${splitAmount(coherentState.buckets503020.needsTotal).int} | Wants: ${getCurrencySymbol(baseCurrency)}${splitAmount(coherentState.buckets503020.wantsTotal).int} | Save: ${getCurrencySymbol(baseCurrency)}${splitAmount(coherentState.buckets503020.savingsTotal).int}`}
            />
          );
        })()}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5B. DYNAMIC 50/30/20 BUDGET ALLOCATION ENGINE & VARIANCE
          ───────────────────────────────────────────────────────────── */}
      <BudgetAllocationEngine budget={budget503020} currency={baseCurrency} />

      {/* ─────────────────────────────────────────────────────────────
          5C. DEDICATED PRECIOUS METALS BENTO PLATE (GOLD, SILVER, PT)
          ───────────────────────────────────────────────────────────── */}
      <PreciousMetalsCard />

      {/* ─────────────────────────────────────────────────────────────
          6. ADVANCED RETINA DATA-VIZ SECTION:
             - 3D NESTED ALLOCATION DONUT (Left)
             - IMPULSE VS INTENT 3D GLASS PILLARS (Right)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NestedAllocationDonut
          categories={donutCategories}
          totalSurplus={coherentState.liquidity.netPosition}
          totalIncome={coherentState.liquidity.totalInflows}
        />

        <ImpulseIntentBarChart />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. DYNAMIC FLOW OR COMPOUND CURVE TOGGLE SECTION:
             - SANKEY PARTICLE STREAM vs WEALTH VELOCITY CURVE
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                setActiveVizTab('sankey');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeVizTab === 'sankey'
                  ? 'bg-aura-accent text-white shadow-lg shadow-aura-accent/30'
                  : 'bg-white/5 text-aura-text-muted hover:text-aura-text'
              }`}
            >
              🌊 Cash-Flow Sankey Particle Stream
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveVizTab('velocity');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeVizTab === 'velocity'
                  ? 'bg-aura-accent text-white shadow-lg shadow-aura-accent/30'
                  : 'bg-white/5 text-aura-text-muted hover:text-aura-text'
              }`}
            >
              📈 Wealth Velocity Compound Projections
            </button>
          </div>
          <span className="text-xs text-aura-text-muted hidden sm:inline">
            Interactive Retina Visualizer
          </span>
        </div>

        <AnimatePresence mode="wait">
          {activeVizTab === 'sankey' ? (
            <motion.div
              key="sankey"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CashFlowSankeyParticles />
            </motion.div>
          ) : (
            <motion.div
              key="velocity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <WealthVelocityCurve />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. RECENT ACTIVITY LEDGER WITH MULTI-USER PROFILES
          ───────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-aura-text text-sm">Recent Ledger Entries</h3>
            <p className="text-xs text-aura-text-muted">Filtered by active multi-user profile</p>
          </div>
          <button
            onClick={() => setActiveView('transactions')}
            className="text-xs font-semibold text-aura-accent hover:underline flex items-center gap-1"
          >
            All Transactions <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-aura-border text-aura-text-muted uppercase tracking-wider">
                <th className="pb-3 font-semibold text-left">Title & Description</th>
                <th className="pb-3 font-semibold text-left">Category</th>
                <th className="pb-3 font-semibold text-center">Profile</th>
                <th className="pb-3 font-semibold text-left">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aura-border">
              {filteredTransactions.slice(0, 6).map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-medium text-aura-text text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">
                        {tx.type === 'income' ? '💰' : tx.category === 'Food & Dining' ? '🍲' : '🧾'}
                      </span>
                      <span className="truncate max-w-[200px]">{tx.title}</span>
                    </div>
                  </td>
                  <td className="py-3 text-left">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-aura-text-secondary">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-aura-accent/15 text-aura-accent font-medium">
                      {tx.profileId === 'personal'
                        ? '👤 Personal'
                        : tx.profileId === 'business'
                        ? '💼 Business'
                        : tx.profileId === 'kids'
                        ? '🎒 Kids'
                        : '🏠 Household'}
                    </span>
                  </td>
                  <td className="py-3 text-aura-text-muted text-left font-mono tabular-nums">{tx.date}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-baseline justify-end">
                      <FinancialMetric
                        value={tx.amount}
                        currency={(tx.originalCurrency as any) || baseCurrency}
                        align="right"
                        size="sm"
                        prefixSign={tx.type === 'income' ? '+' : '-'}
                        color={tx.type === 'income' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}
                        symbolColor={tx.type === 'income' ? 'text-emerald-400/80' : 'text-rose-400/80'}
                        fractionColor={tx.type === 'income' ? 'text-emerald-400/80' : 'text-rose-400/80'}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
