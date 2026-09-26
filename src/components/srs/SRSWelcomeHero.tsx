// BudgetBasics — SRS Welcome Hero & Core Functions Command Grid
// Complies with TechWiz 7 SRS Sections 1.1, 1.2, 1.6:
// - Clear welcome banner & project tagline ('NextGen BudgetBee')
// - Explains website purpose to any new user immediately
// - Displays links & cards to ALL main SRS functions in home hero
// - Quick 1-click persona switcher (Student, Freelancer, Household, Clean)

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  BookOpen,
  ShieldCheck,
  Target,
  Receipt,
  AlertTriangle,
  Image,
  Bot,
  Search,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Home,
  UserPlus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { seedPersona } from '../../data/seedData';
import { playClickSound, playSuccessSound } from '../../services/soundService';
import confetti from 'canvas-confetti';

export default function SRSWelcomeHero() {
  const {
    activeView,
    setActiveView,
    activePersona,
    setActivePersona,
    setBaseCurrency,
    setSiteMapModalOpen,
  } = useAppStore();

  const handlePersonaSelect = async (persona: 'student' | 'freelancer' | 'household' | 'clean') => {
    playClickSound();
    await seedPersona(persona);
    setActivePersona(persona);
    if (persona === 'household') {
      setBaseCurrency('PKR');
    }
    playSuccessSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 },
    });
  };

  const jumpTo = (viewId: string) => {
    playClickSound();
    setActiveView(viewId);
  };

  const SRS_CORE_FUNCTIONS = [
    {
      id: '50-30-20',
      title: '50/30/20 Budget Rule',
      badge: 'Core Golden Ratio',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      description: 'Enter your monthly allowance to calculate 50% Needs, 30% Wants, and 20% Savings with interactive charts.',
      icon: PieChart,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      id: 'budgeting-basics',
      title: 'Budgeting Basics 101',
      badge: 'Interactive Quiz',
      badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      description: 'Learn income, fixed vs. variable expenses, inspect a sample student budget table, and test your knowledge.',
      icon: BookOpen,
      accent: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'needs-vs-wants',
      title: 'Needs vs. Wants Game',
      badge: 'Decision Guide',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      description: 'Classify sample expenses as Needs or Wants with instant explanations and a 4-step cool-off flowchart.',
      icon: ShieldCheck,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'savings-goals',
      title: 'Savings Goals Tracker',
      badge: 'Timeline Estimator',
      badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      description: 'Define target amounts, monthly contributions, and estimate exactly how many months until 100% completion.',
      icon: Target,
      accent: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'expense-planner',
      title: 'Student Expense Planner',
      badge: 'Session Ledger',
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      description: 'Add daily expenses across 7 student categories, edit or remove entries, and watch your remaining balance.',
      icon: Receipt,
      accent: 'from-rose-500 to-pink-500',
    },
    {
      id: 'money-mistakes',
      title: 'Common Money Mistakes',
      badge: 'Action Guides',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      description: 'Expand realistic student scenarios covering impulse purchases, late penalties, and zombie subscriptions.',
      icon: AlertTriangle,
      accent: 'from-yellow-500 to-amber-600',
    },
    {
      id: 'infographics',
      title: 'Visual Learning Gallery',
      badge: 'Original Graphics',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      description: 'High-res visual charts illustrating monthly cash cycles, 30-day savings challenges, and compounding curves.',
      icon: Image,
      accent: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'ai-chatbot',
      title: 'AI Chatbot (BudgetBee)',
      badge: 'Interactive Q&A',
      badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      description: 'Get immediate student finance answers with suggested prompt chips and educational guidance.',
      icon: Bot,
      accent: 'from-cyan-500 to-teal-500',
    },
    {
      id: 'search-resources',
      title: 'Search & Topic Filter',
      badge: 'Resource Library',
      badgeColor: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
      description: 'Search financial learning content by keywords (savings, needs, mistakes) and filter by topic.',
      icon: Search,
      accent: 'from-slate-600 to-slate-800',
    },
    {
      id: 'feedback-contact',
      title: 'Feedback & About Us',
      badge: 'Validated Form',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      description: 'Submit client-side validated feedback with 5-star ratings, explore project background, and contact our team.',
      icon: MessageSquare,
      accent: 'from-emerald-600 to-cyan-600',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* ─── 1. Welcome Banner & Value Proposition (SRS 1.1, 1.2, 1.6) ─── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-yellow-500/5 dark:from-amber-950/30 dark:via-[#0c1222] dark:to-yellow-950/20 border border-amber-500/30 shadow-xs relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
              🐝 NextGen BudgetBee
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            BudgetBasics — Master Your Student Finances
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
            Welcome to <strong>BudgetBasics</strong>! Designed specifically for high school learners, college students, and beginners in personal finance. Easily divide your monthly allowance using the <strong>50/30/20 rule</strong>, distinguish essential needs from lifestyle wants, track your savings milestones, and prevent common money mistakes—with zero login friction.
          </p>

          {/* Quick Actions & Sitemap Link */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setSiteMapModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Compass size={14} /> View Visual Sitemap
            </button>
          </div>
        </div>

        {/* ─── Easy 1-Click Student Profile Switcher (SRS Persona Selector) ─── */}
        <div className="mt-6 pt-5 border-t border-amber-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" /> Quick-Start Student Profiles (1-Click Switch):
            </span>
            <span className="text-[11px] text-slate-400">Instantly pre-loads realistic allowance data</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. High School Student */}
            <button
              onClick={() => handlePersonaSelect('student')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePersona === 'student'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-amber-400 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="text-xs font-bold leading-tight">College Student</span>
              </div>
              <p className={`text-[10px] mt-1 line-clamp-1 ${activePersona === 'student' ? 'text-slate-900' : 'text-slate-400'}`}>
                Allowance, canteen & books
              </p>
            </button>

            {/* 2. Global Freelancer */}
            <button
              onClick={() => handlePersonaSelect('freelancer')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePersona === 'freelancer'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-amber-400 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                <span className="text-xs font-bold leading-tight">Tech Freelancer</span>
              </div>
              <p className={`text-[10px] mt-1 line-clamp-1 ${activePersona === 'freelancer' ? 'text-slate-900' : 'text-slate-400'}`}>
                Remote contracts & SaaS
              </p>
            </button>

            {/* 3. Family Household */}
            <button
              onClick={() => handlePersonaSelect('household')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePersona === 'household'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-amber-400 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <span className="text-xs font-bold leading-tight">Family Household</span>
              </div>
              <p className={`text-[10px] mt-1 line-clamp-1 ${activePersona === 'household' ? 'text-slate-900' : 'text-slate-400'}`}>
                Monthly rashan & utilities
              </p>
            </button>

            {/* 4. Clean Slate */}
            <button
              onClick={() => handlePersonaSelect('clean')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePersona === 'clean'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-amber-400 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-xs font-bold leading-tight">Clean Slate</span>
              </div>
              <p className={`text-[10px] mt-1 line-clamp-1 ${activePersona === 'clean' ? 'text-slate-900' : 'text-slate-400'}`}>
                Start fresh with $0
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. All Main SRS Functions Navigation Grid (SRS Requirement) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Core Educational Modules & Calculators
          </h2>
          <span className="text-xs font-semibold text-slate-400">10 Core Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {SRS_CORE_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <div
                key={item.id}
                onClick={() => jumpTo(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 hover:border-amber-400 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.accent} flex items-center justify-center text-white font-bold shadow-xs`}>
                      <Icon size={16} />
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <span>Open Module</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
