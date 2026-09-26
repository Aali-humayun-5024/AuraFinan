// AuraFinance OS — Global Cultural Bazaar & Daily Living Copilot (Every Country in the World)
// Dynamic country-driven cultural theme, zero-jargon native vocabulary, and per-unit commodity tracking
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, RefreshCw, ShoppingCart, Sparkles, TrendingDown,
  TrendingUp, Minus, Users, CheckCircle2, ChevronRight,
  Share2, ArrowDownRight, Tag, Zap, AlertCircle, Globe,
  Store, Coffee, HeartHandshake, ShieldCheck, Scale, Check
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../i18n/useTranslation';
import { useCurrency } from '../hooks/useCurrency';
import { db } from '../db/database';
import {
  COMMODITIES_DATABASE,
  CITIES_LIST,
  getItemPriceForCity,
  detectClientLocation,
  calculateMonthlyRashan,
  type CommodityItem,
} from '../services/commodityService';
import type { RegionalBazaarStaple } from '../i18n/countries';
import confetti from 'canvas-confetti';
import FinancialMetric from '../components/common/FinancialMetric';
import BazaarSentinelView from './BazaarSentinelView';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

const FEATURED_COUNTRIES = [
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', localBazaar: 'Rashan Bazzar' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', localBazaar: 'Central Souq' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', localBazaar: 'Souq Al-Khodhar' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', localBazaar: 'Shotengai' },
  { code: 'US', name: 'USA', flag: '🇺🇸', localBazaar: 'Wholesale Club' },
  { code: 'GB', name: 'UK', flag: '🇬🇧', localBazaar: 'High Street Pantry' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', localBazaar: 'Mercado Municipal' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', localBazaar: 'Wochenmarkt' },
  { code: 'IN', name: 'India', flag: '🇮🇳', localBazaar: 'Ration Mandi' },
  { code: 'FR', name: 'France', flag: '🇫🇷', localBazaar: 'Marché Frais' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', localBazaar: 'Feira Livre' },
];

export default function DailyBazaarView() {
  const {
    userCity,
    setUserCity,
    setUserLocation,
    userCountry,
    userIP,
    isLocationDetected,
    familySize,
    setFamilySize,
    activeProfileId,
  } = useAppStore();

  const {
    country,
    locale,
    setCountry,
    bazaarTerms,
    culturalTheme,
    allCountries,
    isRTL,
    t,
  } = useTranslation();

  const { convertToBase, baseCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'bazaar' | 'rashan' | 'sentinel'>('bazaar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rashan / Monthly basket Hacks interactive checklist
  const [enabledHacks, setEnabledHacks] = useState<Record<string, boolean>>({
    eggs: true,
    chicken_meat: true,
    milk_fresh: true,
    atta_flour: true,
    cooking_oil: true,
    pk_eggs: true,
    pk_chicken: true,
    pk_atta: true,
    ae_eggs: true,
    ae_rice: true,
    jp_eggs: true,
    jp_rice: true,
    us_eggs: true,
    us_chicken: true,
    mx_tortilla: true,
    mx_beans: true,
    de_bread: true,
    fr_baguette: true,
    br_beans: true,
  });

  // Auto-detect IP location on initial mount if not already detected
  useEffect(() => {
    if (!isLocationDetected) {
      setIsDetecting(true);
      detectClientLocation().then((loc) => {
        setUserLocation(loc);
        setIsDetecting(false);
      });
    }
  }, [isLocationDetected, setUserLocation]);

  const handleManualLocationRefresh = async () => {
    setIsDetecting(true);
    const loc = await detectClientLocation();
    setUserLocation(loc);
    setIsDetecting(false);
    showToast(`📍 Location updated to ${loc.city} (${loc.ip})`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Whether user is in Pakistan/South Asia or viewing PK/IN
  const isSouthAsianRegion = country.region === 'south-asia';
  const isEastAsianRegion = country.region === 'east-asia';
  const isMiddleEasternRegion = country.region === 'middle-east';
  const isLatamRegion = country.region === 'latam';

  // Regional Staples from the active Country
  const currentCountryStaples = useMemo(() => {
    return country.staples || [];
  }, [country]);

  // Filtered commodities and staples
  const filteredStaples = useMemo(() => {
    return currentCountryStaples.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.localName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.culturalNote.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [currentCountryStaples, selectedCategory, searchQuery]);

  const filteredCommodities = useMemo(() => {
    return COMMODITIES_DATABASE.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.urduName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Quick 1-tap purchase log into Dexie for Commodity
  const handleQuickLogCommodity = async (item: CommodityItem, option: { title: string; amountPKR: number }) => {
    const today = new Date().toISOString().split('T')[0];
    const amountInBase = convertToBase(option.amountPKR, 'PKR');
    const amountInUSD = Math.round((option.amountPKR / 278.5) * 100) / 100;

    await db.transactions.add({
      title: `${item.icon} ${option.title} (${userCity})`,
      amount: Math.round(amountInBase * 100) / 100,
      originalCurrency: baseCurrency,
      amountInUSD: amountInUSD,
      type: 'expense',
      bucket: 'needs',
      category: 'Food & Dining',
      merchant: `${userCity} ${bazaarTerms.groceryPantry}`,
      date: today,
      isRecurring: false,
      tags: ['daily-bazaar', item.id, 'grocery', country.code.toLowerCase()],
      profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#7c5cfc', '#f59e0b'],
    });

    showToast(`✅ Logged "${option.title}" to ${baseCurrency} Daily Expenses!`);
  };

  // Quick 1-tap purchase log into Dexie for Regional Cultural Staple
  const handleQuickLogStaple = async (staple: RegionalBazaarStaple) => {
    const today = new Date().toISOString().split('T')[0];
    const amountInBase = convertToBase(staple.basePriceUSD, 'USD');

    await db.transactions.add({
      title: `${staple.icon} ${staple.name} (${staple.unit})`,
      amount: Math.round(amountInBase * 100) / 100,
      originalCurrency: baseCurrency,
      amountInUSD: staple.basePriceUSD,
      type: 'expense',
      bucket: 'needs',
      category: 'Food & Dining',
      merchant: `${country.capital} ${country.localBazaarName.split('(')[0].trim()}`,
      date: today,
      isRecurring: false,
      tags: ['cultural-bazaar', country.code.toLowerCase(), staple.id, 'groceries'],
      profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#7c5cfc', '#f59e0b'],
    });

    showToast(`✅ Logged "${staple.icon} ${staple.name}" in ${baseCurrency} to Expenses!`);
  };

  // Monthly Rashan calculation
  const rashanData = useMemo(() => {
    return calculateMonthlyRashan(familySize, userCity);
  }, [familySize, userCity]);

  // Dynamic calculated savings based on active toggles
  const activeSavingsTotalPKR = useMemo(() => {
    return rashanData.itemsBreakdown.reduce((sum, entry) => {
      if (enabledHacks[entry.item.id]) {
        return sum + entry.potentialSaving;
      }
      return sum;
    }, 0);
  }, [rashanData, enabledHacks]);

  // Converted monthly metrics in baseCurrency
  const rashanMonthlyBillBase = useMemo(() => {
    return convertToBase(rashanData.totalEstimatedPKR, 'PKR');
  }, [rashanData.totalEstimatedPKR, convertToBase]);

  const rashanMonthlySavingsBase = useMemo(() => {
    return convertToBase(activeSavingsTotalPKR, 'PKR');
  }, [activeSavingsTotalPKR, convertToBase]);

  // Global Basket Estimations for other countries
  const globalMonthlyBasketUSD = useMemo(() => {
    const baseHouseholdPerPersonUSD = country.region === 'americas-europe' ? 240 : country.region === 'east-asia' ? 210 : country.region === 'middle-east' ? 190 : 130;
    return baseHouseholdPerPersonUSD * Math.max(1, familySize * 0.85);
  }, [country.region, familySize]);

  const globalMonthlyBasketBase = useMemo(() => {
    return convertToBase(globalMonthlyBasketUSD, 'USD');
  }, [globalMonthlyBasketUSD, convertToBase]);

  const globalMonthlySavingsBase = useMemo(() => {
    return globalMonthlyBasketBase * 0.18; // Average 18% savings with wholesale/bazaar arbitrage
  }, [globalMonthlyBasketBase]);

  const toggleHack = (itemId: string) => {
    setEnabledHacks((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleShareWhatsApp = () => {
    const textLines = [
      `🛒 *AuraFinance OS — ${country.name} Living & Food Basket (${country.localBazaarName})*`,
      `👨‍👩‍👧 Household Size: ${familySize} Persons`,
      `📍 Region: ${country.capital}, ${country.name}`,
      `💰 Monthly Living Budget: ${baseCurrency} ${Math.round(isSouthAsianRegion ? rashanMonthlyBillBase : globalMonthlyBasketBase).toLocaleString()}`,
      `✨ Potential Bachat / Savings: ${baseCurrency} ${Math.round(isSouthAsianRegion ? rashanMonthlySavingsBase : globalMonthlySavingsBase).toLocaleString()}`,
      `----------------------------------------`,
      ...currentCountryStaples.map(
        (s) => `• ${s.icon} ${s.name} (${s.unit}): ${s.unitPriceDesc}`
      ),
      `----------------------------------------`,
      `Zero-knowledge personal wealth operating system — AuraFinance OS`,
    ];
    const encoded = encodeURIComponent(textLines.join('\n'));
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Cultural theme styling variables
  const themeAccentGradient = useMemo(() => {
    if (country.region === 'south-asia') return 'from-emerald-950/40 via-aura-card to-amber-950/30 border-emerald-500/30';
    if (country.region === 'middle-east') return 'from-amber-950/40 via-aura-card to-blue-950/30 border-amber-500/30';
    if (country.region === 'east-asia') return 'from-rose-950/40 via-aura-card to-indigo-950/30 border-rose-500/30';
    if (country.region === 'latam') return 'from-orange-950/40 via-aura-card to-yellow-950/30 border-orange-500/30';
    return 'from-slate-900/60 via-aura-card to-blue-950/30 border-aura-border';
  }, [country.region]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 font-medium text-sm"
          >
            <Zap size={18} className="text-amber-300 animate-bounce" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          GLOBAL COUNTRY & CULTURAL REGION SELECTOR BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-3 md:p-4 border border-aura-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-aura-text-muted shrink-0 mr-1">
            <Globe size={15} className="text-aura-accent" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">World Bazaars:</span>
          </div>
          {FEATURED_COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setCountry(c.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                country.code === c.code
                  ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/30 font-bold scale-105'
                  : 'bg-white/5 text-aura-text-muted hover:text-aura-text hover:bg-white/10'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* 195+ Countries Selector Dropdown */}
        <div className="shrink-0 flex items-center gap-2 self-end md:self-auto">
          <select
            value={country.code}
            onChange={(e) => setCountry(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent cursor-pointer"
          >
            {allCountries.map((c) => (
              <option key={c.code} value={c.code} className="bg-aura-card text-aura-text">
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CULTURAL HERO BANNER: LOCAL BAZAAR & ATMOSPHERE
          ───────────────────────────────────────────────────────────── */}
      <div className={`glass-card p-5 md:p-6 bg-gradient-to-r ${themeAccentGradient} transition-all duration-500`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Commodity Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-aura-accent/20 text-aura-accent border border-aura-accent/30 flex items-center gap-1">
                <span>{country.flag}</span>
                <span>{country.nativeName}</span>
              </span>
              <span className="text-xs text-aura-text-muted">
                {isLocationDetected ? `Auto IP: ${userIP || '119.160.119.50'}` : 'Local-First Engine'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-aura-text flex items-center gap-2.5">
              <span>🛒</span>
              <span>{country.localBazaarName}</span>
            </h1>

            <p className="text-xs md:text-sm text-aura-text-secondary mt-1 max-w-2xl">
              Authentic regional commodities, per-unit food prices (1 egg, fresh meat, staples, fuel), and cultural saving strategies for <strong className="text-aura-text">{country.name} ({country.capital})</strong>.
            </p>

            {/* Zero-Jargon Vernacular Terminology Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-aura-text flex items-center gap-1">
                <Store size={13} className="text-cyan-400" />
                <span className="text-aura-text-muted">Pantry:</span> <strong>{bazaarTerms.groceryPantry}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-aura-text flex items-center gap-1">
                <Tag size={13} className="text-emerald-400" />
                <span className="text-aura-text-muted">Market:</span> <strong>{bazaarTerms.freshMarket}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-aura-text flex items-center gap-1">
                <Coffee size={13} className="text-amber-400" />
                <span className="text-aura-text-muted">Dining:</span> <strong>{bazaarTerms.streetDining}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-aura-text flex items-center gap-1">
                <HeartHandshake size={13} className="text-aura-accent" />
                <span className="text-aura-text-muted">Savings:</span> <strong>{bazaarTerms.savingsCommunity}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-aura-text flex items-center gap-1">
                <ShieldCheck size={13} className="text-teal-400" />
                <span className="text-aura-text-muted">Emergency:</span> <strong>{bazaarTerms.emergencyFund}</strong>
              </span>
            </div>
          </div>

          {/* Location & City Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-aura-border">
              <MapPin size={16} className="text-aura-accent" />
              <div className="text-left">
                <p className="text-[10px] text-aura-text-muted uppercase tracking-wider">Active City</p>
                {isSouthAsianRegion ? (
                  <select
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-aura-text outline-none cursor-pointer"
                  >
                    {CITIES_LIST.map((c) => (
                      <option key={c.id} value={c.id} className="bg-aura-card text-aura-text">
                        {c.name} ({c.urduName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-aura-text outline-none cursor-pointer"
                  >
                    {country.majorCities.map((city) => (
                      <option key={city} value={city} className="bg-aura-card text-aura-text">
                        {city}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualLocationRefresh}
              disabled={isDetecting}
              title={`Detect IP (Currently: ${userIP || '119.160.119.50'})`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-aura-accent/15 border border-aura-accent/30 text-aura-accent text-xs font-medium hover:bg-aura-accent/25 transition-all"
            >
              <RefreshCw size={14} className={isDetecting ? 'animate-spin' : ''} />
              <span>{isDetecting ? 'Traced...' : 'Trace IP'}</span>
            </motion.button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-aura-border pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bazaar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'bazaar'
                ? 'bg-aura-accent text-white shadow-lg shadow-aura-accent/30 font-bold'
                : 'text-aura-text-secondary hover:text-aura-text hover:bg-white/5'
            }`}
          >
            <Tag size={16} />
            Daily Market Prices ({bazaarTerms.freshMarket})
          </button>
          <button
            onClick={() => setActiveTab('rashan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'rashan'
                ? 'bg-aura-accent text-white shadow-lg shadow-aura-accent/30 font-bold'
                : 'text-aura-text-secondary hover:text-aura-text hover:bg-white/5'
            }`}
          >
            <ShoppingCart size={16} />
            {isEastAsianRegion
              ? 'Kakeibo (家計簿) Living Budget & Bachat'
              : isMiddleEasternRegion
              ? 'Monthly Souq & Baqala Rationing'
              : isLatamRegion
              ? 'Canasta Básica & Tiendita Budget'
              : 'Monthly Rashan & Bachat (ماہانہ راشن بچت)'}
          </button>
          <button
            onClick={() => setActiveTab('sentinel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'sentinel'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 font-bold'
                : 'text-aura-text-secondary hover:text-aura-text hover:bg-white/5'
            }`}
          >
            <Scale size={16} />
            Price Sentinel (اینٹی گراں فروشی)
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: DAILY CULTURAL BAZAAR PRICES & REGIONAL STAPLES
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'bazaar' && (
        <div className="space-y-6">
          {/* Quick Highlight Strips Adapted to Active Region */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isSouthAsianRegion ? (
              <>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border flex items-center gap-3">
                  <span className="text-3xl shrink-0 select-none">🥚</span>
                  <div className="text-left">
                    <p className="text-[11px] text-aura-text-muted font-medium">1 Egg (Single)</p>
                    <div className="flex items-baseline gap-1">
                      <FinancialMetric
                        value={convertToBase(getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'eggs')!, userCity) / 12, 'PKR')}
                        currency={baseCurrency}
                        size="sm"
                        color="text-aura-text font-bold"
                        align="left"
                      />
                    </div>
                    <span className="text-[10px] text-amber-400 block font-mono">₨ 360 / Dozen</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border flex items-center gap-3">
                  <span className="text-3xl shrink-0 select-none">🍗</span>
                  <div className="text-left">
                    <p className="text-[11px] text-aura-text-muted font-medium">1 kg Fresh Chicken</p>
                    <div className="flex items-baseline gap-1">
                      <FinancialMetric
                        value={convertToBase(getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'chicken_meat')!, userCity), 'PKR')}
                        currency={baseCurrency}
                        size="sm"
                        color="text-emerald-400 font-bold"
                        symbolColor="text-emerald-400/80"
                        align="left"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-mono">Mandi Wholesale</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border flex items-center gap-3">
                  <span className="text-3xl shrink-0 select-none">🥛</span>
                  <div className="text-left">
                    <p className="text-[11px] text-aura-text-muted font-medium">1 Litre Fresh Milk</p>
                    <div className="flex items-baseline gap-1">
                      <FinancialMetric
                        value={convertToBase(getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'milk_fresh')!, userCity), 'PKR')}
                        currency={baseCurrency}
                        size="sm"
                        color="text-aura-text font-bold"
                        align="left"
                      />
                    </div>
                    <span className="text-[10px] text-aura-text-muted block">Govt Regulated</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border flex items-center gap-3">
                  <span className="text-3xl shrink-0 select-none">🌾</span>
                  <div className="text-left">
                    <p className="text-[11px] text-aura-text-muted font-medium">Chakki Atta (10kg)</p>
                    <div className="flex items-baseline gap-1">
                      <FinancialMetric
                        value={convertToBase(getItemPriceForCity(COMMODITIES_DATABASE.find((c) => c.id === 'atta_flour')!, userCity), 'PKR')}
                        currency={baseCurrency}
                        size="sm"
                        color="text-cyan-400 font-bold"
                        symbolColor="text-cyan-400/80"
                        align="left"
                      />
                    </div>
                    <span className="text-[10px] text-aura-text-muted block font-mono">100% Whole Wheat</span>
                  </div>
                </div>
              </>
            ) : (
              currentCountryStaples.slice(0, 4).map((staple) => (
                <div key={staple.id} className="p-3 rounded-2xl bg-white/[0.03] border border-aura-border flex items-center gap-3">
                  <span className="text-3xl shrink-0 select-none">{staple.icon}</span>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] text-aura-text-muted font-medium truncate">{staple.name}</p>
                    <div className="flex items-baseline gap-1">
                      <FinancialMetric
                        value={convertToBase(staple.basePriceUSD, 'USD')}
                        currency={baseCurrency}
                        size="sm"
                        color="text-aura-text font-bold"
                        align="left"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-mono truncate">{staple.unit}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'dairy_bakery', label: '🥚 Dairy & Bakery' },
                { id: 'poultry_meat', label: '🍗 Meat & Protein' },
                { id: 'staples', label: '🌾 Grains & Staples' },
                { id: 'oil_ghee', label: '🫒 Oils & Fats' },
                { id: 'produce', label: '🥬 Fresh Produce' },
                { id: 'energy_fuel', label: '⛽ Fuel & Energy' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-aura-accent/25 text-aura-accent border border-aura-accent/40 font-bold'
                      : 'bg-white/5 text-aura-text-muted hover:text-aura-text'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${country.name} staples...`}
                className="w-full px-3 py-2 bg-white/5 border border-aura-border rounded-xl text-xs text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent"
              />
            </div>
          </div>

          {/* SECTION A: CULTURAL STAPLES OF ACTIVE COUNTRY */}
          {currentCountryStaples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name} Cultural Food & Living Staples</span>
                  <span className="text-xs font-normal text-aura-text-muted">
                    ({filteredStaples.length} items)
                  </span>
                </h2>
                <span className="text-xs text-aura-text-muted">
                  Prices auto-converted to <strong className="text-aura-accent">{baseCurrency}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStaples.map((staple) => {
                  const convertedPrice = convertToBase(staple.basePriceUSD, 'USD');

                  return (
                    <motion.div
                      key={staple.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="glass-card p-4 flex flex-col justify-between hover:border-aura-accent/40 transition-all group"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl p-2 rounded-2xl bg-white/5 border border-white/5 select-none">
                              {staple.icon}
                            </span>
                            <div>
                              <h3 className="font-semibold text-aura-text text-sm">{staple.name}</h3>
                              <p className="text-xs text-aura-text-muted">{staple.localName}</p>
                            </div>
                          </div>

                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-aura-accent/15 text-aura-accent border border-aura-accent/25">
                            {staple.unit}
                          </span>
                        </div>

                        {/* Price Display */}
                        <div className="my-3 p-3 rounded-xl bg-white/[0.02] border border-aura-border">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-left">
                              <p className="text-[10px] uppercase tracking-wider text-aura-text-muted font-medium">
                                Market Benchmark Rate
                              </p>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <FinancialMetric
                                  value={convertedPrice}
                                  currency={baseCurrency}
                                  size="lg"
                                  color="text-aura-text font-black"
                                  align="left"
                                />
                                <span className="text-xs font-normal text-aura-text-secondary select-none">/ {staple.unit}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-aura-text-muted block">
                                {staple.unitPriceDesc}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-aura-text-muted mt-2 flex items-start gap-1.5">
                            <Sparkles size={12} className="text-aura-accent shrink-0 mt-0.5" />
                            <span>{staple.culturalNote}</span>
                          </p>
                        </div>

                        {/* Bachat / Saving Tip */}
                        <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 mb-4">
                          <p className="text-[11px] text-emerald-400 font-medium leading-relaxed">
                            💡 <span className="font-bold">Bachat Hack:</span> {staple.savingTip}
                          </p>
                        </div>
                      </div>

                      {/* 1-Tap Quick Log Button */}
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickLogStaple(staple)}
                          className="w-full py-2 rounded-xl bg-aura-accent/15 hover:bg-aura-accent/30 border border-aura-accent/30 text-aura-accent text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Zap size={14} />
                          <span>1-Tap Log to Expenses</span>
                          <span className="font-bold font-mono">({baseCurrency} {Math.round(convertedPrice)})</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION B: GRANULAR COMMODITY RADAR (IF SOUTH ASIA / PAKISTAN) */}
          {isSouthAsianRegion && (
            <div className="space-y-4 pt-4 border-t border-aura-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-aura-text flex items-center gap-2">
                    <span>🌾</span>
                    <span>Daily Per-Unit Commodity Price Radar ({userCity})</span>
                  </h2>
                  <p className="text-xs text-aura-text-muted">
                    Down to 1 single egg, 1kg chicken, milk, atta, banaspati ghee & petrol rates
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Synced with Wholesale Mandi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommodities.map((item) => {
                  const currentPricePKR = getItemPriceForCity(item, userCity);
                  const convertedPrice = convertToBase(currentPricePKR, 'PKR');
                  const singlePricePKR = item.id === 'eggs' ? Math.round(currentPricePKR / 12) : currentPricePKR;
                  const singlePriceBase = convertToBase(singlePricePKR, 'PKR');

                  return (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="glass-card p-4 flex flex-col justify-between hover:border-aura-accent/40 transition-all group"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl p-2 rounded-2xl bg-white/5 border border-white/5 select-none">
                              {item.icon}
                            </span>
                            <div>
                              <h3 className="font-semibold text-aura-text text-sm">{item.name}</h3>
                              <p className="text-xs text-aura-text-muted">{item.urduName}</p>
                            </div>
                          </div>

                          {/* Trend Badge */}
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0 ${
                              item.trend === 'down'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : item.trend === 'up'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-white/5 text-aura-text-muted'
                            }`}
                          >
                            {item.trend === 'down' && <TrendingDown size={11} />}
                            {item.trend === 'up' && <TrendingUp size={11} />}
                            {item.trend === 'stable' && <Minus size={11} />}
                            {item.trend === 'down' ? `₨ ${Math.abs(item.dailyChange)} down` : item.trend === 'up' ? `+₨ ${item.dailyChange}` : 'Stable'}
                          </span>
                        </div>

                        {/* Prominent Per-Unit Price */}
                        <div className="my-3 p-3 rounded-xl bg-white/[0.02] border border-aura-border">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-left">
                              <p className="text-[10px] uppercase tracking-wider text-aura-text-muted font-medium">
                                {userCity} Official Rate
                              </p>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <FinancialMetric
                                  value={convertedPrice}
                                  currency={baseCurrency}
                                  size="lg"
                                  color="text-aura-text font-black"
                                  align="left"
                                />
                                <span className="text-xs font-normal text-aura-text-secondary select-none">/ {item.unit}</span>
                              </div>
                            </div>
                            {item.id === 'eggs' && (
                              <div className="text-right self-end">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                                  🥚 <FinancialMetric value={singlePriceBase} currency={baseCurrency} size="xs" color="text-amber-400 font-bold" suffix="/ Egg" />
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-aura-text-muted mt-1.5 flex items-center gap-1">
                            <Sparkles size={11} className="text-aura-accent shrink-0" />
                            <span>{item.forecastNote}</span>
                          </p>
                        </div>

                        {/* Smart Bachat Hack */}
                        <div className="p-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 mb-4">
                          <p className="text-[11px] text-emerald-400 font-medium leading-relaxed">
                            💡 <span className="font-bold">Bachat Tip:</span> {item.bachatTip}
                          </p>
                        </div>
                      </div>

                      {/* 1-Tap Quick Purchase Logger Buttons */}
                      <div>
                        <p className="text-[10px] text-aura-text-muted uppercase tracking-wider mb-1.5">
                          ⚡ 1-Tap Log Expense
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.quickLogOptions.slice(0, 3).map((opt, i) => {
                            const optBase = convertToBase(opt.amountPKR, 'PKR');
                            return (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleQuickLogCommodity(item, opt)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-aura-accent/20 hover:border-aura-accent/30 border border-aura-border text-[11px] text-aura-text-secondary hover:text-aura-text transition-all flex items-center gap-1"
                              >
                                <span>{opt.label}</span>
                                <span className="font-bold text-aura-accent font-mono">
                                  {baseCurrency === 'PKR' ? `₨${opt.amountPKR}` : `${baseCurrency} ${Math.round(optBase)}`}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MONTHLY LIVING BASKET & BACHAT SIMULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'rashan' && (
        <div className="space-y-6">
          {/* Family Size & Budget Summary Hero */}
          <div className="glass-card p-6 bg-gradient-to-br from-aura-card via-purple-950/20 to-emerald-950/30 border border-aura-accent/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-aura-accent/20 text-aura-accent border border-aura-accent/30">
                  {country.flag} {country.name} Living Optimizer
                </span>
                <h2 className="text-2xl font-bold text-aura-text mt-2">
                  {isEastAsianRegion
                    ? `Kakeibo (家計簿) Monthly Living Basket for ${userCity}`
                    : isMiddleEasternRegion
                    ? `Souq & Baqala Monthly Ration Planner for ${userCity}`
                    : `Monthly Rashan & Living Planner for ${userCity}`}
                </h2>
                <p className="text-sm text-aura-text-secondary mt-1 max-w-xl">
                  {isEastAsianRegion
                    ? 'Divides your monthly outflow into the 4 Kakeibo pillars (Survival, Optional, Culture, Extra) and optimizes wholesale fresh market staples.'
                    : 'Adjust your household size to auto-calculate required living staples and see how much you can save every month using bulk & local bazaar arbitrage.'}
                </p>

                {/* Family Size Selector */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-aura-text-muted font-medium mr-2 flex items-center gap-1">
                    <Users size={14} /> Household:
                  </span>
                  {[
                    { size: 2, label: '1-2 Persons' },
                    { size: 4, label: '3-4 Persons' },
                    { size: 6, label: '5-6 Persons' },
                    { size: 8, label: '7+ Joint Family' },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      onClick={() => setFamilySize(preset.size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        familySize === preset.size
                          ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/30 font-bold'
                          : 'bg-white/5 text-aura-text-secondary hover:text-aura-text'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Financial Summary Stat Cards */}
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-aura-border text-center">
                  <p className="text-xs text-aura-text-muted uppercase tracking-wider font-semibold">Estimated Monthly Bill</p>
                  <div className="mt-1 flex items-baseline justify-center">
                    <FinancialMetric
                      value={isSouthAsianRegion ? rashanMonthlyBillBase : globalMonthlyBasketBase}
                      currency={baseCurrency}
                      size="xl"
                      color="text-aura-text font-black"
                      align="center"
                    />
                  </div>
                  <span className="text-[11px] text-aura-text-secondary block mt-0.5">
                    for {familySize} family members
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-center">
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Potential Bachat / Savings</p>
                  <div className="mt-1 flex items-baseline justify-center">
                    <FinancialMetric
                      value={isSouthAsianRegion ? rashanMonthlySavingsBase : globalMonthlySavingsBase}
                      currency={baseCurrency}
                      size="xl"
                      color="text-emerald-400 font-black"
                      symbolColor="text-emerald-400/80"
                      fractionColor="text-emerald-400/80"
                      align="center"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-400/80 block mt-0.5">
                    Saved every month!
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-aura-border">
              <div className="flex items-center gap-2 text-xs text-aura-text-muted">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Benchmark synced with {country.name} ({userCity}) wholesale benchmarks</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Share2 size={14} />
                  <span>Share Basket on WhatsApp</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Interactive Bachat Checklist */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  Cultural Bachat Simulator ({baseCurrency} {Math.round(isSouthAsianRegion ? rashanMonthlySavingsBase : globalMonthlySavingsBase).toLocaleString()} / Month)
                </h3>
                <p className="text-xs text-aura-text-muted">
                  Toggle recommended buying strategies to see your monthly grocery bill reduce in real time.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                {Object.values(enabledHacks).filter(Boolean).length} Bachat Hacks Active
              </span>
            </div>

            <div className="space-y-2.5">
              {currentCountryStaples.map((staple) => {
                const isChecked = !!enabledHacks[staple.id];
                const savingBase = convertToBase(staple.basePriceUSD * 0.22 * familySize, 'USD');

                return (
                  <motion.div
                    key={staple.id}
                    onClick={() => toggleHack(staple.id)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isChecked
                        ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                        : 'bg-white/[0.02] border-aura-border opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-aura-text-muted bg-transparent'
                        }`}
                      >
                        {isChecked && <CheckCircle2 size={13} />}
                      </div>
                      <span className="text-2xl">{staple.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-aura-text">{staple.name}</p>
                        <p className="text-xs text-aura-text-secondary">{staple.savingTip}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <FinancialMetric
                        value={savingBase}
                        currency={baseCurrency}
                        size="xs"
                        color="text-emerald-400 font-bold"
                        symbolColor="text-emerald-400/80"
                        prefixSign="+"
                        align="right"
                      />
                      <p className="text-[10px] text-aura-text-muted mt-0.5">Monthly Bachat</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detailed Monthly Grocery Checklist Breakdown */}
          {isSouthAsianRegion && (
            <div className="glass-card p-5">
              <h3 className="text-base font-bold text-aura-text mb-1">
                📋 Recommended Monthly Household Quantities ({familySize} Persons)
              </h3>
              <p className="text-xs text-aura-text-muted mb-4">
                Standard nutrition & consumption benchmarks according to Pakistan Household Integrated Economic Survey.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-aura-border text-aura-text-muted uppercase tracking-wider">
                      <th className="pb-3 font-semibold text-left">Item & Commodity</th>
                      <th className="pb-3 font-semibold text-right">Monthly Quantity</th>
                      <th className="pb-3 font-semibold text-right">Unit Price ({userCity})</th>
                      <th className="pb-3 font-semibold text-right">Total Cost</th>
                      <th className="pb-3 font-semibold text-center">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aura-border">
                    {rashanData.itemsBreakdown.map((entry) => {
                      const unitBase = convertToBase(entry.unitPrice, 'PKR');
                      const totalBase = convertToBase(entry.totalCost, 'PKR');

                      return (
                        <tr key={entry.item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-medium text-aura-text flex items-center gap-2 text-left">
                            <span className="select-none">{entry.item.icon}</span>
                            <div>
                              <span>{entry.item.name}</span>
                              <span className="block text-[10px] text-aura-text-muted">{entry.item.urduName}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono tabular-nums text-aura-text-secondary">
                            <span className="font-semibold text-aura-text">{entry.monthlyQty}</span> {entry.item.monthlyQtyUnit}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-baseline justify-end gap-1">
                              <FinancialMetric
                                value={unitBase}
                                currency={baseCurrency}
                                size="xs"
                                align="right"
                              />
                              <span className="text-[10px] text-aura-text-muted select-none">/ {entry.item.unit}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-baseline justify-end">
                              <FinancialMetric
                                value={totalBase}
                                currency={baseCurrency}
                                size="sm"
                                color="text-aura-text font-bold"
                                align="right"
                              />
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() =>
                                handleQuickLogCommodity(entry.item, {
                                  title: `Monthly ${entry.item.name} (${entry.monthlyQty} ${entry.item.monthlyQtyUnit})`,
                                  amountPKR: entry.totalCost,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-aura-accent/15 hover:bg-aura-accent/30 text-aura-accent font-semibold text-[11px] transition-all"
                            >
                              Log Full Month
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: BAZAAR PRICE-INDEX SENTINEL (ANTI-GOUGING SCANNER)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sentinel' && <BazaarSentinelView />}
    </div>
  );
}
