// BudgetBasics — Infographics and Learning Gallery Module
// Complies with TechWiz 7 SRS Section 1.6.7:
// - Original visual content: Needs vs Wants, 50-30-20 split, monthly budget cycle, saving challenges
// - Readable captions and suitable alternative text
// - Filter gallery by topic: All, Budgeting, Needs/Wants, Savings, Challenges

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Filter,
  PieChart,
  GitBranch,
  RefreshCw,
  TrendingUp,
  Award,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

interface InfographicCard {
  id: string;
  title: string;
  topic: 'Budgeting' | 'Needs/Wants' | 'Savings' | 'Challenges';
  tag: string;
  altText: string;
  caption: string;
  keyTakeaway: string;
  svgType: 'pie' | 'tree' | 'cycle' | 'challenge' | 'compound';
}

const INFOGRAPHICS: InfographicCard[] = [
  {
    id: 'info-1',
    title: 'The 50/30/20 Golden Ratio Visual Wheel',
    topic: 'Budgeting',
    tag: 'Golden Framework',
    altText: 'Visual circular diagram demonstrating the 50 percent needs, 30 percent wants, and 20 percent savings allocation',
    caption: 'A complete breakdown of monthly net income showing 50% for core living essentials, 30% for recreational desires, and 20% for future financial cushions.',
    keyTakeaway: 'Always secure your 50% needs and 20% savings first; wants are treated as the flexible remainder.',
    svgType: 'pie',
  },
  {
    id: 'info-2',
    title: 'Needs vs. Wants Decision Tree Logic',
    topic: 'Needs/Wants',
    tag: 'Decision Guide',
    altText: 'Flowchart diagram explaining how to filter impulse spending through necessity, budget room, and the 48-hour cool-off rule',
    caption: 'A 4-step mental filter to prevent impulse purchasing when shopping online or browsing social media sales.',
    keyTakeaway: 'If it is not required for health, shelter, or exams, let it pass through a 48-hour waiting period.',
    svgType: 'tree',
  },
  {
    id: 'info-3',
    title: 'The Student Monthly Budget Cycle Flow',
    topic: 'Budgeting',
    tag: 'Cash Lifecycle',
    altText: 'Circular diagram tracking monthly money lifecycle: Inflow on 1st, Pay-Yourself-First on 2nd, Fixed Bills on 5th, Controlled Weekly Discretionary to 30th',
    caption: 'The four continuous chronological phases of an empowered student budget month: Inflow, Pay Yourself First, Fixed Bills, and Controlled Weekly Discretionary.',
    keyTakeaway: 'Automating your savings on Day 2 removes the temptation to spend money that was meant for your future.',
    svgType: 'cycle',
  },
  {
    id: 'info-4',
    title: 'The 30-Day Student Micro-Saving Challenge',
    topic: 'Challenges',
    tag: 'Habit Builder',
    altText: 'Gamified calendar matrix showing incremental daily micro savings starting from 1 dollar on day 1 to 30 dollars on day 30',
    caption: 'A gamified calendar habit challenge that accumulates $465 in 30 days simply by skipping one takeout beverage or takeaway meal each day.',
    keyTakeaway: 'Consistency matters infinitely more than initial capital when training your personal saving reflex.',
    svgType: 'challenge',
  },
  {
    id: 'info-5',
    title: 'The Magic of Early Student Compound Growth',
    topic: 'Savings',
    tag: 'Wealth Velocity',
    altText: 'Exponential growth curve contrasting saving 50 dollars per month starting at age 19 versus age 29',
    caption: 'Visual exponential trajectory demonstrating how saving just $50/month during college yields over $120,000 by retirement thanks to compound returns.',
    keyTakeaway: 'Time in the market is young people’s greatest financial advantage—start early with whatever pocket change you have.',
    svgType: 'compound',
  },
];

export default function InfographicsGalleryModule() {
  const [selectedTopic, setSelectedTopic] = useState<'All' | 'Budgeting' | 'Needs/Wants' | 'Savings' | 'Challenges'>('All');

  const filteredItems = selectedTopic === 'All'
    ? INFOGRAPHICS
    : INFOGRAPHICS.filter((item) => item.topic === selectedTopic);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
          <Image size={14} /> SRS Requirement 1.6.7
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Infographics & Visual Learning Gallery
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Explore high-fidelity infographics illustrating personal budgeting fundamentals, decision pathways, and money habit challenges. Filter by topic to study specific financial concepts.
            </p>
          </div>

          {/* Topic Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-2xl self-start sm:self-auto text-xs font-semibold">
            {(['All', 'Budgeting', 'Needs/Wants', 'Savings', 'Challenges'] as const).map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 overflow-hidden shadow-xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            {/* Visual SVG Graphic Container */}
            <div className="w-full h-56 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 flex items-center justify-center relative overflow-hidden text-white">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

              {/* Graphic Rendering based on svgType */}
              {card.svgType === 'pie' && (
                <div className="relative z-10 flex items-center gap-6">
                  <div className="relative w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center p-2">
                    <div className="w-full h-full rounded-full border-4 border-cyan-400 border-t-amber-400 border-r-emerald-400 animate-spin-slow" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-mono text-slate-400">RATIO</span>
                      <span className="text-sm font-black font-mono text-amber-400">50/30/20</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span>50% Needs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>30% Wants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>20% Savings</span>
                    </div>
                  </div>
                </div>
              )}

              {card.svgType === 'tree' && (
                <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-2 text-xs font-mono">
                  <div className="px-3 py-1 rounded-lg bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold">
                    Need or Want?
                  </div>
                  <div className="w-0.5 h-3 bg-white/20" />
                  <div className="grid grid-cols-2 gap-4 w-full text-center">
                    <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-200">
                      ✓ Need: Buy Now
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200">
                      ✗ Want: Wait 48H
                    </div>
                  </div>
                </div>
              )}

              {card.svgType === 'cycle' && (
                <div className="relative z-10 flex items-center justify-around w-full text-center text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400">
                    Day 1<br />Inflow
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400">
                    Day 2<br />Pay Savings
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400">
                    Day 5<br />Fixed Bills
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400">
                    Day 6-30<br />Weekly Wants
                  </div>
                </div>
              )}

              {card.svgType === 'challenge' && (
                <div className="relative z-10 w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400">30-Day Target</span>
                    <span className="font-bold text-white">$465 Saved</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                          i < 7 ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 text-center font-mono">
                    Daily Micro-Savings Habit Streak
                  </div>
                </div>
              )}

              {card.svgType === 'compound' && (
                <div className="relative z-10 w-full max-w-xs space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-cyan-400">$50/mo @ Age 19</span>
                    <span className="text-emerald-400 font-bold">$124,000+</span>
                  </div>
                  <div className="h-16 w-full flex items-end gap-1.5 pt-2">
                    <div className="w-1/5 h-20% bg-cyan-500/40 rounded-t" />
                    <div className="w-1/5 h-35% bg-cyan-500/60 rounded-t" />
                    <div className="w-1/5 h-55% bg-cyan-500/80 rounded-t" />
                    <div className="w-1/5 h-75% bg-cyan-400 rounded-t" />
                    <div className="w-1/5 h-100% bg-emerald-400 rounded-t shadow-lg shadow-emerald-400/30" />
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">
                    Exponential compounding over 35 years
                  </div>
                </div>
              )}
            </div>

            {/* Description & Captions */}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  {card.tag}
                </span>
                <span className="text-xs font-medium text-slate-400">{card.topic}</span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {card.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {card.caption}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
                <strong className="text-amber-600 dark:text-amber-400">Core Takeaway:</strong>{' '}
                {card.keyTakeaway}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
