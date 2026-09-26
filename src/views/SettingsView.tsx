// AuraFinance OS — Settings View with AES-GCM (256-bit) Encrypted Vault Backup & Restore
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore, type CurrencyCode } from '../store/useAppStore';
import { useCurrency, SUPPORTED_CURRENCIES } from '../hooks/useCurrency';
import {
  Settings,
  Key,
  Database,
  Globe,
  Languages,
  Sparkles,
  MapPin,
  Coins,
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { JsonBackupRestoreModal } from '../components/modals/JsonBackupRestoreModal';
import HardwarePerformanceCard from '../components/settings/HardwarePerformanceCard';
import { EncryptedVaultDeck } from '../components/settings/EncryptedVaultDeck';

export default function SettingsView() {
  const { geminiApiKey, setGeminiApiKey, baseCurrency, setBaseCurrency, activePersona } = useAppStore();
  const [jsonVaultModalOpen, setJsonVaultModalOpen] = useState(false);
  const {
    locale,
    country,
    currentLanguage,
    isRTL,
    bazaarTerms,
    culturalTheme,
    setLanguage,
    setCountry,
    supportedLocales,
    allCountries,
  } = useTranslation();
  const transactions = useLiveQuery(() => db.transactions.count()) || 0;
  const goals = useLiveQuery(() => db.goals.count()) || 0;
  const subs = useLiveQuery(() => db.subscriptions.count()) || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 overflow-y-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-aura-text flex items-center gap-2">
          <Settings size={24} className="text-aura-accent" /> Settings & Security Vault
        </h1>
        <p className="text-sm text-aura-text-muted mt-1">
          Zero-backend, local-first configuration and cryptographic key storage
        </p>
      </div>

      {/* Global Localization & Cultural Bazaar Engine */}
      <div className="glass-card p-5 border border-aura-accent/25 bg-gradient-to-br from-aura-card via-purple-950/15 to-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-aura-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-aura-accent/15 text-aura-accent">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                Global Localization & Cultural Engine
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  195+ Countries
                </span>
              </h3>
              <p className="text-xs text-aura-text-muted mt-0.5">
                Every country has unique daily bazaars, shopping patterns, currency units, and financial jargon.
              </p>
            </div>
          </div>

          {/* Active Cultural Atmosphere Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-aura-border">
            <Sparkles size={14} className="text-amber-400" />
            <div className="text-left">
              <p className="text-[10px] text-aura-text-muted uppercase tracking-wider">Atmosphere</p>
              <p className="text-xs font-semibold text-aura-text">{culturalTheme.label}</p>
            </div>
          </div>
        </div>

        {/* Country & Region Quick Switcher */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-aura-text mb-2 flex items-center gap-1.5">
            <MapPin size={14} className="text-aura-accent" /> Active Country & Bazaar Culture:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {[
              { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
              { code: 'AE', name: 'UAE', flag: '🇦🇪' },
              { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
              { code: 'JP', name: 'Japan', flag: '🇯🇵' },
              { code: 'US', name: 'USA', flag: '🇺🇸' },
              { code: 'GB', name: 'UK', flag: '🇬🇧' },
              { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
              { code: 'DE', name: 'Germany', flag: '🇩🇪' },
              { code: 'IN', name: 'India', flag: '🇮🇳' },
              { code: 'FR', name: 'France', flag: '🇫🇷' },
              { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
              { code: 'CA', name: 'Canada', flag: '🇨🇦' },
            ].map((c) => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  country.code === c.code
                    ? 'bg-aura-accent/25 border-aura-accent text-white shadow-md shadow-aura-accent/20 font-bold'
                    : 'bg-white/[0.03] border-aura-border text-aura-text-muted hover:text-aura-text hover:bg-white/5'
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Full Country Dropdown */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-aura-text-muted">Or search all 195+ nations:</span>
            <select
              value={country.code}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent"
            >
              {allCountries.map((c) => (
                <option key={c.code} value={c.code} className="bg-aura-card text-aura-text">
                  {c.flag} {c.name} ({c.code}) — {c.region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language & RTL Switcher */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-aura-text mb-2 flex items-center gap-1.5">
            <Languages size={14} className="text-aura-cyan" /> App Language & Native Script:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {supportedLocales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setLanguage(loc.code)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                  currentLanguage === loc.code
                    ? 'bg-aura-cyan/20 border-aura-cyan text-white shadow-md shadow-aura-cyan/20 font-bold'
                    : 'bg-white/[0.03] border-aura-border text-aura-text-muted hover:text-aura-text hover:bg-white/5'
                }`}
              >
                <span className="truncate">{loc.nativeName}</span>
                {loc.isRTL && (
                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    RTL
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Vernacular Zero-Jargon Dictionary Preview */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-aura-border">
          <p className="text-[11px] uppercase tracking-wider text-aura-text-muted font-semibold mb-2.5">
            Active Vernacular Living Vocabulary ({country.name})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-[10px] text-aura-text-muted block">🏪 Grocery & Pantry</span>
              <span className="text-xs font-bold text-aura-text mt-0.5 block truncate">{bazaarTerms.groceryPantry}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-[10px] text-aura-text-muted block">🥬 Fresh Bazaar</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 block truncate">{bazaarTerms.freshMarket}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-[10px] text-aura-text-muted block">☕ Street Food & Cafes</span>
              <span className="text-xs font-bold text-amber-400 mt-0.5 block truncate">{bazaarTerms.streetDining}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-[10px] text-aura-text-muted block">🤝 Peer Savings Fund</span>
              <span className="text-xs font-bold text-aura-accent mt-0.5 block truncate">{bazaarTerms.savingsCommunity}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-[10px] text-aura-text-muted block">🛡️ Emergency Vault</span>
              <span className="text-xs font-bold text-cyan-400 mt-0.5 block truncate">{bazaarTerms.emergencyFund}</span>
            </div>
          </div>
          <p className="text-[11px] text-aura-text-muted mt-2.5">
            Local preset merchants: <span className="text-aura-text-secondary">{locale.sampleMerchants.join(', ')}</span>
          </p>
        </div>
      </div>

      {/* Hardware Performance & Eco Voice Mode Control Panel */}
      <HardwarePerformanceCard />

      {/* Global Base Currency Setting */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Coins size={18} className="text-aura-accent" />
          <h3 className="text-sm font-semibold text-aura-text">Base Operating Currency</h3>
        </div>
        <p className="text-xs text-aura-text-muted mb-4">
          All financial metric cards, bento charts, and 50/30/20 budgets dynamically convert to this currency in
          real-time.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setBaseCurrency(c.code)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                baseCurrency === c.code
                  ? 'bg-aura-accent/20 border-aura-accent text-white shadow-lg shadow-aura-accent/10'
                  : 'bg-white/[0.03] border-aura-border text-aura-text-muted hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span className="text-xs font-bold font-mono">{c.code}</span>
              </div>
              <span className="text-xs font-bold text-aura-accent">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pre-Configured System Gemini AI Core Status */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-aura-text">Google Gemini AI Engine</h3>
              <p className="text-[11px] text-aura-text-muted mt-0.5">Gemini 2.0 Flash Multimodal Core</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System AI Core: Active & Connected (Pro Tier)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-aura-border text-xs text-aura-text-muted leading-relaxed">
          Pre-calibrated enterprise runtime is active out-of-the-box. Powers Gemini 2.0 Flash Vision for receipt OCR, autonomous voice intent parsing, CPA general ledger audit, and intelligent cultural copilot advisory with zero manual token configuration required.
        </div>
      </div>

      {/* Local IndexedDB Health */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-aura-cyan" />
          <h3 className="text-sm font-semibold text-aura-text">Local-First Vault Status (Dexie.js)</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-xl font-bold text-aura-text font-mono tabular-nums">{transactions}</p>
            <p className="text-xs text-aura-text-muted mt-0.5">Transactions</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-xl font-bold text-aura-text font-mono tabular-nums">{goals}</p>
            <p className="text-xs text-aura-text-muted mt-0.5">Active Goals</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-xl font-bold text-aura-text font-mono tabular-nums">{subs}</p>
            <p className="text-xs text-aura-text-muted mt-0.5">Subscriptions</p>
          </div>
        </div>
      </div>

      {/* Encrypted Vault Backup & 24-Hour Intraday Bank Statement Deck */}
      <EncryptedVaultDeck />

      {/* About */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-aura-text mb-2">About AuraFinance OS</h3>
        <p className="text-xs text-aura-text-muted leading-relaxed">
          AuraFinance OS is a zero-knowledge, local-first personal wealth operating system. All data is stored
          exclusively in your browser's IndexedDB. No external backend server, no cookies, no surveillance telemetry.
          Built with React 19, TypeScript, Dexie.js, Web Crypto API, and multimodal Gemini AI integration.
        </p>
        <p className="text-xs text-aura-text-muted mt-2 font-mono">
          v1.0.0 · {baseCurrency} base currency · {new Date().getFullYear()}
        </p>
      </div>

      {/* Master JSON Vault Modal */}
      <JsonBackupRestoreModal
        isOpen={jsonVaultModalOpen}
        onClose={() => setJsonVaultModalOpen(false)}
      />
    </motion.div>
  );
}
