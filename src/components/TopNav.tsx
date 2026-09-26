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
    <header className="sticky top-0 h-16 z-40 w-full min-w-0 border-b border-slate-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-[#050811]/90 backdrop-blur-2xl hidden lg:flex items-center justify-between px-3 sm:px-4 xl:px-6 gap-2 xl:gap-3 shrink-0">
      {/* Left: Persona Switcher + Country / Cultural Bazaar + Language */}
      <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0 min-w-0">
        {/* Persona Switcher */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs transition-all cursor-pointer shrink-0"
              disabled={loading}
              title={`Active Persona: ${personaDisplay.label}`}
            >
              <span className="text-sm shrink-0 leading-none">{personaDisplay.emoji}</span>
              <span className="text-xs font-semibold truncate max-w-[70px] xl:max-w-[110px] 2xl:max-w-[160px]">
                {loading ? 'Switching...' : personaDisplay.label}
              </span>
            </motion.button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              className="min-w-[290px] bg-white/96 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:bg-[#090D1A]/94 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-2xl p-1.5 z-[200]"
            >
              <div className="px-3 py-2 mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  🎭 Experience Persona
                </p>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">100% Local</span>
              </div>
              {PERSONAS.map((persona) => (
                <DropdownMenu.Item
                  key={persona.id}
                  onClick={() => handlePersonaSwitch(persona.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer outline-none transition-all ${
                    activePersona === persona.id
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-2xl">{persona.emoji}</span>
                  <div>
                    <p className="text-sm font-medium">{persona.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{persona.desc}</p>
                  </div>
                </DropdownMenu.Item>
              ))}

              {/* Persona Architect Studio Launch CTA */}
              <div className="pt-2 mt-1.5 border-t border-slate-100 dark:border-white/[0.08]">
                <DropdownMenu.Item
                  onClick={() => {
                    playClickSound();
                    setPersonaStudioOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-all bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 hover:from-purple-500/20 hover:to-cyan-500/20 text-slate-900 dark:text-slate-100 border border-purple-500/20"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                    ✨
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Persona Architect Studio</p>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold">30s</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Craft your bespoke financial universe</p>
                  </div>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* ─── DYNAMIC COUNTRY & CULTURAL BAZAAR SELECTOR ─── */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              title={`Selected Country: ${country.name} (${country.defaultCurrency})`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span className="text-sm leading-none shrink-0">{country.flag}</span>
              <span className="font-semibold hidden 2xl:inline truncate max-w-[90px]">{country.name}</span>
              <span className="font-mono font-semibold 2xl:hidden">{country.code}</span>
            </motion.button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="start"
              className="min-w-[280px] max-h-[380px] overflow-y-auto bg-white/96 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:bg-[#090D1A]/94 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-2xl p-1.5 z-[200]"
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>🌍 Select Country & Culture</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">Worldwide (195+)</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {allCountries.map((c) => (
                  <DropdownMenu.Item
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer outline-none transition-all ${
                      country.code === c.code
                        ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 font-bold border border-cyan-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{c.defaultCurrency}</span>
                  </DropdownMenu.Item>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* ─── DYNAMIC MULTI-LANGUAGE / VERNACULAR SELECTOR ─── */}
        <LanguageDropdown />
      </div>

      {/* Center: Omnimodal Omnibox Search Container (Master Spec 5.1 & Adaptive Flex) */}
      <div className="flex-1 flex justify-center max-w-lg min-w-[120px] mx-1 xl:mx-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-10 ps-3.5 pe-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/60 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14] focus:outline-none focus-within:border-cyan-500/80 dark:focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-500/10 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs transition-all cursor-pointer shadow-xs min-w-0"
        >
          <Search size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
          <span className="truncate text-slate-600 dark:text-slate-300 font-medium min-w-0">
            {t.header.searchPlaceholder}
          </span>
          <kbd className="ms-auto hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 select-none shadow-xs">
            <Command size={10} /> K
          </kbd>
        </motion.button>
      </div>

      {/* Right: Currency + Dual-Theme Toggle + Audio Synth + Voice + Notifications */}
      <div className="flex items-center gap-1.5 xl:gap-2 shrink-0 ms-auto">

        {/* Currency Switcher */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 shadow-xs transition-all shrink-0 cursor-pointer"
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
              className="min-w-[200px] bg-white/96 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:bg-[#090D1A]/94 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-2xl p-1.5 z-[200]"
            >
              {SUPPORTED_CURRENCIES.map((cur) => (
                <DropdownMenu.Item
                  key={cur.code}
                  onClick={() => setBaseCurrency(cur.code as CurrencyCode)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer outline-none text-sm transition-all ${
                    baseCurrency === cur.code
                      ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 font-bold border border-cyan-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{cur.flag}</span>
                  <span className="font-medium">{cur.code}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">{cur.name}</span>
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
          className="relative w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-all cursor-pointer shrink-0 shadow-xs"
        >
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-purple-600" />}
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
          className={`relative w-8 h-8 xl:w-9 xl:h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
            soundEnabled
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
              : 'bg-slate-100/90 dark:bg-white/[0.04] border-slate-200/90 dark:border-white/[0.08] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={playClickSound}
          className="relative w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 cursor-pointer shadow-xs"
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
