// BudgetBasics — Money Mistakes Module & Interactive Accordions
// Complies with TechWiz 7 SRS Section 1.6.6:
// - Explains common mistakes: impulse buying, ignoring small expenses, late payments, unused subscriptions, spending without a plan
// - Realistic student scenario + actionable corrective action for each
// - Interactive expandable/collapsible accordions

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Coffee,
  CalendarX,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface MistakeData {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tagline: string;
  scenario: string;
  consequence: string;
  correctiveAction: string[];
}

const MONEY_MISTAKES: MistakeData[] = [
  {
    id: 'mistake-1',
    title: '1. Impulse Buying on Digital Flash Sales',
    category: 'Behavioral Bias',
    icon: ShoppingBag,
    tagline: 'Purchasing items instantly due to emotional hype or artificial discounts.',
    scenario:
      'Ali was scrolling social media at 11 PM and saw a limited-time 40% discount on gaming headphones and trendy streetwear. Without checking his hostel rent due in 4 days, he paid $75 using one-click checkout.',
    consequence:
      'He had to borrow money from a roommate to pay the dormitory electricity bill, feeling guilty and stressed for three weeks.',
    correctiveAction: [
      'Enforce the 48-Hour Waiting Rule: Add the item to your wishlist and wait 48 hours before checking out.',
      'Remove saved card credentials from shopping apps to introduce physical friction.',
      'Ask yourself: "Would I buy this at full price in cash today?" If no, skip it.',
    ],
  },
  {
    id: 'mistake-2',
    title: '2. Ignoring Small Daily Micro-Expenses ("The Latte Factor")',
    category: 'Invisible Leaks',
    icon: Coffee,
    tagline: 'Assuming that $3 to $5 outlays do not matter, when they quietly drain 25% of allowance.',
    scenario:
      'Sara buys a $4.50 specialty coffee and $2 snack daily after morning lecture. She considers this negligible compared to her $500 monthly allowance.',
    consequence:
      '$6.50 × 22 campus days = $143 per month, representing almost 30% of her entire monthly income spent solely on sugar and takeout coffee.',
    correctiveAction: [
      'Carry a reusable thermos flask with home-brewed tea or coffee; treat barista coffee as a weekend reward.',
      'Check your bank statement once a week and sum up daily food delivery transactions.',
      'Budget a strict weekly cash envelope for campus snacks ($20 maximum).',
    ],
  },
  {
    id: 'mistake-3',
    title: '3. Late Payments, Overdrafts & Unnecessary Penalties',
    category: 'Cash Flow Oversight',
    icon: CalendarX,
    tagline: 'Forgetting due dates and paying avoidable late fines and penalty interest.',
    scenario:
      'Zayn had sufficient money in his savings account, but forgot his student hostel fee and internet bill deadline on the 10th. The service added a $25 late administrative charge.',
    consequence:
      'Paid $25 in pure waste—money that could have funded two weeks of lunches or his coding certification exam.',
    correctiveAction: [
      'Schedule automated calendar alerts 3 days prior to recurring due dates.',
      'Align all bill payments to occur within 48 hours of receiving your monthly allowance.',
      'Maintain an untouched $50 emergency checking buffer to prevent overdraft charges.',
    ],
  },
  {
    id: 'mistake-4',
    title: '4. Zombie Subscriptions & Auto-Renewing Trials',
    category: 'Recurring Bleed',
    icon: CreditCard,
    tagline: 'Signing up for free trials and forgetting to cancel, leaving cards billed indefinitely.',
    scenario:
      'Hina signed up for a 7-day free trial of a photo editing tool, a gym app, and a streaming channel for project research. She forgot to cancel, and three services automatically renewed at $9.99, $14.99, and $7.99 each month.',
    consequence:
      'She lost $32.97 every single month ($395 per year) for software she opened only once.',
    correctiveAction: [
      'Set an instant reminder on your phone the minute you start a "free trial": "Cancel trial today".',
      'Audit your app store active subscriptions every 30 days.',
      'Share family plans or seek free open-source student alternatives (e.g. Canva Student, GitHub Student Pack).',
    ],
  },
  {
    id: 'mistake-5',
    title: '5. Spending Without a Written Plan ("Mental Budgeting")',
    category: 'Strategic Failure',
    icon: AlertTriangle,
    tagline: 'Keeping figures in your head and wondering where all the money vanished by mid-month.',
    scenario:
      'Bilal received his $600 internship stipend on the 1st. He felt prosperous and paid for multiple group restaurant bills. By the 18th of the month, he had only $42 remaining for the next 12 days.',
    consequence:
      'Severe end-of-month panic, resorting to instant noodles, and missing university networking seminars.',
    correctiveAction: [
      'Apply the 50/30/20 rule on day 1: transfer your 20% savings immediately to a separate fund.',
      'Divide the remaining discretionary funds into 4 weekly allowances ($100/week) rather than spending freely.',
      'Use the BudgetBasics Expense Planner to record daily entries in under 30 seconds.',
    ],
  },
];

export default function MoneyMistakesModule() {
  const [expandedId, setExpandedId] = useState<string>('mistake-1');

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
          <AlertTriangle size={14} /> Financial Pitfalls & Solutions
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Common Student Money Mistakes & Solutions
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Financial intelligence is not just about making money—it is about avoiding unforced errors. Expand each accordion below to study realistic student scenarios and immediate corrective actions.
        </p>
      </div>

      {/* Accordions List */}
      <div className="space-y-4">
        {MONEY_MISTAKES.map((mistake) => {
          const isExpanded = expandedId === mistake.id;
          const Icon = mistake.icon;

          return (
            <div
              key={mistake.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-amber-500/40 bg-white dark:bg-slate-900/90 shadow-md'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-slate-300'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(mistake.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                    isExpanded
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold">
                        {mistake.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1">
                      {mistake.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-100 dark:border-white/5 p-5 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-white/[0.01]"
                  >
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{mistake.tagline}"
                    </p>

                    {/* Realistic Scenario & Consequence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle size={14} /> Realistic Student Scenario
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {mistake.scenario}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                        <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle size={14} /> Financial Consequence
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {mistake.consequence}
                        </p>
                      </div>
                    </div>

                    {/* Corrective Action Steps */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 size={15} /> Actionable Corrective Protocol
                      </span>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                        {mistake.correctiveAction.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
