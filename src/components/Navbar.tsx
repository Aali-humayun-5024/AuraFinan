// BudgetBasics — Master Pro Navigation Bar (Linear / Apple Sequoia Design System)
// Features: Floating Glass Island, Fluid Spring Active Pill (layoutId),
// Multi-Tier Adaptive Breakpoints, 50/30/20 Radiant Golden Capsule, and iOS Dynamic Sheet.

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
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  Check,
  Zap,
} from 'lucide-react';
import { useAppStore, type CurrencyCode } from '../store/useAppStore';
import { playClickSound } from '../services/soundService';
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

// Adaptive Prioritized Navigation Modules
const NAV_MODULES = [
  {
    id: 'dashboard',
    shortLabel: 'Home',
    fullTitle: 'Home Workstation',
    icon: Home,
    tier: 'core', // Always shows text on desktop
  },
  {
    id: '50-30-20',
    shortLabel: '50/30/20',
    fullTitle: '50/30/20 Budget Rule & Calculator',
    icon: PieChart,
    isFeatured: true,
    tier: 'core',
  },
  {
    id: 'budgeting-basics',
    shortLabel: 'Basics',
    fullTitle: 'Budgeting Basics 101 & Interactive Quiz',
    icon: BookOpen,
    tier: 'core',
  },
  {
    id: 'needs-vs-wants',
    shortLabel: 'Needs/Wants',
    fullTitle: 'Needs vs Wants Classification Game',
    icon: ShieldCheck,
    tier: 'secondary', // Text on lg+, icon on md
  },
  {
    id: 'savings-goals',
    shortLabel: 'Goals',
    fullTitle: 'Savings Goals & Timeline Estimator',
    icon: Target,
    tier: 'secondary',
  },
  {
    id: 'expense-planner',
    shortLabel: 'Planner',
    fullTitle: 'Student Expense Planner Ledger',
    icon: Receipt,
    tier: 'tertiary', // Text on xl+, icon on md/lg
  },
  {
    id: 'money-mistakes',
    shortLabel: 'Mistakes',
    fullTitle: 'Common Student Money Mistakes',
    icon: AlertTriangle,
    tier: 'tertiary',
  },
  {
    id: 'infographics',
    shortLabel: 'Gallery',
    fullTitle: 'Visual Learning Infographics',
    icon: Image,
    tier: 'extended', // Text on 2xl+, icon on xl
  },
  {
    id: 'ai-chatbot',
    shortLabel: 'AI Bot',
    fullTitle: 'AI Student Assistant (BudgetBee)',
    icon: Bot,
    tier: 'extended',
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
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Close overlays on Escape key
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
    <div className="sticky top-0 z-40 w-full px-2 sm:px-4 py-2 pointer-events-none transition-all duration-200">
      {/* ─── Floating Glass Capsule Header (Apple Sequoia / Linear Style - 58px Toolbar) ─── */}
      <header className="pointer-events-auto max-w-7xl mx-auto h-[58px] px-3 sm:px-4 rounded-2xl bg-white/90 dark:bg-[#070A13]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg shadow-black/[0.03] dark:shadow-black/40 flex items-center justify-between gap-2 lg:gap-3 transition-all duration-300">
        
        {/* ─── 1. Brand Logo Lockup ─── */}
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
          title="BudgetBasics — Personal Finance & Student Budgeting"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigateTo('dashboard');
            }
          }}
        >
          <div className="relative w-[34px] h-[34px] rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-base shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            🐝
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070A13]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white whitespace-nowrap leading-none">
              BudgetBasics
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[5px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap leading-none">
              v1.0
            </span>
          </div>
        </div>

        {/* ─── 2. Adaptive Desktop Navigation Dock (md:flex) ─── */}
        <nav
          aria-label="Main Navigation Dock"
          onMouseLeave={() => setHoveredNav(null)}
          className="hidden md:flex items-center gap-0.5 xl:gap-1 bg-slate-100/80 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200/70 dark:border-white/[0.06] shrink min-w-0"
        >
          {NAV_MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isFeatured = item.isFeatured;

            // Responsive label tiering: guarantees no overflow across 768px -> 1920px
            const textVisibilityClass =
              item.tier === 'core'
                ? 'inline'
                : item.tier === 'secondary'
                ? 'hidden xl:inline'
                : 'hidden 2xl:inline';

            if (isFeatured) {
              // 🌟 50/30/20 Rule: Flagship Calculator Highlight Tab
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  title={item.fullTitle}
                  className={`h-[34px] px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 font-bold text-xs ${
                    isActive
                      ? 'bg-amber-100/90 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 shadow-xs'
                      : 'text-amber-800 dark:text-amber-300/90 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 font-semibold'
                  }`}
                >
                  <Icon size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="tracking-tight">{item.shortLabel}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 hidden sm:inline" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                title={item.fullTitle}
                className={`relative h-[34px] px-2 xl:px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 z-10 text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? 'text-slate-950 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                }`}
              >
                {/* Floating Active Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-sliding-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-200/90 dark:border-white/10 -z-10"
                  />
                )}

                <Icon
                  size={14}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}
                />
                <span className={textVisibilityClass}>{item.shortLabel}</span>
              </button>
            );
          })}

          {/* 📂 "More ▾" Dropdown Hub */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMoreToolsOpen(!moreToolsOpen)}
              className={`h-[34px] px-2 xl:px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 text-xs font-medium whitespace-nowrap ${
                moreToolsOpen
                  ? 'bg-slate-200/70 dark:bg-white/[0.08] text-slate-950 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
              }`}
              title="Advanced Features & Tools"
              aria-expanded={moreToolsOpen}
            >
              <Layers size={14} className="shrink-0 text-slate-400" />
              <span className="hidden xl:inline">More</span>
              <ChevronDown
                size={12}
                className={`shrink-0 transition-transform duration-200 ${moreToolsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {moreToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl"
                >
                  <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Advanced Institutional Suite
                  </div>

                  <button
                    onClick={() => navigateTo('general-ledger')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <BookOpen size={14} className="text-cyan-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Accounting Simulator (Ledger)</div>
                      <div className="text-[10px] text-slate-400">Commerce lab: Double-entry $Dr = $Cr</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('daily-bazaar')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Receipt size={14} className="text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Daily Bazaar & Rashan</div>
                      <div className="text-[10px] text-slate-400">Commodity prices & kameti</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('split-ledger')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Users size={14} className="text-amber-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Split Ledger & Roommate IOUs</div>
                      <div className="text-[10px] text-slate-400">Dorm bill dividing & settlements</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigateTo('subscriptions')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <CreditCard size={14} className="text-rose-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Subscriptions Sentinel</div>
                      <div className="text-[10px] text-slate-400">Cancel zombie auto-renewals</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                  <button
                    onClick={() => navigateTo('settings')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Settings size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Settings & Encrypted Vault</div>
                      <div className="text-[10px] text-slate-400">AES-GCM-256 backup</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* ─── 3. Right Action Cluster ─── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Button (⌘K) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="h-[34px] px-2.5 rounded-lg border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all inline-flex items-center gap-2 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            title="Search & Command Palette (⌘K)"
            aria-label="Search and Command Palette"
          >
            <Search size={14} className="shrink-0 text-slate-400" />
            <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-300/40 dark:border-white/10 leading-none">
              ⌘K
            </kbd>
          </button>

          {/* 👤 Learning Persona Switcher Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className={`h-[34px] px-2.5 rounded-lg border border-slate-200/80 dark:border-white/10 hover:border-amber-400/60 bg-white/90 dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.07] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                personaMenuOpen ? 'border-amber-500/50 ring-2 ring-amber-500/20' : ''
              }`}
              title={`Active Persona: ${currentPersonaObj.label}`}
              aria-expanded={personaMenuOpen}
              aria-label="Select Learning Persona"
            >
              <span className="text-sm leading-none shrink-0">{currentPersonaObj.emoji}</span>
              <span className="hidden sm:inline text-slate-800 dark:text-slate-200 font-semibold text-xs whitespace-nowrap">
                {currentPersonaObj.shortLabel}
              </span>
              <ChevronDown size={12} className="text-slate-400 shrink-0" />
            </button>

            {/* Persona Switch Menu */}
            <AnimatePresence>
              {personaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-xl"
                >
                  <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Select Learning Persona
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
                        <div className="flex items-center gap-2">
                          <span className="text-base shrink-0">{p.emoji}</span>
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

          {/* 💱 Unified Currency Segmented Selector */}
          <div
            role="radiogroup"
            aria-label="Currency Selector"
            className="hidden sm:inline-flex items-center h-[34px] p-0.5 rounded-lg bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shrink-0"
          >
            {(['USD', 'PKR', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => {
              const isCurActive = baseCurrency === cur;
              const curSymbol = cur === 'USD' ? '$' : cur === 'PKR' ? '₨' : cur === 'EUR' ? '€' : '£';
              return (
                <button
                  key={cur}
                  role="radio"
                  aria-checked={isCurActive}
                  onClick={() => {
                    setBaseCurrency(cur);
                    playClickSound();
                  }}
                  className={`h-[28px] px-2 rounded-md font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center focus:outline-none ${
                    isCurActive
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-white/10 font-extrabold'
                      : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 border border-transparent'
                  }`}
                  title={`Set currency to ${cur} (${curSymbol})`}
                >
                  {curSymbol}
                </button>
              );
            })}
          </div>

          {/* 🌓 Theme Toggle Button (Square 34px × 34px) */}
          <button
            onClick={() => {
              toggleTheme();
              playClickSound();
            }}
            className="w-[34px] h-[34px] rounded-lg border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            title="Toggle Dark / Light Theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-amber-400 shrink-0" />
            ) : (
              <Moon size={15} className="shrink-0" />
            )}
          </button>

          {/* 📱 Mobile Hamburger Toggle (Square 34px × 34px, md:hidden) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-[34px] h-[34px] rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center justify-center cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* ─── 4. Dynamic Island Mobile / Tablet Drawer (md:hidden) ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto md:hidden max-w-7xl mx-auto mt-2 rounded-2xl bg-white/95 dark:bg-[#070A13]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl p-4 space-y-4 max-h-[82vh] overflow-y-auto"
          >
            {/* Quick Search on Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-xs text-slate-600 dark:text-slate-400 hover:border-amber-400 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <span className="font-medium">Quick Search or Command...</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-500">⌘K</kbd>
            </button>

            {/* Mobile Currency Bar */}
            <div className="flex sm:hidden items-center justify-between p-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03]">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Base Currency</span>
              <div className="flex items-center gap-1">
                {(['USD', 'PKR', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => {
                      setBaseCurrency(cur);
                      playClickSound();
                    }}
                    className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      baseCurrency === cur
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cur === 'USD' ? '$' : cur === 'PKR' ? '₨' : cur === 'EUR' ? '€' : '£'}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured 50/30/20 Rule Banner in Mobile */}
            <div
              onClick={() => navigateTo('50-30-20')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/40 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/25">
                  <PieChart size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>50/30/20 Budget Rule</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                      CORE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Divide allowance into 50% Needs, 30% Wants, 20% Savings
                  </div>
                </div>
              </div>
            </div>

            {/* Core Modules Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Student Learning Modules
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
                  <Home size={14} className="text-cyan-500" />
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
                  <BookOpen size={14} className="text-cyan-500" />
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
                  <ShieldCheck size={14} className="text-emerald-500" />
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
                  <Target size={14} className="text-indigo-500" />
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
                  <Receipt size={14} className="text-rose-500" />
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
                  <AlertTriangle size={14} className="text-yellow-500" />
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
                  <Image size={14} className="text-purple-500" />
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
                  <Bot size={14} className="text-cyan-500" />
                  <span>AI BudgetBee</span>
                </button>
              </div>
            </div>

            {/* Advanced Suite Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Advanced Tools & Ledger
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => navigateTo('general-ledger')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <BookOpen size={14} className="text-blue-500" />
                  <span>Accounting Simulator</span>
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
                  <span>Bill Split</span>
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

            {/* Quick Links Footer */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => navigateTo('feedback-contact')}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-500 cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>Feedback & About</span>
              </button>
              <button
                onClick={() => {
                  setSiteMapModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-500 cursor-pointer"
              >
                <Compass size={14} />
                <span>Visual Sitemap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
