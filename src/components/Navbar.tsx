// BudgetBasics — Master Top Navigation Bar
// Replaces previous sidebar with a full-width, publication-grade responsive navigation header.
// Exposes the 50/30/20 Rule prominently outside on the navbar, with quick links to all SRS modules
// and an expandable "More Tools" dropdown for advanced systems.

import React, { useState } from 'react';
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
  Volume2,
  VolumeX,
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
    icon: GraduationCap,
    desc: 'Pocket allowance, canteen, hostel & books',
    emoji: '🎓',
  },
  {
    id: 'freelancer' as const,
    label: 'Tech Freelancer',
    icon: Briefcase,
    desc: 'Multi-currency, remote contracts, software',
    emoji: '💼',
  },
  {
    id: 'household' as const,
    label: 'Family Household',
    icon: Home,
    desc: 'Monthly rashan, utility bills & family savings',
    emoji: '🏠',
  },
  {
    id: 'clean' as const,
    label: 'Clean Slate',
    icon: UserPlus,
    desc: 'Start fresh with zero mock transactions',
    emoji: '✨',
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
    soundEnabled,
    toggleSound,
    setCommandPaletteOpen,
    setSiteMapModalOpen,
  } = useAppStore();

  const { t } = useTranslation();

  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaLoading, setPersonaLoading] = useState(false);

  const handlePersonaChange = async (pId: 'student' | 'freelancer' | 'household' | 'clean') => {
    setPersonaLoading(true);
    await seedPersona(pId);
    setActivePersona(pId);
    if (pId === 'household') {
      setBaseCurrency('PKR');
    }
    setPersonaLoading(false);
    setPersonaMenuOpen(false);

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
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#060913]/90 backdrop-blur-2xl border-b border-slate-200/90 dark:border-white/[0.08] shadow-xs">
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-2 lg:gap-4">
        {/* ─── 1. Brand Logo Lockup ─── */}
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-500/25">
            🐝
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                BudgetBasics
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                SRS v1.0
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
              NextGen BudgetBee
            </span>
          </div>
        </div>

        {/* ─── 2. Desktop Navigation Links (SRS Modules + 50-30-20 OUTSIDE) ─── */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
          {/* Home */}
          <button
            onClick={() => navigateTo('dashboard')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Home size={14} /> Home
          </button>

          {/* 🌟 50-30-20 RULE — PROMINENTLY OUTSIDE ON NAVBAR AS REQUESTED */}
          <button
            onClick={() => navigateTo('50-30-20')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border font-bold cursor-pointer shadow-xs ${
              activeView === '50-30-20'
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            <PieChart size={15} className="animate-pulse" />
            <span>50-30-20 Rule</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 uppercase font-mono">
              Core
            </span>
          </button>

          {/* Budgeting Basics */}
          <button
            onClick={() => navigateTo('budgeting-basics')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'budgeting-basics'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen size={14} /> Basics
          </button>

          {/* Needs vs Wants */}
          <button
            onClick={() => navigateTo('needs-vs-wants')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'needs-vs-wants'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <ShieldCheck size={14} /> Needs vs Wants
          </button>

          {/* Savings Goals */}
          <button
            onClick={() => navigateTo('savings-goals')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'savings-goals'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Target size={14} /> Goals
          </button>

          {/* Expense Planner */}
          <button
            onClick={() => navigateTo('expense-planner')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'expense-planner'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Receipt size={14} /> Expense Planner
          </button>

          {/* Money Mistakes */}
          <button
            onClick={() => navigateTo('money-mistakes')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'money-mistakes'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <AlertTriangle size={14} /> Mistakes
          </button>

          {/* Infographics */}
          <button
            onClick={() => navigateTo('infographics')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'infographics'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Image size={14} /> Infographics
          </button>

          {/* AI Chatbot */}
          <button
            onClick={() => navigateTo('ai-chatbot')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'ai-chatbot'
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Bot size={14} /> AI Chatbot
          </button>

          {/* 📂 MORE TOOLS DROPDOWN (Advanced modules per SRS scope) */}
          <div className="relative">
            <button
              onClick={() => setMoreToolsOpen(!moreToolsOpen)}
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all flex items-center gap-1 cursor-pointer"
            >
              <Layers size={14} />
              <span>More Tools</span>
              <ChevronDown size={13} className={`transition-transform ${moreToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {moreToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl p-2 z-50 space-y-1"
                >
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Advanced Accounting & Wealth
                  </div>

                  <button
                    onClick={() => navigateTo('general-ledger')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <BookOpen size={15} className="text-cyan-500" />
                    <div>
                      <div className="font-semibold">General Ledger (GAAP)</div>
                      <div className="text-[10px] text-slate-400">Double-entry debit & credit balance</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('academic-suite')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <GraduationCap size={15} className="text-purple-500" />
                    <div>
                      <div className="font-semibold">Academic CPA Labs</div>
                      <div className="text-[10px] text-slate-400">Break-even simulations & variance</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('daily-bazaar')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Receipt size={15} className="text-emerald-500" />
                    <div>
                      <div className="font-semibold">Daily Bazaar & Rashan</div>
                      <div className="text-[10px] text-slate-400">South Asian commodities & kameti</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('split-ledger')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Users size={15} className="text-amber-500" />
                    <div>
                      <div className="font-semibold">Split Ledger & Roommate IOUs</div>
                      <div className="text-[10px] text-slate-400">Dormitory bill dividing & settlements</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('subscriptions')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <CreditCard size={15} className="text-rose-500" />
                    <div>
                      <div className="font-semibold">Subscriptions Sentinel</div>
                      <div className="text-[10px] text-slate-400">Detect zombie trial renewals</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('settings')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Settings size={15} className="text-slate-400" />
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

        {/* ─── 3. Right Action Utilities (Profile, Search, Currency, Theme) ─── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => navigateTo('search-resources')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Search Learning Resources"
          >
            <Search size={16} />
          </button>

          {/* 👤 EASY STUDENT PERSONA SWITCHER (SRS & User Request) */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-amber-400 bg-slate-50 dark:bg-white/[0.04] transition-all text-xs font-semibold cursor-pointer"
            >
              <span className="text-sm">{currentPersonaObj.emoji}</span>
              <span className="hidden sm:inline text-slate-800 dark:text-slate-200">
                {currentPersonaObj.label}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {/* Persona Switch Dropdown */}
            <AnimatePresence>
              {personaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl p-2 z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Select Your Learning Persona
                  </div>

                  {PERSONA_OPTIONS.map((p) => {
                    const isSelected = activePersona === p.id;
                    const Icon = p.icon;

                    return (
                      <button
                        key={p.id}
                        onClick={() => handlePersonaChange(p.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{p.emoji}</span>
                          <div>
                            <div className="font-bold">{p.label}</div>
                            <div className="text-[10px] text-slate-400">{p.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={15} className="text-amber-500 shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Currency Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl text-xs font-mono font-bold">
            {(['USD', 'PKR', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setBaseCurrency(cur)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  baseCurrency === cur
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cur === 'USD' ? '$' : cur === 'PKR' ? '₨' : cur === 'EUR' ? '€' : '£'}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Toggle Dark / Light Mode"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          {/* Voice Assistant Trigger */}
          <div className="hidden sm:block">
            <VoiceTriggerButton />
          </div>

          {/* Feedback & Contact Link */}
          <button
            onClick={() => navigateTo('feedback-contact')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Feedback & About Us"
          >
            <MessageSquare size={16} />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── Mobile / Tablet Dropdown Menu ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => navigateTo('dashboard')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <Home size={15} /> Home
              </button>
              <button
                onClick={() => navigateTo('50-30-20')}
                className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-left flex items-center gap-2 font-bold"
              >
                <PieChart size={15} /> 50-30-20 Rule
              </button>
              <button
                onClick={() => navigateTo('budgeting-basics')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <BookOpen size={15} /> Budgeting Basics
              </button>
              <button
                onClick={() => navigateTo('needs-vs-wants')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <ShieldCheck size={15} /> Needs vs Wants
              </button>
              <button
                onClick={() => navigateTo('savings-goals')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <Target size={15} /> Savings Goals
              </button>
              <button
                onClick={() => navigateTo('expense-planner')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <Receipt size={15} /> Expense Planner
              </button>
              <button
                onClick={() => navigateTo('money-mistakes')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <AlertTriangle size={15} /> Money Mistakes
              </button>
              <button
                onClick={() => navigateTo('infographics')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <Image size={15} /> Infographics
              </button>
              <button
                onClick={() => navigateTo('ai-chatbot')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <Bot size={15} /> AI Chatbot
              </button>
              <button
                onClick={() => navigateTo('feedback-contact')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-left flex items-center gap-2"
              >
                <MessageSquare size={15} /> Feedback / About
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
