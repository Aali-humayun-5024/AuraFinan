// BudgetBasics — Master Top Navigation Bar (Linear / Apple Pro Design)
// Fully Responsive: Adaptive Icon + Short-Form Text, Auto-Collapsing Breakpoints,
// Floating Pill Hover/Active Highlights, and Native-Style Mobile Sheet.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Compass,
  MessageSquare,
  Sparkles,
  Home,
  GraduationCap,
  Briefcase,
  UserPlus,
  Scale,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  Check,
  Command,
} from 'lucide-react';
import { useAppStore, type CurrencyCode } from '../store/useAppStore';
import { useTranslation } from '../i18n/useTranslation';
import { playClickSound, playToggleSound } from '../services/soundService';
import VoiceTriggerButton from './voice/VoiceTriggerButton';
import confetti from 'canvas-confetti';
import { seedPersona } from '../data/seedData';

const PERSONA_OPTIONS = [
  {
    id: 'student' as const,
    label: 'College Student',
    shortLabel: 'Student',
    icon: GraduationCap,
    desc: 'Pocket allowance, canteen, hostel & books',
    emoji: '🎓',
  },
  {
    id: 'freelancer' as const,
    label: 'Tech Freelancer',
    shortLabel: 'Freelancer',
    icon: Briefcase,
    desc: 'Multi-currency, remote contracts, software',
    emoji: '💼',
  },
  {
    id: 'household' as const,
    label: 'Family Household',
    shortLabel: 'Family',
    icon: Home,
    desc: 'Monthly rashan, utility bills & family savings',
    emoji: '🏠',
  },
  {
    id: 'clean' as const,
    label: 'Clean Slate',
    shortLabel: 'Clean',
    icon: UserPlus,
    desc: 'Start fresh with zero mock transactions',
    emoji: '✨',
  },
];

// Short-form punchy navigation items with crisp icons
const PRIMARY_NAV = [
  {
    id: 'dashboard',
    shortLabel: 'Home',
    fullTitle: 'Home Dashboard',
    icon: Home,
    desktopText: 'block', // Always show text on desktop
  },
  {
    id: '50-30-20',
    shortLabel: '50/30/20',
    fullTitle: '50/30/20 Budget Rule & Calculator',
    icon: PieChart,
    isFeatured: true,
    desktopText: 'block',
  },
  {
    id: 'budgeting-basics',
    shortLabel: 'Basics',
    fullTitle: 'Budgeting Basics 101 & Quiz',
    icon: BookOpen,
    desktopText: 'hidden lg:inline',
  },
  {
    id: 'needs-vs-wants',
    shortLabel: 'Needs/Wants',
    fullTitle: 'Needs vs Wants Decision Game',
    icon: ShieldCheck,
    desktopText: 'hidden xl:inline',
  },
  {
    id: 'savings-goals',
    shortLabel: 'Goals',
    fullTitle: 'Savings Goals & Timeline Estimator',
    icon: Target,
    desktopText: 'hidden xl:inline',
  },
  {
    id: 'expense-planner',
    shortLabel: 'Planner',
    fullTitle: 'Student Expense Planner',
    icon: Receipt,
    desktopText: 'hidden 2xl:inline',
  },
  {
    id: 'money-mistakes',
    shortLabel: 'Mistakes',
    fullTitle: 'Common Money Mistakes to Avoid',
    icon: AlertTriangle,
    desktopText: 'hidden 2xl:inline',
  },
  {
    id: 'infographics',
    shortLabel: 'Gallery',
    fullTitle: 'Visual Learning Gallery',
    icon: Image,
    desktopText: 'hidden 2xl:inline',
  },
  {
    id: 'ai-chatbot',
    shortLabel: 'AI Bot',
    fullTitle: 'AI Budget Assistant (BudgetBee)',
    icon: Bot,
    desktopText: 'hidden 2xl:inline',
  },
];

export default function Navbar() {
  const {
    activeView,
    setActiveView,
    activePersona,
    setActivePersona,
    baseCurrency,
    setBaseCurrency,
    theme,
    toggleTheme,
    setCommandPaletteOpen,
    setSiteMapModalOpen,
  } = useAppStore();

  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on Escape or Outside Click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreToolsOpen(false);
        setPersonaMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePersonaChange = async (pId: 'student' | 'freelancer' | 'household' | 'clean') => {
    await seedPersona(pId);
    setActivePersona(pId);
    if (pId === 'household') {
      setBaseCurrency('PKR');
    }
    setPersonaMenuOpen(false);
    playClickSound();

    if (pId !== 'clean') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.1 },
      });
    }
  };

  const currentPersonaObj = PERSONA_OPTIONS.find((p) => p.id === activePersona) || PERSONA_OPTIONS[0];

  const navigateTo = (viewId: string) => {
    playClickSound();
    setActiveView(viewId);
    setMoreToolsOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#070A13]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-colors duration-200">
      <div className="w-full px-3 sm:px-5 lg:px-6 h-15 flex items-center justify-between gap-2">
        {/* ─── 1. Brand Logo Lockup ─── */}
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 group py-1"
          title="BudgetBasics — NextGen BudgetBee"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            🐝
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-none">
                BudgetBasics
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                v1.0
              </span>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-400 tracking-wider uppercase leading-tight mt-0.5 hidden xs:inline">
              BudgetBee
            </span>
          </div>
        </div>

        {/* ─── 2. Adaptive Desktop Dock (md:flex) ─── */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200/70 dark:border-white/[0.06] text-xs font-semibold"
        >
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isFeatured = item.isFeatured;

            if (isFeatured) {
              // 🌟 50/30/20 Rule: Prominent pill button with amber glow
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  title={item.fullTitle}
                  className={`relative px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Icon size={14} className="animate-pulse shrink-0" />
                  <span className="tracking-tight">{item.shortLabel}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping hidden lg:inline" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                title={item.fullTitle}
                className={`relative px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold shadow-xs border border-slate-200/90 dark:border-white/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                <span className={item.desktopText}>{item.shortLabel}</span>
              </button>
            );
          })}

          {/* 📂 "More ▾" Dropdown for Institutional/Advanced Features */}
          <div className="relative">
            <button
              onClick={() => setMoreToolsOpen(!moreToolsOpen)}
              className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="Advanced Features & Tools"
            >
              <Layers size={14} className="text-slate-400" />
              <span className="hidden xl:inline">More</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${moreToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {moreToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 space-y-0.5"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Advanced Wealth Suite
                  </div>

                  <button
                    onClick={() => navigateTo('general-ledger')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <BookOpen size={14} className="text-cyan-500" />
                    <div>
                      <div className="font-semibold">General Ledger (GAAP)</div>
                      <div className="text-[10px] text-slate-400">Double-entry debit & credit balance</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('academic-suite')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <GraduationCap size={14} className="text-purple-500" />
                    <div>
                      <div className="font-semibold">Academic CPA Labs</div>
                      <div className="text-[10px] text-slate-400">Break-even simulations & variance</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('daily-bazaar')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Receipt size={14} className="text-emerald-500" />
                    <div>
                      <div className="font-semibold">Daily Bazaar & Rashan</div>
                      <div className="text-[10px] text-slate-400">Commodity prices & kameti tracker</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('split-ledger')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Users size={14} className="text-amber-500" />
                    <div>
                      <div className="font-semibold">Split Ledger & Roommate IOUs</div>
                      <div className="text-[10px] text-slate-400">Dormitory bill dividing & settlements</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('subscriptions')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <CreditCard size={14} className="text-rose-500" />
                    <div>
                      <div className="font-semibold">Subscriptions Sentinel</div>
                      <div className="text-[10px] text-slate-400">Detect zombie trial renewals</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                  <button
                    onClick={() => navigateTo('settings')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <div>
                      <div className="font-semibold">Settings & Encrypted Vault</div>
                      <div className="text-[10px] text-slate-400">AES-GCM-256 backup & statements</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* ─── 3. Right Action Cluster (Search, Persona, Currency, Theme) ─── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Search Button (⌘K) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs cursor-pointer"
            title="Search & Command Palette (⌘K)"
          >
            <Search size={14} />
            <kbd className="hidden lg:inline text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* 👤 Student Persona Switcher (Clean Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 hover:border-amber-400 bg-white/60 dark:bg-white/[0.04] transition-all text-xs font-semibold cursor-pointer"
              title="Switch Learning Persona"
            >
              <span className="text-sm leading-none">{currentPersonaObj.emoji}</span>
              <span className="hidden sm:inline text-slate-800 dark:text-slate-200">
                {currentPersonaObj.shortLabel}
              </span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {/* Persona Switch Menu */}
            <AnimatePresence>
              {personaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Select Student Persona
                  </div>

                  {PERSONA_OPTIONS.map((p) => {
                    const isSelected = activePersona === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handlePersonaChange(p.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{p.emoji}</span>
                          <div>
                            <div className="font-bold leading-tight">{p.label}</div>
                            <div className="text-[10px] text-slate-400 leading-tight">{p.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-amber-500 shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Currency Pill Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-white/[0.05] p-0.5 rounded-xl text-xs font-mono font-bold">
            {(['USD', 'PKR', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setBaseCurrency(cur)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer text-[11px] ${
                  baseCurrency === cur
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cur === 'USD' ? '$' : cur === 'PKR' ? '₨' : cur === 'EUR' ? '€' : '£'}
              </button>
            ))}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Toggle Dark / Light Mode"
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          {/* Voice Assistant Mic */}
          <div className="hidden sm:block">
            <VoiceTriggerButton />
          </div>

          {/* Feedback & About Shortcut */}
          <button
            onClick={() => navigateTo('feedback-contact')}
            className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Feedback & About Us (SRS 1.6.10)"
          >
            <MessageSquare size={15} />
          </button>

          {/* Mobile Hamburger Toggle (md:hidden) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── 4. Professional Mobile & Tablet Slide-Down Sheet (md:hidden) ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-slate-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-[#070A13]/95 backdrop-blur-2xl px-4 py-5 space-y-5 max-h-[85vh] overflow-y-auto"
          >
            {/* Featured 50/30/20 Rule Banner in Mobile */}
            <div
              onClick={() => navigateTo('50-30-20')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <PieChart size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>50/30/20 Rule & Calculator</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                      CORE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Divide your monthly allowance into Needs, Wants & Savings
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Core Educational Modules */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Core Budgeting Modules
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Home size={15} className="text-cyan-500" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => navigateTo('budgeting-basics')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'budgeting-basics'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen size={15} className="text-cyan-500" />
                  <span>Basics & Quiz</span>
                </button>

                <button
                  onClick={() => navigateTo('needs-vs-wants')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'needs-vs-wants'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>Needs vs Wants</span>
                </button>

                <button
                  onClick={() => navigateTo('savings-goals')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'savings-goals'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Target size={15} className="text-indigo-500" />
                  <span>Savings Goals</span>
                </button>

                <button
                  onClick={() => navigateTo('expense-planner')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'expense-planner'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Receipt size={15} className="text-rose-500" />
                  <span>Expense Planner</span>
                </button>

                <button
                  onClick={() => navigateTo('money-mistakes')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'money-mistakes'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <AlertTriangle size={15} className="text-yellow-500" />
                  <span>Money Mistakes</span>
                </button>

                <button
                  onClick={() => navigateTo('infographics')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'infographics'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Image size={15} className="text-purple-500" />
                  <span>Infographics</span>
                </button>

                <button
                  onClick={() => navigateTo('ai-chatbot')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    activeView === 'ai-chatbot'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Bot size={15} className="text-cyan-500" />
                  <span>AI BudgetBee</span>
                </button>
              </div>
            </div>

            {/* Section 2: Advanced Power Tools */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Advanced Tools & Accounting
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => navigateTo('general-ledger')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <BookOpen size={14} className="text-blue-500" />
                  <span>General Ledger</span>
                </button>
                <button
                  onClick={() => navigateTo('academic-suite')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <GraduationCap size={14} className="text-purple-500" />
                  <span>CPA Labs</span>
                </button>
                <button
                  onClick={() => navigateTo('daily-bazaar')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Receipt size={14} className="text-emerald-500" />
                  <span>Daily Bazaar</span>
                </button>
                <button
                  onClick={() => navigateTo('split-ledger')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Users size={14} className="text-amber-500" />
                  <span>Bill Split & IOUs</span>
                </button>
                <button
                  onClick={() => navigateTo('subscriptions')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <CreditCard size={14} className="text-rose-500" />
                  <span>Subscriptions</span>
                </button>
                <button
                  onClick={() => navigateTo('settings')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Settings size={14} className="text-slate-400" />
                  <span>Settings & Vault</span>
                </button>
              </div>
            </div>

            {/* Quick Preferences Toolbar */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => navigateTo('feedback-contact')}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-500"
              >
                <MessageSquare size={14} />
                <span>Feedback & About</span>
              </button>
              <button
                onClick={() => {
                  setSiteMapModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-500"
              >
                <Compass size={14} />
                <span>Visual Sitemap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
