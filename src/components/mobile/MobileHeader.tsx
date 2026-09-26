// AuraFinance OS — Mobile & Tablet Native App Header (< 1024px)
// Sticky top, frosted glassmorphism, dynamic net balance pill, persona switcher & theme controls
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, convertCurrency } from '../../services/fxService';
import { seedPersona } from '../../data/seedData';
import { playToggleSound, playClickSound } from '../../services/soundService';
import FinancialMetric from '../common/FinancialMetric';
import {
  Users, Sun, Moon, Volume2, VolumeX, Sparkles, ChevronDown, Compass,
  Scale, ShoppingCart, Target, CreditCard, Settings as SettingsIcon,
  Mic, BookOpen, Layers, GraduationCap
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import confetti from 'canvas-confetti';
import { playWakeChime } from '../../services/soundEffects';
import VoiceTriggerButton from '../voice/VoiceTriggerButton';

const PERSONAS = [
  { id: 'household' as const, label: 'Household (Ghar)', emoji: '🏠' },
  { id: 'freelancer' as const, label: 'Freelancer', emoji: '💼' },
  { id: 'student' as const, label: 'Student', emoji: '🎓' },
  { id: 'clean' as const, label: 'Clean Slate', emoji: '✨' },
];

export default function MobileHeader() {
  const {
    baseCurrency,
    fxRates,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    activePersona,
    setActivePersona,
    customPersona,
    setPersonaStudioOpen,
    setBaseCurrency,
    activeProfileId,
    setActiveProfileId,
    activeView,
    setActiveView,
    setVoiceAssistantOpen,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  // Calculate quick net balance for current month
  const netBalance = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = thisMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);
    const expense = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    return income - expense;
  }, [transactions, baseCurrency, fxRates]);

  const handlePersonaSwitch = async (persona: 'student' | 'freelancer' | 'household' | 'clean') => {
    playClickSound();
    setLoading(true);
    await seedPersona(persona);
    setActivePersona(persona);
    if (persona === 'household') {
      setBaseCurrency('PKR');
    }
    setLoading(false);

    if (persona !== 'clean') {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.2 },
      });
    }
  };

  return (
    <header className="flex lg:hidden sticky top-0 z-40 items-center justify-between px-3.5 py-2.5 bg-aura-surface/85 backdrop-blur-xl border-b border-aura-border shadow-sm">
      {/* Left: App Brand & Profile Tag */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-aura-accent to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-aura-accent/30 shrink-0">
          A
        </div>
        <div>
          <span className="font-extrabold tracking-tight text-sm text-aura-text block leading-none">
            Aura<span className="text-aura-accent">OS</span>
          </span>
          <span className="text-[10px] text-aura-text-muted capitalize">
            {activeProfileId === 'all' ? 'Pura Ghar' : activeProfileId}
          </span>
        </div>
      </div>

      {/* Center: Quick Net-Worth Pill with Baseline Metric Counter */}
      <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-aura-border flex items-center gap-1.5 shadow-inner">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <FinancialMetric
          value={netBalance}
          currency={baseCurrency}
          size="xs"
          color="text-emerald-400 font-bold"
          symbolColor="text-emerald-400/80"
          fractionColor="text-emerald-400/80"
          isAnimated
        />
      </div>

      {/* Right: Tools, Persona, Theme & Sound */}
      <div className="flex items-center gap-1.5">
        {/* Mobile Tools Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={playClickSound}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-aura-border text-cyan-400 hover:border-cyan-400 transition-all cursor-pointer"
              title="All Views & Tools"
            >
              <Compass size={17} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="min-w-[210px] bg-aura-card border border-aura-border-bright rounded-2xl p-1.5 shadow-2xl z-[200] backdrop-blur-2xl"
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-aura-text-muted">
                Wealth Tools
              </div>
              {[
                { id: 'general-ledger', label: 'General Ledger (Double-Entry)', icon: BookOpen, color: 'text-indigo-400' },
                { id: 'cash-flow-engine', label: 'Cash Flow Engine (Waterfall)', icon: Layers, color: 'text-teal-400' },
                { id: 'academic-suite', label: 'Academic Suite (CPA Labs)', icon: GraduationCap, color: 'text-amber-400' },
                { id: 'split-ledger', label: 'Split with Friends (IOUs)', icon: Users, color: 'text-purple-400' },
                { id: 'bazaar-sentinel', label: 'Price-Index Sentinel', icon: Scale, color: 'text-cyan-400' },
                { id: 'daily-bazaar', label: 'Daily Bazaar & Mandi', icon: ShoppingCart, color: 'text-emerald-400' },
                { id: 'goals', label: 'Financial Goals', icon: Target, color: 'text-amber-400' },
                { id: 'subscriptions', label: 'Subscription Hunter', icon: CreditCard, color: 'text-rose-400' },
                { id: 'settings', label: 'Settings & Security', icon: SettingsIcon, color: 'text-slate-400' },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <DropdownMenu.Item
                    key={tool.id}
                    onClick={() => {
                      playClickSound();
                      setActiveView(tool.id);
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs cursor-pointer outline-none transition-all ${
                      activeView === tool.id
                        ? 'bg-aura-accent/20 text-white font-bold'
                        : 'text-aura-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={15} className={tool.color} />
                    <span>{tool.label}</span>
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Hey Aura Voice Assistant Trigger */}
        <VoiceTriggerButton compact={true} />

        {/* Persona Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={playClickSound}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-aura-border text-aura-text hover:border-aura-accent transition-all cursor-pointer"
              title="Switch Persona"
            >
              <Users size={17} className="text-aura-accent" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="min-w-[190px] bg-aura-card border border-aura-border-bright rounded-2xl p-1.5 shadow-2xl z-[200] backdrop-blur-2xl"
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-aura-text-muted">
                Select Persona
              </div>
              {PERSONAS.map((p) => (
                <DropdownMenu.Item
                  key={p.id}
                  onClick={() => handlePersonaSwitch(p.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer outline-none transition-all ${
                    activePersona === p.id
                      ? 'bg-aura-accent/15 text-aura-text font-bold'
                      : 'text-aura-text-secondary hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span>{p.label}</span>
                </DropdownMenu.Item>
              ))}

              <div className="pt-1.5 mt-1 border-t border-aura-border">
                <DropdownMenu.Item
                  onClick={() => {
                    playClickSound();
                    setPersonaStudioOpen(true);
                  }}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer outline-none transition-all bg-aura-accent/15 text-aura-accent hover:bg-aura-accent/25 font-bold"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>+ Craft Custom Persona</span>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            playClickSound();
            toggleSound();
          }}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-aura-accent/15 border-aura-accent/30 text-aura-accent'
              : 'bg-white/[0.04] border-aura-border text-aura-text-muted'
          }`}
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            playToggleSound();
            toggleTheme();
          }}
          className="p-1.5 rounded-xl bg-white/[0.04] border border-aura-border text-aura-text hover:border-aura-accent transition-all cursor-pointer"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-aura-accent" />
          )}
        </button>
      </div>
    </header>
  );
}
