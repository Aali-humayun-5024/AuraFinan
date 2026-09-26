// AuraFinance OS — Hero Liquidity Banner & Header Stage
// Implements Section 4.B Master Design Specification
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Globe,
  Sparkles,
  ChevronDown,
  Check,
  GraduationCap,
  Briefcase,
  Home,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useAppStore, type CurrencyCode } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import { generate24HourStatementPDF } from '../../services/pdfStatementGenerator';
import { seedPersona } from '../../data/seedData';
import { playClickSound, playSuccessSound } from '../../services/soundService';
import confetti from 'canvas-confetti';
import { SUPPORTED_CURRENCIES } from '../../hooks/useCurrency';
import { useCoherentFinancialState } from '../../context/FinancialStateContext';

export const HeroLiquidityBanner: React.FC = () => {
  const {
    activePersona,
    setActivePersona,
    baseCurrency,
    setBaseCurrency,
    setPersonaStudioOpen,
  } = useAppStore();
  const { t } = useTranslation();
  const { state: coherentState } = useCoherentFinancialState();

  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Compute Greeting based on local time
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const personaLabels: Record<string, string> = {
    freelancer: 'Global Freelancer',
    household: 'Household Custodian',
    student: 'High School Scholar',
    clean: 'Clean Slate Voyager',
    custom: 'Custom Architect',
  };

  const personaLabel = personaLabels[activePersona] || 'Wealth Custodian';

  const handlePersonaSwitch = async (persona: 'student' | 'freelancer' | 'household' | 'clean') => {
    playClickSound();
    await seedPersona(persona);
    setActivePersona(persona);
    if (persona === 'household') {
      setBaseCurrency('PKR');
    }
    setPersonaDropdownOpen(false);
    playSuccessSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 } });
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    playClickSound();
    try {
      await generate24HourStatementPDF({
        vaultName: 'BudgetBasics — Institutional Vault',
        baseCurrency,
        accountHolder: personaLabel,
        coherentLiquidity: coherentState.liquidity,
      });
      playSuccessSound();
    } catch (err) {
      console.error('PDF statement generation failed:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full min-h-16 px-6 py-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 dark:border-white/[0.08] bg-white/70 dark:bg-[#070A12]/60 backdrop-blur-2xl rounded-2xl shadow-xs">
      {/* ─── Left: Greeting & Persona Stack (Master Spec 4.B) ─── */}
      <div className="flex flex-col text-start">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>{timeGreeting}, {personaLabel}</span>
          <span className="inline-block text-lg select-none">✨</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Live liquidity pulse derived from client-side zero-knowledge ledger.
        </p>
      </div>

      {/* ─── Right: Hero Action Cluster (Master Spec 4.B) ─── */}
      <div className="flex items-center gap-2.5 ms-auto shrink-0 flex-wrap">
        {/* Persona Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
            title="Switch Active Persona"
          >
            <Sparkles size={13} className="text-purple-500" />
            <span className="capitalize">{personaLabel}</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${personaDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {personaDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl p-1.5 z-50
                  bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)]
                  dark:bg-[#090D1A]/92 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)]
                  backdrop-blur-3xl"
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Account Personas
                </div>

                {[
                  { id: 'freelancer' as const, label: 'Global Freelancer', icon: Briefcase, curr: 'USD' },
                  { id: 'household' as const, label: 'Pakistani Household', icon: Home, curr: 'PKR' },
                  { id: 'student' as const, label: 'High School Student', icon: GraduationCap, curr: 'USD' },
                  { id: 'clean' as const, label: 'Clean Slate Vault', icon: UserPlus, curr: 'USD' },
                ].map((p) => {
                  const Icon = p.icon;
                  const isActive = activePersona === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaSwitch(p.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={isActive ? 'text-purple-500' : 'text-slate-400'} />
                        <span>{p.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {p.curr}
                      </span>
                    </button>
                  );
                })}

                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-white/[0.08]">
                  <button
                    onClick={() => {
                      setPersonaDropdownOpen(false);
                      setPersonaStudioOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer"
                  >
                    <Zap size={13} />
                    <span>Launch Persona Studio</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Currency Switcher Dropdown (Master Spec 4.B) */}
        <div className="relative">
          <button
            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
            title="Change Base Currency"
          >
            <Globe size={13} className="text-cyan-500" />
            <span className="font-mono">{baseCurrency}</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {currencyDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-2xl p-1.5 z-50
                  bg-white/96 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)]
                  dark:bg-[#090D1A]/94 dark:border-white/[0.14] dark:shadow-[0_24px_64px_rgba(0,0,0,0.75),0_4px_16px_rgba(0,0,0,0.5)]
                  backdrop-blur-3xl max-h-60 overflow-y-auto custom-scrollbar"
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select Currency
                </div>
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <button
                    key={cur.code}
                    onClick={() => {
                      setBaseCurrency(cur.code as CurrencyCode);
                      setCurrencyDropdownOpen(false);
                      playClickSound();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      baseCurrency === cur.code
                        ? 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cur.flag}</span>
                      <span className="font-semibold">{cur.code}</span>
                    </div>
                    {baseCurrency === cur.code && <Check size={12} className="text-cyan-500" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* "Download 24H Statement" Button (Master Spec 4.B & 5.6) */}
        <button
          onClick={handleDownloadPdf}
          disabled={generatingPdf}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all cursor-pointer"
          title="Download Institutional 24-Hour Intraday Bank Statement PDF"
        >
          <FileText size={13} />
          <span>{generatingPdf ? 'Generating Statement...' : 'Download 24H Statement'}</span>
        </button>
      </div>
    </div>
  );
};

export default HeroLiquidityBanner;
