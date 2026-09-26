// BudgetBasics — Main App Shell (NextGen BudgetBee)
// Complies with TechWiz 7 SRS Specification v1.0
import React, { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useHardwareProfile } from './context/HardwareProfileContext';
import { fetchFXRates } from './services/fxService';
import Navbar from './components/Navbar';
import TickerBanner from './components/srs/TickerBanner';
import MobileBottomNav from './components/mobile/MobileBottomNav';
import CommandPalette from './components/CommandPalette';
import ViewSkeleton from './components/common/ViewSkeleton';
import { WakeWordListenerController } from './services/wakeWordListener';
import { seedAccountingDatabaseIfEmpty } from './db/accountingSeed';
import { jsonVaultService } from './services/jsonVaultService';
import { ledgerDb } from './db/ledgerSchema';
import masterSeedData from './data/masterSeed.json';

// Core SRS Views
const FiftyThirtyTwentyModule = lazy(() => import('./components/srs/FiftyThirtyTwentyModule'));
const BudgetingBasicsModule = lazy(() => import('./components/srs/BudgetingBasicsModule'));
const NeedsVsWantsModule = lazy(() => import('./components/srs/NeedsVsWantsModule'));
const SavingsGoalsModule = lazy(() => import('./components/srs/SavingsGoalsModule'));
const ExpensePlannerModule = lazy(() => import('./components/srs/ExpensePlannerModule'));
const MoneyMistakesModule = lazy(() => import('./components/srs/MoneyMistakesModule'));
const InfographicsGalleryModule = lazy(() => import('./components/srs/InfographicsGalleryModule'));
const AIChatbotModule = lazy(() => import('./components/srs/AIChatbotModule'));
const SearchFilterModule = lazy(() => import('./components/srs/SearchFilterModule'));
const AboutFeedbackContactModule = lazy(() => import('./components/srs/AboutFeedbackContactModule'));

// Advanced & Legacy Feature Views (accessible via 'More Tools')
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

// Modals
const AudioWalkthroughWidget = lazy(() => import('./components/voice/AudioWalkthroughWidget'));
const VoiceAssistantModal = lazy(() =>
  import('./components/voice/VoiceAssistantModal').then((m) => ({ default: m.VoiceAssistantModal }))
);
const PersonaStudioModal = lazy(() => import('./components/persona/PersonaStudioModal'));
const CopilotChatbot = lazy(() => import('./components/ai/CopilotChatbot'));
const SiteMapModal = lazy(() => import('./components/layout/SiteMapModal'));

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

function ViewRouter() {
  const { activeView } = useAppStore();

  const renderActiveView = () => {
    switch (activeView) {
      // Primary SRS Requirements
      case 'dashboard':
        return <DashboardView />;
      case '50-30-20':
      case 'fifty-thirty-twenty':
        return <FiftyThirtyTwentyModule />;
      case 'budgeting-basics':
        return <BudgetingBasicsModule />;
      case 'needs-vs-wants':
        return <NeedsVsWantsModule />;
      case 'savings-goals':
        return <SavingsGoalsModule />;
      case 'expense-planner':
        return <ExpensePlannerModule />;
      case 'money-mistakes':
        return <MoneyMistakesModule />;
      case 'infographics':
        return <InfographicsGalleryModule />;
      case 'ai-chatbot':
        return <AIChatbotModule />;
      case 'search-resources':
        return <SearchFilterModule />;
      case 'feedback-contact':
        return <AboutFeedbackContactModule />;

      // Advanced Power Tools ('More Tools')
      case 'general-ledger':
        return <GeneralLedgerView />;
      case 'cash-flow-engine':
        return <CashFlowEngineView />;
      case 'academic-suite':
        return <AcademicSuiteView />;
      case 'daily-bazaar':
        return <DailyBazaarView />;
      case 'bazaar-sentinel':
        return <BazaarSentinelView />;
      case 'split-ledger':
        return <SplitLedgerView />;
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
          console.log('[BudgetBasics] Bootstrapping system data...');
          await jsonVaultService.hydrateFromJSON(masterSeedData as any, 'wipe_and_restore');
        }
      } catch (err) {
        console.error('JSON Bootstrap fallback:', err);
        await seedAccountingDatabaseIfEmpty().catch(console.error);
      }
    }
    bootstrapVault();
  }, []);

  // Continuous "Hey Aura / Hey Bee" background wake word listener
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

  // Flashlight cursor coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (profile.tier === 'low') return;
    const target = e.currentTarget;
    target.style.setProperty('--mouse-x', `${e.clientX}px`);
    target.style.setProperty('--mouse-y', `${e.clientY}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`flex flex-col h-screen w-screen overflow-hidden bg-aura-bg transition-colors duration-300 ${
        theme === 'light' ? 'theme-light text-slate-900' : 'theme-dark text-slate-100'
      }`}
    >
      {/* Animated Background */}
      <div className="aura-bg-gradient" />

      {/* Top Navbar (Replaces sidebar completely with responsive header) */}
      <Navbar />

      {/* Real-time Ticker Banner: Visitor Counter, Clock & Financial Quotes Ticker (SRS 1.6 & 1.6.11) */}
      <TickerBanner />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-20 lg:pb-6 relative z-10">
        <ViewRouter />
      </main>

      {/* Mobile Native Bottom Tab Bar (< 1024px) */}
      <MobileBottomNav />

      {/* Command Palette Overlay (⌘K) */}
      <CommandPalette />

      {/* Audio Walkthrough Widget */}
      <Suspense fallback={null}>
        <AudioWalkthroughWidget />
      </Suspense>

      {/* Voice Assistant HUD Modal */}
      {voiceAssistantOpen && (
        <Suspense fallback={null}>
          <VoiceAssistantModal
            isOpen={voiceAssistantOpen}
            onClose={() => setVoiceAssistantOpen(false)}
          />
        </Suspense>
      )}

      {/* Dynamic Persona Studio Modal */}
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
