// AuraFinance OS — Main App Shell (Code-Split & Hardware-Adaptive)
import React, { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useHardwareProfile } from './context/HardwareProfileContext';
import { fetchFXRates } from './services/fxService';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MobileHeader from './components/mobile/MobileHeader';
import MobileBottomNav from './components/mobile/MobileBottomNav';
import CommandPalette from './components/CommandPalette';
import ViewSkeleton from './components/common/ViewSkeleton';
import { WakeWordListenerController } from './services/wakeWordListener';
import { seedAccountingDatabaseIfEmpty } from './db/accountingSeed';
import { jsonVaultService } from './services/jsonVaultService';
import { ledgerDb } from './db/ledgerSchema';
import masterSeedData from './data/masterSeed.json';

// Route Code-Splitting: Lazy load all views to keep initial bundle size well below 220KB gzipped
const DashboardView = lazy(() => import('./views/DashboardView'));
const DailyBazaarView = lazy(() => import('./views/DailyBazaarView'));
const TransactionsView = lazy(() => import('./views/TransactionsView'));
const GoalsView = lazy(() => import('./views/GoalsView'));
const SankeyView = lazy(() => import('./views/SankeyView'));
const TimeMachineView = lazy(() => import('./views/TimeMachineView'));
const AICopilotView = lazy(() => import('./views/AICopilotView'));
const SubscriptionsView = lazy(() => import('./views/SubscriptionsView'));
const ImpulseInterceptorView = lazy(() => import('./views/ImpulseInterceptorView'));
const SplitLedgerView = lazy(() => import('./views/SplitLedgerView'));
const BazaarSentinelView = lazy(() => import('./views/BazaarSentinelView'));
const GeneralLedgerView = lazy(() => import('./views/GeneralLedgerView'));
const CashFlowEngineView = lazy(() => import('./views/CashFlowEngineView'));
const AcademicSuiteView = lazy(() => import('./views/AcademicSuiteView'));
const SettingsView = lazy(() => import('./views/SettingsView'));

// Lazy load heavy voice and persona studios on-demand
const AudioWalkthroughWidget = lazy(() => import('./components/voice/AudioWalkthroughWidget'));
const VoiceAssistantModal = lazy(() =>
  import('./components/voice/VoiceAssistantModal').then((m) => ({ default: m.VoiceAssistantModal }))
);
const PersonaStudioModal = lazy(() => import('./components/persona/PersonaStudioModal'));
const CopilotChatbot = lazy(() => import('./components/ai/CopilotChatbot'));
const SiteMapModal = lazy(() => import('./components/layout/SiteMapModal'));

const pageVariants = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.15 } },
};

function ViewRouter() {
  const { activeView } = useAppStore();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'daily-bazaar':
        return <DailyBazaarView />;
      case 'transactions':
        return <TransactionsView />;
      case 'goals':
        return <GoalsView />;
      case 'sankey':
        return <SankeyView />;
      case 'time-machine':
        return <TimeMachineView />;
      case 'ai-copilot':
        return <AICopilotView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'impulse-interceptor':
        return <ImpulseInterceptorView />;
      case 'split-ledger':
        return <SplitLedgerView />;
      case 'bazaar-sentinel':
        return <BazaarSentinelView />;
      case 'general-ledger':
        return <GeneralLedgerView />;
      case 'cash-flow-engine':
        return <CashFlowEngineView />;
      case 'academic-suite':
        return <AcademicSuiteView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 flex flex-col min-h-0"
      >
        <Suspense fallback={<ViewSkeleton />}>{renderActiveView()}</Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { setFxRates, theme, voiceAssistantOpen, setVoiceAssistantOpen, ecoVoiceMode } = useAppStore();
  const { profile } = useHardwareProfile();

  // Compulsory JSON Master Vault Hydration on First Launch
  useEffect(() => {
    async function bootstrapVault() {
      try {
        const count = await ledgerDb.accounts.count();
        if (count === 0) {
          console.log('[AuraFinance OS] Bootstrapping complete system from masterSeed.json...');
          await jsonVaultService.hydrateFromJSON(masterSeedData as any, 'wipe_and_restore');
        }
      } catch (err) {
        console.error('JSON Bootstrap fallback:', err);
        await seedAccountingDatabaseIfEmpty().catch(console.error);
      }
    }
    bootstrapVault();
  }, []);

  // Continuous "Hey Aura" background wake word listener
  // In Eco Voice Mode or low-tier devices, continuous recognition is pruned to eliminate CPU/battery drain
  useEffect(() => {
    if (ecoVoiceMode || profile.ecoVoiceMode) {
      return;
    }

    const listener = new WakeWordListenerController(() => {
      setVoiceAssistantOpen(true);
    });
    listener.start();
    return () => {
      listener.stop();
    };
  }, [setVoiceAssistantOpen, ecoVoiceMode, profile.ecoVoiceMode]);

  // Load FX rates on mount
  useEffect(() => {
    fetchFXRates().then(({ rates, timestamp }) => {
      setFxRates(rates, timestamp);
    });
  }, [setFxRates]);

  // Sync dual-theme to root DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark', 'dark');
    } else {
      document.documentElement.classList.add('theme-dark', 'dark');
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  // Flashlight bento cursor coordinates — pruned completely on low hardware tier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (profile.tier === 'low') return;
    const target = e.currentTarget;
    target.style.setProperty('--mouse-x', `${e.clientX}px`);
    target.style.setProperty('--mouse-y', `${e.clientY}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`flex h-screen w-screen overflow-hidden bg-aura-bg transition-colors duration-300 ${
        theme === 'light' ? 'theme-light text-slate-900' : 'theme-dark text-slate-100'
      }`}
    >
      {/* Animated Background */}
      <div className="aura-bg-gradient" />

      {/* Desktop Sidebar (hidden lg:flex inside Sidebar) */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Desktop Top Navigation (hidden lg:flex inside TopNav) */}
        <TopNav />

        {/* Mobile & Tablet App Header (< 1024px: flex lg:hidden) */}
        <MobileHeader />

        {/* View Router with safe bottom padding on mobile for bottom dock */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-20 lg:pb-0">
          <ViewRouter />
        </div>

        {/* Mobile Native Bottom Tab Bar (< 1024px: fixed bottom-0 z-50 lg:hidden) */}
        <MobileBottomNav />
      </div>

      {/* Command Palette Overlay */}
      <CommandPalette />

      {/* Voice-Activated Audio Walkthrough Widget */}
      <Suspense fallback={null}>
        <AudioWalkthroughWidget />
      </Suspense>

      {/* "Hey Aura" Voice Assistant HUD & Frequency Orb Modal */}
      {voiceAssistantOpen && (
        <Suspense fallback={null}>
          <VoiceAssistantModal
            isOpen={voiceAssistantOpen}
            onClose={() => setVoiceAssistantOpen(false)}
          />
        </Suspense>
      )}

      {/* Dynamic User-Crafted Experience Persona Architect Studio */}
      <Suspense fallback={null}>
        <PersonaStudioModal />
      </Suspense>

      {/* Embedded Financial AI Chatbot Slide-Over Drawer (⌘J) */}
      <Suspense fallback={null}>
        <CopilotChatbot />
      </Suspense>

      {/* Searchable Visual Site Map Modal (⌘M) */}
      <Suspense fallback={null}>
        <SiteMapModal />
      </Suspense>
    </div>
  );
}
