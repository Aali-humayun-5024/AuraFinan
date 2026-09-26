// AuraFinance OS — Native Mobile App Bottom Dock (< 1024px)
// STRICT SPECIFICATION: ICON-ONLY, NO TEXT LABELS
// Features center elevated floating action button, safe-area support, and micro-dot active glow
import { motion } from 'framer-motion';
import { LayoutDashboard, PieChart, Plus, TrendingUp, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { playClickSound } from '../../services/soundService';

export default function MobileBottomNav() {
  const { activeView, setActiveView, setCommandPaletteOpen } = useAppStore();

  const handleTabClick = (view: string) => {
    playClickSound();
    setActiveView(view);
  };

  const handleCenterAction = () => {
    playClickSound();
    setCommandPaletteOpen(true);
  };

  const isHomeActive = activeView === 'dashboard' || activeView === 'daily-bazaar';
  const isAnalyticsActive = activeView === 'sankey' || activeView === 'transactions';
  const isSimulateActive = activeView === 'time-machine' || activeView === 'goals';
  const isAIActive = activeView === 'ai-copilot' || activeView === 'subscriptions' || activeView === 'settings';

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080C14]/90 dark:bg-[#080C14]/90 light:bg-white/90 backdrop-blur-2xl border-t border-white/[0.08] dark:border-white/[0.08] light:border-slate-200/80 pb-[env(safe-area-inset-bottom,14px)] pt-2 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto relative px-2">
        {/* Tab 1: Overview / Home (Icon Only) */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            isHomeActive
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200 active:scale-90'
          }`}
          aria-label="Overview Dashboard"
          title="Overview Dashboard"
        >
          <LayoutDashboard size={24} strokeWidth={isHomeActive ? 2.3 : 1.8} />
          {isHomeActive && (
            <motion.div
              layoutId="mobile-nav-glow"
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shadow-[0_0_8px_#10B981]"
            />
          )}
        </button>

        {/* Tab 2: Analytics & Cash Flow (Icon Only) */}
        <button
          onClick={() => handleTabClick('sankey')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            isAnalyticsActive
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200 active:scale-90'
          }`}
          aria-label="Analytics & Cash Flow"
          title="Analytics & Cash Flow"
        >
          <PieChart size={24} strokeWidth={isAnalyticsActive ? 2.3 : 1.8} />
          {isAnalyticsActive && (
            <motion.div
              layoutId="mobile-nav-glow"
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shadow-[0_0_8px_#06B6D4]"
            />
          )}
        </button>

        {/* Center Elevated Action Button (Omnimodal Quick-Add) */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleCenterAction}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/35 -translate-y-3.5 transition-transform cursor-pointer border-2 border-aura-bg"
          aria-label="Quick Add Transaction"
          title="Quick Add Transaction"
        >
          <Plus size={26} strokeWidth={2.6} />
        </motion.button>

        {/* Tab 3: Wealth Simulator (Icon Only) */}
        <button
          onClick={() => handleTabClick('time-machine')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            isSimulateActive
              ? 'text-violet-400'
              : 'text-slate-400 hover:text-slate-200 active:scale-90'
          }`}
          aria-label="Wealth Simulator"
          title="Wealth Simulator"
        >
          <TrendingUp size={24} strokeWidth={isSimulateActive ? 2.3 : 1.8} />
          {isSimulateActive && (
            <motion.div
              layoutId="mobile-nav-glow"
              className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shadow-[0_0_8px_#8B5CF6]"
            />
          )}
        </button>

        {/* Tab 4: AI Co-Pilot / Roast (Icon Only) */}
        <button
          onClick={() => handleTabClick('ai-copilot')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            isAIActive
              ? 'text-fuchsia-400'
              : 'text-slate-400 hover:text-slate-200 active:scale-90'
          }`}
          aria-label="AI Wealth Copilot"
          title="AI Wealth Copilot"
        >
          <Sparkles size={24} strokeWidth={isAIActive ? 2.3 : 1.8} />
          {isAIActive && (
            <motion.div
              layoutId="mobile-nav-glow"
              className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1 shadow-[0_0_8px_#D946EF]"
            />
          )}
        </button>
      </div>
    </nav>
  );
}
