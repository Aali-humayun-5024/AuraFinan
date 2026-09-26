// AuraFinance OS — Sidebar Navigation
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowRightLeft, Target, TrendingUp,
  Bot, CreditCard, Settings, ChevronLeft, ChevronRight,
  Sparkles, Shield, ShoppingCart, Users, Scale,
  BookOpen, Layers, GraduationCap, Compass
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { playClickSound } from '../services/soundService';
import { useTranslation } from '../i18n/useTranslation';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
  { id: 'general-ledger', label: 'General Ledger', icon: BookOpen, shortcut: '⌘2' },
  { id: 'cash-flow-engine', label: 'Cash Flow Engine', icon: Layers, shortcut: '⌘3' },
  { id: 'academic-suite', label: 'Academic Suite', icon: GraduationCap },
  { id: 'daily-bazaar', label: 'Daily Bazaar & Rashan', icon: ShoppingCart },
  { id: 'bazaar-sentinel', label: 'Price Sentinel', icon: Scale },
  { id: 'split-ledger', label: 'Split & IOUs', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'sankey', label: 'Personal Flow', icon: TrendingUp },
  { id: 'time-machine', label: 'Time Machine', icon: Sparkles },
  { id: 'ai-copilot', label: 'AI Copilot', icon: Bot, shortcut: '⌘J' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'impulse-interceptor', label: 'Impulse Interceptor', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘,' },
];

export default function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeView,
    setActiveView,
    setPersonaStudioOpen,
    setCopilotDrawerOpen,
    setSiteMapModalOpen,
  } = useAppStore();
  const { t } = useTranslation();

  const getNavLabel = (id: string, fallback: string) => {
    switch (id) {
      case 'dashboard':
        return t.navigation.overview;
      case 'general-ledger':
        return t.navigation.generalLedger;
      case 'cash-flow-engine':
        return t.navigation.cashflow;
      case 'academic-suite':
        return t.navigation.academicSuite;
      case 'bazaar-sentinel':
        return t.navigation.bazaarSentinel;
      case 'split-ledger':
        return t.iouSettler.billSplitTitle;
      case 'settings':
        return t.navigation.settings;
      default:
        return fallback;
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden lg:flex h-full flex-col border-r border-slate-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-[#070A12]/90 backdrop-blur-3xl relative z-20 shrink-0 shadow-xs"
    >
      {/* ─── The 3D Tactile Brand Logo Lockup (Master Spec 4.A) ─── */}
      <div className="flex items-center px-5 h-16 border-b border-slate-200/90 dark:border-white/[0.08] shrink-0">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/25 dark:shadow-emerald-500/15 shrink-0 select-none cursor-pointer"
        >
          <span className="text-white font-black text-lg tracking-tighter leading-none flex items-center justify-center">
            A
          </span>
        </motion.div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col justify-center ms-3 overflow-hidden text-start"
            >
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap leading-tight">
                AuraFinance
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase leading-none mt-0.5">
                OS 2026.09
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation (Master Spec 5.2) */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`h-10 w-full rounded-xl px-3 py-2 mb-1 flex items-center gap-3 transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-500/20'
                  : 'hover:bg-slate-100/90 dark:hover:bg-white/[0.04] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden text-xs"
                  >
                    <span className="truncate">{getNavLabel(item.id, item.label)}</span>
                    {item.shortcut && (
                      <span className="ms-auto text-[10px] font-mono text-slate-400 dark:text-slate-500 select-none">
                        {item.shortcut}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Action Strip: Copilot Drawer (⌘J) + Visual Site Map (⌘M) */}
      <div className="px-3 mb-2 space-y-1.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClickSound();
            setCopilotDrawerOpen(true);
          }}
          className={`w-full py-1.5 px-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-aura-text flex items-center gap-2.5 transition-all cursor-pointer shadow-xs ${
            !sidebarOpen ? 'justify-center p-2' : ''
          }`}
          title="Open AI Copilot Chatbot (⌘J)"
        >
          <Bot size={16} className="text-purple-400 shrink-0" />
          {sidebarOpen && (
            <div className="text-left flex-1 flex items-center justify-between overflow-hidden">
              <span className="text-xs font-bold text-aura-text truncate">AI Copilot</span>
              <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-aura-text-muted">⌘J</kbd>
            </div>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClickSound();
            setSiteMapModalOpen(true);
          }}
          className={`w-full py-1.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-aura-text flex items-center gap-2.5 transition-all cursor-pointer shadow-xs ${
            !sidebarOpen ? 'justify-center p-2' : ''
          }`}
          title="Open Visual Site Map (⌘M)"
        >
          <Compass size={16} className="text-cyan-400 shrink-0" />
          {sidebarOpen && (
            <div className="text-left flex-1 flex items-center justify-between overflow-hidden">
              <span className="text-xs font-bold text-aura-text truncate">Site Map</span>
              <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-aura-text-muted">⌘M</kbd>
            </div>
          )}
        </motion.button>

        {/* Persona Architect Studio Launch CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClickSound();
            setPersonaStudioOpen(true);
          }}
          className={`w-full py-1.5 px-3 rounded-xl border border-aura-accent/30 bg-gradient-to-r from-aura-accent/15 to-indigo-500/10 hover:from-aura-accent/25 hover:to-indigo-500/20 text-aura-text flex items-center gap-2.5 transition-all cursor-pointer shadow-xs ${
            !sidebarOpen ? 'justify-center p-2' : ''
          }`}
          title="Open Persona Architect Studio"
        >
          <span className="text-base shrink-0">🎭</span>
          {sidebarOpen && (
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-aura-text truncate flex items-center gap-1">
                <span>Persona Studio</span>
                <span className="text-[9px] uppercase px-1 rounded bg-aura-accent/20 text-aura-accent font-extrabold">30s</span>
              </p>
            </div>
          )}
        </motion.button>
      </div>

      {/* Zero-Knowledge Badge */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Shield size={14} />
              Zero-Knowledge
            </div>
            <p className="text-[10px] text-aura-text-muted leading-relaxed">
              All data stays on your device. Encrypted. Private. Always.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-aura-card border border-aura-border-bright flex items-center justify-center text-aura-text-muted hover:text-aura-accent hover:border-aura-accent transition-all z-30"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </motion.aside>
  );
}
