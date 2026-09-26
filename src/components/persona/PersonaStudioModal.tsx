// AuraFinance OS — Persona Architect Studio Modal
// Interactive 30-second custom persona builder with real-time 50/30/20 simulation
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type CurrencyCode } from '../../store/useAppStore';
import { db } from '../../db/database';
import type { CustomPersonaProfile } from '../../db/database';
import {
  generateAndSeedCustomPersona,
  INSPIRATION_PERSONA_PRESETS,
} from '../../services/personaGenerator';
import { playClickSound, playSuccessSound, playCoinSound } from '../../services/soundService';
import { formatCurrency } from '../../services/fxService';
import {
  Sparkles,
  X,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Compass,
  ArrowRight,
  Shield,
  Briefcase,
  GraduationCap,
  Building2,
  Palmtree,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATAR_OPTIONS = ['🩺', '🌴', '⚡', '💼', '🎓', '🚀', '🏢', '🎨', '📈', '🏖️', '🧠', '💎', '🇵🇰', '🌍'];

const ROLE_OPTIONS = [
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Allowances, part-time & campus life' },
  { id: 'early_career', label: 'Early Career', icon: Zap, desc: 'Corporate salary & initial compounding' },
  { id: 'freelancer', label: 'Freelancer', icon: Briefcase, desc: 'Client retainers & variable cash flow' },
  { id: 'business_owner', label: 'Business Owner', icon: Building2, desc: 'Owner draws & operations overhead' },
  { id: 'retiree', label: 'Retiree', icon: Palmtree, desc: 'Pension, dividends & capital preservation' },
  { id: 'custom', label: 'Custom Maker', icon: Sparkles, desc: 'Unconstrained financial architecture' },
] as const;

const LIFESTYLE_TIERS = [
  { id: 'frugal', label: 'Frugal Saver', split: '50 / 20 / 30', emoji: '🛡️', desc: 'Maximizes emergency runway & wealth velocity' },
  { id: 'balanced', label: 'Balanced Lifestyle', split: '50 / 30 / 20', emoji: '⚖️', desc: 'Standard golden ratio of modern wealth' },
  { id: 'lavish', label: 'Lavish Spender', split: '40 / 45 / 15', emoji: '🍾', desc: 'Heavy discretionary lifestyle & treats' },
] as const;

const EXPENSE_LEAKS = [
  { id: 'dining_out', label: 'Dining & Cafes', emoji: '🍔', tag: 'Fine dining, DoorDash, artisan coffee' },
  { id: 'gadgets_tech', label: 'Gadgets & Tech', emoji: '💻', tag: 'Monitors, GPUs, custom keyboards' },
  { id: 'rent_living', label: 'Luxury Housing', emoji: '🏠', tag: 'High-floor views & designer interiors' },
  { id: 'shopping', label: 'Designer Shopping', emoji: '🛍️', tag: 'Sneakers, apparel & aesthetic gear' },
  { id: 'travel', label: 'Travel & Trips', emoji: '✈️', tag: 'Weekend Airbnbs & regional flights' },
] as const;

const COUNTRY_OPTIONS = [
  { code: 'US', flag: '🇺🇸', name: 'United States', defCur: 'USD' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan', defCur: 'PKR' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE (Dubai)', defCur: 'AED' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', defCur: 'GBP' },
  { code: 'EU', flag: '🇪🇺', name: 'Eurozone', defCur: 'EUR' },
  { code: 'IN', flag: '🇮🇳', name: 'India', defCur: 'INR' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', defCur: 'CAD' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', defCur: 'JPY' },
];

export default function PersonaStudioModal() {
  const {
    personaStudioOpen,
    setPersonaStudioOpen,
    setActivePersona,
    setCustomPersona,
    setBaseCurrency,
    setUserCity,
  } = useAppStore();

  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('Struggling Medical Resident');
  const [avatarIcon, setAvatarIcon] = useState('🩺');
  const [userRole, setUserRole] = useState<CustomPersonaProfile['userRole']>('early_career');
  const [currency, setCurrency] = useState('USD');
  const [monthlyIncome, setMonthlyIncome] = useState(4800);
  const [lifestyleTier, setLifestyleTier] = useState<CustomPersonaProfile['lifestyleTier']>('frugal');
  const [biggestExpenseLeak, setBiggestExpenseLeak] = useState<CustomPersonaProfile['biggestExpenseLeak']>('rent_living');
  const [culturalContext, setCulturalContext] = useState('US');

  // Primary Goal
  const [goalTitle, setGoalTitle] = useState('Pay Off Med School Loans');
  const [targetAmount, setTargetAmount] = useState(45000);
  const [timelineMonths, setTimelineMonths] = useState(24);

  // Live 50/30/20 Projection
  const projection = useMemo(() => {
    let nPct = 0.5;
    let wPct = 0.3;
    let sPct = 0.2;
    if (lifestyleTier === 'frugal') {
      nPct = 0.5; wPct = 0.2; sPct = 0.3;
    } else if (lifestyleTier === 'lavish') {
      nPct = 0.4; wPct = 0.45; sPct = 0.15;
    }

    const needs = Math.round(monthlyIncome * nPct);
    const wants = Math.round(monthlyIncome * wPct);
    const savings = Math.round(monthlyIncome * sPct);

    // Goal calculation: how many months at current savings rate
    const monthlyAllocatedToGoal = Math.max(50, Math.round(savings * 0.7));
    const projectedGoalMonths = Math.ceil(targetAmount / monthlyAllocatedToGoal);

    return {
      needs,
      wants,
      savings,
      nPct: Math.round(nPct * 100),
      wPct: Math.round(wPct * 100),
      sPct: Math.round(sPct * 100),
      projectedGoalMonths,
    };
  }, [monthlyIncome, lifestyleTier, targetAmount]);

  // Load a preset
  const handleLoadPreset = (preset: CustomPersonaProfile) => {
    playClickSound();
    setName(preset.name);
    setAvatarIcon(preset.avatarIcon);
    setUserRole(preset.userRole);
    setCurrency(preset.currency);
    setMonthlyIncome(preset.monthlyIncome);
    setLifestyleTier(preset.lifestyleTier);
    setBiggestExpenseLeak(preset.biggestExpenseLeak);
    setCulturalContext(preset.culturalContext);
    setGoalTitle(preset.primaryGoal.title);
    setTargetAmount(preset.primaryGoal.targetAmount);
    setTimelineMonths(preset.primaryGoal.timelineMonths);
  };

  // Submit & Generate Universe
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    playCoinSound();

    const newProfile: CustomPersonaProfile = {
      id: `persona-${Date.now()}`,
      name: name.trim(),
      avatarIcon,
      userRole,
      monthlyIncome,
      currency,
      lifestyleTier,
      primaryGoal: {
        title: goalTitle.trim() || 'Primary Financial Milestone',
        targetAmount: Number(targetAmount) || 10000,
        timelineMonths: Number(timelineMonths) || 12,
      },
      biggestExpenseLeak,
      culturalContext,
      createdAt: new Date().toISOString(),
    };

    try {
      await generateAndSeedCustomPersona(newProfile);

      // Update Zustand global store
      setActivePersona('custom');
      setCustomPersona(newProfile);
      setBaseCurrency(currency as CurrencyCode);
      if (culturalContext === 'PK') setUserCity('Karachi');
      else if (culturalContext === 'AE') setUserCity('Dubai');
      else if (culturalContext === 'GB') setUserCity('London');
      else setUserCity('San Francisco');

      playSuccessSound();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#059669', '#6D28D9', '#0284C7', '#f59e0b', '#E11D48'],
      });

      setPersonaStudioOpen(false);
    } catch (err) {
      console.error('Failed to generate persona:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!personaStudioOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-card w-full max-w-3xl p-5 sm:p-7 bg-aura-card border border-aura-border shadow-2xl relative max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setPersonaStudioOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-aura-text-muted hover:text-aura-text hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-aura-accent to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-aura-accent/30 text-lg">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-aura-text">
                  Persona Architect Studio
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ⚡ 30s Synthesis
                </span>
              </div>
              <p className="text-xs text-aura-text-muted">
                Craft a bespoke financial persona. Dexie.js programmatically generates 25+ ledger entries, goals & subscriptions 100% locally.
              </p>
            </div>
          </div>

          {/* ─── INSPIRATION PRESETS (1-Tap Quick Injections) ─── */}
          <div className="my-4 p-3 rounded-2xl bg-white/[0.03] border border-aura-border">
            <p className="text-[10px] uppercase font-bold text-aura-text-muted mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Judge & Evaluator 1-Tap Quick Presets:</span>
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {INSPIRATION_PERSONA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border flex items-center gap-1.5 cursor-pointer ${
                    name === preset.name
                      ? 'bg-aura-accent/20 border-aura-accent text-aura-text font-bold shadow-sm'
                      : 'bg-white/5 border-aura-border text-aura-text-muted hover:text-aura-text hover:bg-white/10'
                  }`}
                >
                  <span>{preset.avatarIcon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* 1. Name & Avatar Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-aura-text mb-1">
                  Persona Name or Scenario *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Single Mom in Dubai, Struggling Medical Resident..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-aura-border text-sm text-aura-text focus:outline-none focus:border-aura-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-aura-text mb-1">
                  Avatar Emblem
                </label>
                <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/5 rounded-xl border border-aura-border">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setAvatarIcon(av);
                      }}
                      className={`w-7 h-7 rounded-lg text-base flex items-center justify-center shrink-0 transition-all ${
                        avatarIcon === av
                          ? 'bg-aura-accent text-white scale-110 shadow-sm'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. User Role */}
            <div>
              <label className="block text-xs font-semibold text-aura-text mb-1.5">
                Career Archetype / Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setUserRole(r.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        userRole === r.id
                          ? 'bg-aura-accent/15 border-aura-accent text-aura-text shadow-sm'
                          : 'bg-white/[0.02] border-aura-border text-aura-text-muted hover:text-aura-text'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-aura-text">
                        <Icon size={13} className="text-aura-accent" />
                        <span>{r.label}</span>
                      </div>
                      <p className="text-[10px] text-aura-text-muted mt-0.5 line-clamp-1">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Monthly Income & Base Currency */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-aura-text">
                    Monthly Take-Home Inflow
                  </label>
                  <p className="text-[11px] text-aura-text-muted">
                    Calibrates scale for all ledger items, rent, and subscriptions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-aura-card border border-aura-border text-xs font-mono font-bold text-aura-text focus:outline-none focus:border-aura-accent cursor-pointer"
                  >
                    {['USD', 'EUR', 'GBP', 'PKR', 'AED', 'INR', 'CAD', 'JPY'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(100, Number(e.target.value)))}
                    className="w-32 px-3 py-1.5 rounded-xl bg-white/5 border border-aura-border text-sm font-mono font-bold text-aura-text text-right focus:outline-none focus:border-aura-accent"
                  />
                </div>
              </div>

              {/* Quick slider */}
              <input
                type="range"
                min={currency === 'PKR' ? 50000 : 1000}
                max={currency === 'PKR' ? 2500000 : 25000}
                step={currency === 'PKR' ? 10000 : 100}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full accent-aura-accent cursor-pointer"
              />
            </div>

            {/* 4. Lifestyle Tier (50/30/20 Tuning) */}
            <div>
              <label className="block text-xs font-semibold text-aura-text mb-1.5">
                Lifestyle Stance & Savings Ratio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {LIFESTYLE_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setLifestyleTier(tier.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      lifestyleTier === tier.id
                        ? 'bg-aura-accent/15 border-aura-accent text-aura-text shadow-sm'
                        : 'bg-white/[0.02] border-aura-border text-aura-text-muted hover:text-aura-text'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{tier.emoji}</span>
                      <span className="text-[10px] font-mono font-bold text-aura-accent">
                        {tier.split}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-aura-text">{tier.label}</p>
                    <p className="text-[10px] text-aura-text-muted mt-0.5">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Biggest Expense Leak & Cultural Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-aura-text mb-1">
                  Primary Expense Leak (Overspending Trap)
                </label>
                <div className="space-y-1.5">
                  {EXPENSE_LEAKS.map((leak) => (
                    <button
                      key={leak.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setBiggestExpenseLeak(leak.id);
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        biggestExpenseLeak === leak.id
                          ? 'bg-rose-500/15 border-rose-500/60 text-aura-text font-bold'
                          : 'bg-white/[0.02] border-aura-border text-aura-text-muted hover:text-aura-text'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{leak.emoji}</span>
                        <span>{leak.label}</span>
                      </div>
                      <span className="text-[10px] font-normal text-aura-text-muted hidden md:inline">
                        {leak.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-aura-text mb-1">
                  Cultural Region (Merchant Localization)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COUNTRY_OPTIONS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setCulturalContext(c.code);
                        if (c.code === 'PK') setCurrency('PKR');
                        else if (c.code === 'AE') setCurrency('AED');
                        else if (c.code === 'GB') setCurrency('GBP');
                        else if (c.code === 'EU') setCurrency('EUR');
                        else setCurrency('USD');
                      }}
                      className={`p-2 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        culturalContext === c.code
                          ? 'bg-aura-accent/15 border-aura-accent text-aura-text font-bold'
                          : 'bg-white/[0.02] border-aura-border text-aura-text-muted hover:text-aura-text'
                      }`}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>

                {/* Primary Life Goal */}
                <div className="mt-3.5 p-3 rounded-xl bg-white/[0.02] border border-aura-border space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-aura-text">
                    <Target size={13} className="text-aura-accent" />
                    <span>Primary Life Milestone</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Goal title (e.g. Med School Debt, Down-Payment)"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-aura-text-muted">Target ({currency})</span>
                      <input
                        type="number"
                        min="1"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1 rounded-lg bg-white/5 border border-aura-border text-xs font-mono text-aura-text text-right"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-aura-text-muted">Horizon (Months)</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={timelineMonths}
                        onChange={(e) => setTimelineMonths(Number(e.target.value))}
                        className="w-full px-2.5 py-1 rounded-lg bg-white/5 border border-aura-border text-xs font-mono text-aura-text text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Live Universe Simulation Preview Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 via-aura-card to-emerald-950/20 border border-aura-accent/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-aura-accent tracking-wider flex items-center gap-1">
                  <TrendingUp size={12} /> Live Universe Simulation Preview
                </span>
                <span className="text-xs font-mono text-aura-text font-bold">
                  {formatCurrency(monthlyIncome, currency as CurrencyCode)} / month
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white/5 border border-aura-border">
                  <p className="text-[10px] text-aura-text-muted">Needs ({projection.nPct}%)</p>
                  <p className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
                    {formatCurrency(projection.needs, currency as CurrencyCode)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-aura-border">
                  <p className="text-[10px] text-aura-text-muted">Wants ({projection.wPct}%)</p>
                  <p className="text-xs font-mono font-bold text-pink-500 dark:text-pink-400">
                    {formatCurrency(projection.wants, currency as CurrencyCode)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-aura-border">
                  <p className="text-[10px] text-aura-text-muted">Savings ({projection.sPct}%)</p>
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(projection.savings, currency as CurrencyCode)}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-aura-text-muted text-center pt-1">
                🎯 Projected milestone achievement for <strong>{goalTitle}</strong>: ~{projection.projectedGoalMonths} months at active savings velocity.
              </p>
            </div>

            {/* 7. Action Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-aura-accent via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-aura-accent/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Financial Universe in IndexedDB...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate & Launch Persona Financial Universe</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
