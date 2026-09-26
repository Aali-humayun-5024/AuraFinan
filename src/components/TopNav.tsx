// AuraFinance OS — Top Navigation Bar with Global Country, Cultural Locale, Persona & Currency Switcher
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Command,
  Globe,
  Zap,
  GraduationCap,
  Briefcase,
  UserPlus,
  Home,
  MapPin,
  Languages,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Mic,
} from 'lucide-react';
import { useAppStore, type CurrencyCode } from '../store/useAppStore';
import { seedPersona } from '../data/seedData';
import { SUPPORTED_CURRENCIES } from '../services/fxService';
import { playToggleSound, playClickSound } from '../services/soundService';
import { playWakeChime } from '../services/soundEffects';
import VoiceTriggerButton from './voice/VoiceTriggerButton';
import { useTranslation } from '../i18n/useTranslation';
import LanguageDropdown from './layout/LanguageDropdown';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';

const PERSONAS = [
  {
    id: 'household' as const,
    label: 'Pakistani Household & Rashan',
    icon: Home,
    emoji: '🏠',
    desc: 'Ghar ka kharcha, monthly rashan, PKR bills & kameti',
  },
  {
    id: 'freelancer' as const,
    label: 'Global Tech Freelancer',
    icon: Briefcase,
    emoji: '💼',
    desc: 'Multi-currency, SaaS, remote income',
  },
  {
    id: 'student' as const,
    label: 'High School Student',
    icon: GraduationCap,
    emoji: '🎓',
    desc: 'Pocket money, gaming, school life',
  },
  { id: 'clean' as const, label: 'Clean Slate', icon: UserPlus, emoji: '✨', desc: 'Start fresh with zero data' },
];

export default function TopNav() {
  const {
    activePersona,
    setActivePersona,
    customPersona,
    personaStudioOpen,
    setPersonaStudioOpen,
    setCommandPaletteOpen,
    baseCurrency,
    setBaseCurrency,
    userCity,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    setVoiceAssistantOpen,
  } = useAppStore();

  const {
    t,
    locale,
    country,
    setLanguage,
    setCountry,
    supportedLocales,
    allCountries,
  } = useTranslation();

  const [loading, setLoading] = useState(false);

  const handlePersonaSwitch = async (persona: 'student' | 'freelancer' | 'household' | 'clean') => {
    setLoading(true);
    await seedPersona(persona);
    setActivePersona(persona);
    if (persona === 'household') {
      setBaseCurrency('PKR');
    }
    setLoading(false);

    if (persona !== 'clean') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.2 },
        colors: ['#22c55e', '#7c5cfc', '#06b6d4', '#f59e0b'],
      });
    }
  };

  const handleCountryChange = (cCode: string) => {
    playClickSound();
    setCountry(cCode);
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.2 },
      colors: ['#10b981', '#f59e0b', '#06b6d4'],
    });
  };

  const handleLanguageChange = (lCode: string) => {
    playClickSound();
    setLanguage(lCode);
  };

  // Determine active persona label & avatar
  const personaDisplay = useMemo(() => {
    if (activePersona === 'custom' && customPersona) {
      return {
        label: customPersona.name,
        emoji: customPersona.avatarIcon || '✨',
      };
    }
    const found = PERSONAS.find((p) => p.id === activePersona);
    return {
      label: found?.label || 'Custom Persona',
      emoji: found?.emoji || '🎭',
    };
  }, [activePersona, customPersona]);

  return (
    <header className="border-b border-slate-200/90 dark:border-white/[0.08] bg-white/80 dark:bg-aura-surface/40 backdrop-blur-2xl hidden lg:flex items-center justify-between px-3 sm:px-4 xl:px-6 py-2.5 xl:py-3.5 gap-2 xl:gap-3 shrink-0 z-20 w-full min-w-0">
      {/* Left: Persona Switcher + Country / Cultural Bazaar + Language */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
        {/* Persona Switcher */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="persona-chip active flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer"
              disabled={loading}
            >
              <span className="text-sm shrink-0">{personaDisplay.emoji}</span>
              <span className="text-xs md:text-sm font-semibold truncate max-w-[85px] sm:max-w-[120px] 2xl:max-w-[170px]">
                {loading ? 'Switching...' : personaDisplay.label}
              </span>
            </motion.button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              className="min-w-[290px] bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:bg-[#090D1A]/92 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-2xl p-1.5 z-[200]"
            >
              <div className="px-3 py-2 mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-aura-text-muted tracking-wider uppercase">
                  🎭 Experience Persona
                </p>
                <span className="text-[10px] font-mono text-aura-accent">100% Local</span>
              </div>
              {PERSONAS.map((persona) => (
                <DropdownMenu.Item
                  key={persona.id}
                  onClick={() => handlePersonaSwitch(persona.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer outline-none transition-all ${
                    activePersona === persona.id
                      ? 'bg-aura-accent/15 text-aura-text font-bold'
                      : 'text-aura-text-secondary hover:bg-white/5 hover:text-aura-text'
                  }`}
                >
                  <span className="text-2xl">{persona.emoji}</span>
                  <div>
                    <p className="text-sm font-medium">{persona.label}</p>
                    <p className="text-xs text-aura-text-muted">{persona.desc}</p>
                  </div>
                </DropdownMenu.Item>
              ))}

              {/* Persona Architect Studio Launch CTA */}
              <div className="pt-2 mt-1.5 border-t border-aura-border">
                <DropdownMenu.Item
                  onClick={() => {
                    playClickSound();
                    setPersonaStudioOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-all bg-gradient-to-r from-aura-accent/15 via-purple-500/10 to-indigo-500/15 text-aura-text hover:from-aura-accent/25 hover:to-indigo-500/25 border border-aura-accent/30"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-aura-accent to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                    ✨
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-aura-text">Persona Architect Studio</p>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">30s</span>
                    </div>
                    <p className="text-[10px] text-aura-text-muted">Craft your bespoke financial universe</p>
                  </div>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Fast-Track Studio Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClickSound();
            setPersonaStudioOpen(true);
          }}
          title="Open Persona Architect Studio (Craft Bespoke Scenario)"
          className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-aura-accent/10 border border-aura-accent/25 text-aura-accent text-xs font-bold hover:bg-aura-accent/20 transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Sparkles size={12} className="text-amber-500" />
          <span>Craft Persona</span>
        </motion.button>

        {/* ─── DYNAMIC COUNTRY & CULTURAL BAZAAR SELECTOR ─── */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              title="Select Country & Cultural Ledger"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.04] border border-aura-border hover:border-aura-accent/40 text-xs text-aura-text transition-all cursor-pointer shrink-0"
            >
              <span className="text-sm leading-none shrink-0">{country.flag}</span>
              <span className="font-semibold hidden 2xl:inline">{country.name}</span>
              <span className="font-semibold 2xl:hidden">{country.code}</span>
            </motion.button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="start"
              className="min-w-[280px] max-h-[380px] overflow-y-auto bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:bg-[#090D1A]/92 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-2xl p-1.5 z-[200]"
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-aura-text-muted flex items-center justify-between">
                <span>🌍 Select Country & Culture</span>
                <span className="text-[9px] text-emerald-400 font-mono">Worldwide (195+)</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {allCountries.map((c) => (
                  <DropdownMenu.Item
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer outline-none transition-all ${
                      country.code === c.code
                        ? 'bg-aura-accent/15 text-white font-bold'
                        : 'text-aura-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-aura-text-muted">{c.defaultCurrency}</span>
                  </DropdownMenu.Item>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* ─── DYNAMIC MULTI-LANGUAGE / VERNACULAR SELECTOR ─── */}
        <LanguageDropdown />
      </div>

      {/* Center: Search / Command Palette Trigger — Flexible & Adaptive */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border hover:border-aura-border-bright text-aura-text-muted text-xs xl:text-sm flex-1 min-w-[70px] max-w-[170px] lg:max-w-[210px] xl:max-w-sm 2xl:max-w-md transition-all mx-1 xl:mx-2 cursor-pointer"
      >
        <Search size={14} className="shrink-0" />
        <span className="truncate">{t.header.searchPlaceholder}</span>
        <kbd className="ms-auto hidden 2xl:flex items-center gap-1 text-[10px] text-aura-text-muted bg-white/5 px-1.5 py-0.5 rounded-md border border-aura-border shrink-0">
          <Command size={10} /> K
        </kbd>
      </motion.button>

      {/* Right: Currency + Dual-Theme Toggle + Audio Synth + Voice + Notifications */}
      <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2.5 shrink-0 ms-auto">

        {/* Currency Switcher */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.04] border border-aura-border text-xs text-aura-text-secondary hover:text-aura-text hover:border-aura-border-bright transition-all shrink-0 cursor-pointer"
            >
              <span className="text-sm shrink-0 leading-none">
                {SUPPORTED_CURRENCIES.find((c) => c.code === baseCurrency)?.flag}
              </span>
              <span className="font-mono font-semibold">{baseCurrency}</span>
            </motion.button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="min-w-[200px] bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:bg-[#090D1A]/92 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-2xl p-1.5 z-[200]"
            >
              {SUPPORTED_CURRENCIES.map((cur) => (
                <DropdownMenu.Item
                  key={cur.code}
                  onClick={() => setBaseCurrency(cur.code as CurrencyCode)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer outline-none text-sm transition-all ${
                    baseCurrency === cur.code
                      ? 'bg-aura-accent/15 text-aura-text'
                      : 'text-aura-text-secondary hover:bg-white/5 hover:text-aura-text'
                  }`}
                >
                  <span>{cur.flag}</span>
                  <span className="font-medium">{cur.code}</span>
                  <span className="text-xs text-aura-text-muted ml-auto">{cur.name}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Dual-Theme Toggle (Obsidian Nebula / Opal Ceramic) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playToggleSound();
            toggleTheme();
          }}
          title={theme === 'dark' ? t.header.themeToggleLight : t.header.themeToggleDark}
          className="relative w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-white/[0.04] border border-aura-border flex items-center justify-center text-aura-text hover:border-aura-accent transition-all cursor-pointer shrink-0"
        >
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-aura-accent" />}
        </motion.button>

        {/* Audio Synth Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playClickSound();
            toggleSound();
          }}
          title={soundEnabled ? 'Haptic Sound: Enabled' : 'Haptic Sound: Muted'}
          className={`relative w-8 h-8 xl:w-9 xl:h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            soundEnabled
              ? 'bg-aura-accent/15 border-aura-accent/30 text-aura-accent'
              : 'bg-white/[0.04] border-aura-border text-aura-text-muted hover:text-aura-text'
          }`}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </motion.button>

        {/* Hey Aura Voice Assistant Trigger */}
        <VoiceTriggerButton className="shrink-0" />

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={playClickSound}
          className="relative w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-white/[0.04] border border-aura-border flex items-center justify-center text-aura-text-muted hover:text-aura-text hover:border-aura-border-bright transition-all shrink-0 cursor-pointer"
        >
          <Bell size={15} />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
            2
          </span>
        </motion.button>
      </div>
    </header>
  );
}
