// BudgetBasics — Needs vs. Wants Module & Interactive Classification Game
// Complies with TechWiz 7 SRS Section 1.6.2:
// - Displays essential and optional spending categories
// - Interactive game to classify sample items as a Need or Want
// - Instant feedback explaining the selected answer
// - Visual Decision Guide flowchart helping users delay non-essential purchases

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  GitBranch,
  Clock,
  HeartHandshake,
  Check,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';

interface ItemToClassify {
  id: number;
  name: string;
  category: string;
  emoji: string;
  isNeed: boolean;
  costEstimate: string;
  explanation: string;
}

const SAMPLE_ITEMS: ItemToClassify[] = [
  {
    id: 1,
    name: 'Required University Course Textbooks',
    category: 'Education',
    emoji: '📚',
    isNeed: true,
    costEstimate: '$85.00',
    explanation: 'Need: Essential learning material required for coursework, exam passing, and academic degree completion.',
  },
  {
    id: 2,
    name: 'Latest Flagship Smartphone Upgrade',
    category: 'Electronics',
    emoji: '📱',
    isNeed: false,
    costEstimate: '$999.00',
    explanation: 'Want: If your existing phone makes calls and runs university apps, an expensive new flagship model is a luxury desire.',
  },
  {
    id: 3,
    name: 'Monthly Dormitory / Hostel Rent',
    category: 'Housing',
    emoji: '🏠',
    isNeed: true,
    costEstimate: '$350.00',
    explanation: 'Need: Shelter and safe accommodation is a fundamental physical survival requirement.',
  },
  {
    id: 4,
    name: 'Daily Specialty Vanilla Latte & Pastry',
    category: 'Dining Out',
    emoji: '☕',
    isNeed: false,
    costEstimate: '$6.50/day ($195/mo)',
    explanation: 'Want: Hydration and basic food are needs, but premium coffee shop barista drinks are discretionary lifestyle luxuries.',
  },
  {
    id: 5,
    name: 'Monthly Public Transit & Bus Pass',
    category: 'Transportation',
    emoji: '🚌',
    isNeed: true,
    costEstimate: '$45.00',
    explanation: 'Need: Direct mobility to attend classes, laboratory work, and job shifts reliably on time.',
  },
  {
    id: 6,
    name: 'Premium Gaming Console & Game Pass',
    category: 'Gaming',
    emoji: '🎮',
    isNeed: false,
    costEstimate: '$60.00/mo',
    explanation: 'Want: Leisure and video gaming are enjoyable recreational wants, but non-essential for survival.',
  },
  {
    id: 7,
    name: 'Basic Hygiene Supplies & Prescribed Medicine',
    category: 'Healthcare',
    emoji: '💊',
    isNeed: true,
    costEstimate: '$30.00',
    explanation: 'Need: Personal health, sanitation, and essential prescription medications are non-negotiable necessities.',
  },
  {
    id: 8,
    name: 'Designer Sneakers & Trending Streetwear',
    category: 'Fashion',
    emoji: '👟',
    isNeed: false,
    costEstimate: '$180.00',
    explanation: 'Want: Basic functional shoes are a need; high-end hype sneaker brands represent discretionary lifestyle wants.',
  },
];

export default function NeedsVsWantsModule() {
  const { baseCurrency } = useAppStore();

  // Classification Game State
  const [userGuesses, setUserGuesses] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'game' | 'decision-guide' | 'categories'>('game');

  const handleGuess = (itemId: number, guessedNeed: boolean) => {
    setUserGuesses((prev) => ({ ...prev, [itemId]: guessedNeed }));
    const item = SAMPLE_ITEMS.find((i) => i.id === itemId);
    if (item && item.isNeed === guessedNeed) {
      // Correct!
      const totalAnswered = Object.keys(userGuesses).length + 1;
      if (totalAnswered === SAMPLE_ITEMS.length) {
        confetti({ particleCount: 70, spread: 60 });
      }
    }
  };

  const handleResetGame = () => {
    setUserGuesses({});
  };

  const answeredCount = Object.keys(userGuesses).length;
  const correctCount = SAMPLE_ITEMS.filter((item) => userGuesses[item.id] === item.isNeed).length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Module Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
          <ShieldCheck size={14} /> SRS Requirement 1.6.2
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Needs vs. Wants Framework
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          The single most effective superpower in personal budgeting is learning to differentiate between an absolute <strong>Need</strong> (essential for survival, study, and health) and a <strong>Want</strong> (a comfort or lifestyle upgrade).
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'game'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sparkles size={14} /> Interactive Classification Game
          </button>
          <button
            onClick={() => setActiveTab('decision-guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'decision-guide'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <GitBranch size={14} /> Visual Purchase Decision Guide
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <ShoppingBag size={14} /> Essential vs. Optional Categories
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CLASSIFICATION GAME */}
      {activeTab === 'game' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Practice: Classify Each Item
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click "Need" or "Want" for each sample student expense to test your instinct.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                Score: {correctCount} / {SAMPLE_ITEMS.length}
              </span>
              {answeredCount > 0 && (
                <button
                  onClick={handleResetGame}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_ITEMS.map((item) => {
              const guessed = userGuesses[item.id];
              const isAnswered = guessed !== undefined;
              const isCorrect = isAnswered && guessed === item.isNeed;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 bg-white dark:bg-slate-900/80 ${
                    isAnswered
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-white/10 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-white/5">{item.emoji}</span>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                      {item.costEstimate}
                    </span>
                  </div>

                  {/* Buttons: Need or Want */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleGuess(item.id, true)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isAnswered && guessed === true
                          ? isCorrect
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-rose-500 text-white shadow-xs'
                          : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      <ShieldCheck size={14} /> Need (Essential)
                    </button>
                    <button
                      onClick={() => handleGuess(item.id, false)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isAnswered && guessed === false
                          ? isCorrect
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-rose-500 text-white shadow-xs'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      <ShoppingBag size={14} /> Want (Optional)
                    </button>
                  </div>

                  {/* Explanation Feedback */}
                  {isAnswered && (
                    <div className="pt-2 text-xs border-t border-slate-100 dark:border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Correct!
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle size={14} /> Note: This is a {item.isNeed ? 'Need' : 'Want'}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL PURCHASE DECISION GUIDE FLOWCHART */}
      {activeTab === 'decision-guide' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-white/5 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch size={20} className="text-amber-500" />
              Visual Decision Guide: The Student Purchase Flowchart
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Follow this step-by-step logic before swiping your card or paying from your student account.
            </p>
          </div>

          {/* Step-by-Step Decision Ladder */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                Step 1: Necessity
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Is it essential for life, health, or exams?
              </h3>
              <div className="space-y-1 text-xs">
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ YES → Prioritize & purchase immediately.
                </div>
                <div className="text-amber-600 dark:text-amber-400 font-semibold">
                  ✗ NO → Proceed to Step 2.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Step 2: Cash Fit
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Is there room in this month's 30% Wants?
              </h3>
              <div className="space-y-1 text-xs">
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ YES → Proceed to Step 3.
                </div>
                <div className="text-rose-600 dark:text-rose-400 font-semibold">
                  ✗ NO → Stop! Delay until next allowance.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                Step 3: Cool-Off
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                The 48-Hour Waiting Test
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Put the item on a 48-hour mental hold. 70% of impulse buying desires disappear after 2 days.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Step 4: Action
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Final Conscious Decision
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Still desire it after 48 hours and budget allows? Purchase without guilt! You planned it responsibly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ESSENTIAL VS OPTIONAL CATEGORIES COMPARISON */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Essential Categories */}
          <div className="rounded-2xl p-6 bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Essential (Needs)</h3>
                <p className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold">Non-negotiable foundations</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                <span><strong>Housing & Dorm:</strong> Room rent, hostel maintenance, utilities (water, electricity, gas).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                <span><strong>Nutrition:</strong> Basic groceries, mess membership, clean water, essential staples.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                <span><strong>Academics:</strong> Tuition fees, semester exam registration, mandatory lab textbooks.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                <span><strong>Transit:</strong> Daily student bus fare, subway transit card, bicycle maintenance.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                <span><strong>Healthcare:</strong> Clinic visits, emergency prescriptions, health insurance copays.</span>
              </li>
            </ul>
          </div>

          {/* Optional Categories */}
          <div className="rounded-2xl p-6 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Optional (Wants)</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Lifestyle comforts & leisure</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Dining Out:</strong> Fast-food deliveries, artisan coffee runs, expensive campus restaurants.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Entertainment:</strong> Cinema tickets, music concert passes, amusement park trips.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Subscriptions:</strong> Streaming services (Netflix, Disney+), game passes, cloud storage upgrades.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Fashion & Merch:</strong> Designer clothing, luxury accessories, sneaker collecting.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Gadget Upgrades:</strong> Buying new hardware when current devices operate fine.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
