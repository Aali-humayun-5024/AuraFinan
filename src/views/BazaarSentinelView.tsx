// AuraFinance OS — Feature 7: "Bazaar Price-Index Sentinel"
// Synthetic regional commodity price verification & anti-gouging alert engine
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SentinelReport } from '../db/database';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import {
  COMMODITIES_DATABASE,
  CITIES_LIST,
  getItemPriceForCity,
  type CommodityItem,
} from '../services/commodityService';
import FinancialMetric from '../components/common/FinancialMetric';
import confetti from 'canvas-confetti';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Scale, CheckCircle2,
  TrendingDown, TrendingUp, Sparkles, MessageCircle, MapPin,
  RefreshCw, History, Trash2, ArrowRight, Zap, Info
} from 'lucide-react';

interface SentinelPreset {
  id: string;
  name: string;
  urduName: string;
  icon: string;
  unit: string;
  defaultQty: number;
  category: string;
  getBenchmark: (city: string) => number;
}

export default function BazaarSentinelView() {
  const { userCity, setUserCity } = useAppStore();
  const { t, country, bazaarTerms, locale } = useTranslation();
  const { convertToBase, baseCurrency } = useCurrency();

  const auditHistory = useLiveQuery(() =>
    db.sentinelReports.orderBy('timestamp').reverse().toArray()
  ) || [];

  // Active inputs
  const [selectedPresetId, setSelectedPresetId] = useState<string>('eggs');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [quotedPriceInput, setQuotedPriceInput] = useState<string>('420');
  const [vendorNameInput, setVendorNameInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Presets mapping
  const presets: SentinelPreset[] = useMemo(() => {
    return [
      {
        id: 'eggs',
        name: 'Eggs (1 Dozen / 12)',
        urduName: 'انڈے (درجن)',
        icon: '🥚',
        unit: 'Dozen',
        defaultQty: 1,
        category: 'Dairy & Poultry',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'eggs');
          return item ? getItemPriceForCity(item, city) : 360;
        },
      },
      {
        id: 'single_egg',
        name: '1 Egg (Single Unit)',
        urduName: 'ایک عدد انڈا',
        icon: '🥚',
        unit: 'Piece',
        defaultQty: 1,
        category: 'Dairy & Poultry',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'eggs');
          return item ? Math.round(getItemPriceForCity(item, city) / 12) : 30;
        },
      },
      {
        id: 'chicken_meat',
        name: 'Fresh Chicken Meat (1 kg)',
        urduName: 'مرغی کا گوشت',
        icon: '🍗',
        unit: 'kg',
        defaultQty: 1,
        category: 'Fresh Meat',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'chicken_meat');
          return item ? getItemPriceForCity(item, city) : 620;
        },
      },
      {
        id: 'milk_fresh',
        name: 'Fresh Buffalo Milk (1 Litre)',
        urduName: 'تازہ دودھ',
        icon: '🥛',
        unit: 'Litre',
        defaultQty: 1,
        category: 'Dairy & Poultry',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'milk_fresh');
          return item ? getItemPriceForCity(item, city) : 210;
        },
      },
      {
        id: 'atta_flour',
        name: 'Chakki Whole Wheat Atta (10 kg)',
        urduName: 'چکی کا آٹا',
        icon: '🌾',
        unit: '10kg Bag',
        defaultQty: 1,
        category: 'Staples',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'atta_flour');
          return item ? getItemPriceForCity(item, city) : 1350;
        },
      },
      {
        id: 'cooking_oil',
        name: 'Premium Banaspati Ghee (1 kg)',
        urduName: 'بناسپتی گھی',
        icon: '🛢️',
        unit: 'Pouch',
        defaultQty: 1,
        category: 'Oil & Ghee',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'cooking_oil');
          return item ? getItemPriceForCity(item, city) : 490;
        },
      },
      {
        id: 'petrol',
        name: 'Super Petrol (1 Litre)',
        urduName: 'پیٹرول',
        icon: '⛽',
        unit: 'Litre',
        defaultQty: 1,
        category: 'Energy & Fuel',
        getBenchmark: (city: string) => {
          const item = COMMODITIES_DATABASE.find((c) => c.id === 'petrol');
          return item ? getItemPriceForCity(item, city) : 272;
        },
      },
      {
        id: 'custom',
        name: 'Custom Commodity / Grocery',
        urduName: 'اپنی مرضی کی چیز',
        icon: '⚖️',
        unit: 'Unit',
        defaultQty: 1,
        category: 'Custom',
        getBenchmark: () => 500,
      },
    ];
  }, []);

  const activePreset = useMemo(() => {
    return presets.find((p) => p.id === selectedPresetId) || presets[0];
  }, [presets, selectedPresetId]);

  // Current Benchmark Price (PKR baseline, converted to baseCurrency if desired)
  const currentBenchmarkPKR = useMemo(() => {
    const qty = parseFloat(quantityInput) || 1;
    return activePreset.getBenchmark(userCity) * qty;
  }, [activePreset, userCity, quantityInput]);

  const quotedPrice = parseFloat(quotedPriceInput) || 0;

  // Analysis Diagnostic
  const analysis = useMemo(() => {
    if (quotedPrice <= 0 || currentBenchmarkPKR <= 0) {
      return {
        deltaPercent: 0,
        status: 'fair' as const,
        verdictTitle: 'Enter Price to Analyze',
        verdictDesc: 'Input the price quoted by the merchant to scan for gouging.',
        counterOffer: currentBenchmarkPKR,
        bargainingScriptUrdu: '',
        bargainingScriptEnglish: '',
      };
    }

    const deltaPercent = Math.round(((quotedPrice - currentBenchmarkPKR) / currentBenchmarkPKR) * 100);

    let status: 'fair' | 'moderate' | 'gouging' = 'fair';
    let verdictTitle = '';
    let verdictDesc = '';

    if (deltaPercent <= 5) {
      status = 'fair';
      verdictTitle = '✅ Fair Market Price (منصفانہ قیمت)';
      verdictDesc = 'This price aligns with wholesale mandi official benchmarks. Safe to purchase without overpaying.';
    } else if (deltaPercent <= 15) {
      status = 'moderate';
      verdictTitle = '🟡 Moderate Convenience Markup (معمولی منافع)';
      verdictDesc = 'Price is 5% to 15% above wholesale baseline. Typical for neighborhood kiryana/convenience stores.';
    } else {
      status = 'gouging';
      verdictTitle = '🚨 PRICE GOUGING ALERT (منافع خوری الرٹ)';
      verdictDesc = `Merchant is overcharging by +${deltaPercent}% over the official ${userCity} mandi rate! Do not accept this rate without bargaining.`;
    }

    // Recommended counter-offer: Benchmark + 3% margin
    const counterOffer = Math.round(currentBenchmarkPKR * 1.03);

    // Culturally authentic bargaining scripts
    const bargainingScriptUrdu = `بھائی جان! منڈی کا سرکاری ریٹ ₨ ${currentBenchmarkPKR.toLocaleString()} ہے۔ آپ ₨ ${quotedPrice.toLocaleString()} بہت زیادہ لگا رہے ہیں۔ ₨ ${counterOffer.toLocaleString()} میں دیں تو ڈن کریں۔`;
    const bargainingScriptEnglish = `Shopkeeper, the official mandi wholesale benchmark in ${userCity} is ₨ ${currentBenchmarkPKR.toLocaleString()}. You are charging +${deltaPercent}% above benchmark. I will pay ₨ ${counterOffer.toLocaleString()} max.`;

    return {
      deltaPercent,
      status,
      verdictTitle,
      verdictDesc,
      counterOffer,
      bargainingScriptUrdu,
      bargainingScriptEnglish,
    };
  }, [quotedPrice, currentBenchmarkPKR, userCity]);

  // Save to Audit Log
  const handleSaveToAudit = async () => {
    if (quotedPrice <= 0) return;

    const report: Omit<SentinelReport, 'id'> = {
      itemName: activePreset.id === 'custom' && customItemName ? customItemName : activePreset.name,
      itemCategory: activePreset.category,
      vendorName: vendorNameInput.trim() || `${userCity} Local Shopkeeper`,
      locationCity: userCity,
      quotedPrice,
      benchmarkPrice: currentBenchmarkPKR,
      currency: 'PKR',
      unit: `${quantityInput} ${activePreset.unit}`,
      priceDeltaPercent: analysis.deltaPercent,
      status: analysis.status,
      bargainSuggestion: `Counter-offer ₨ ${analysis.counterOffer}`,
      timestamp: new Date().toISOString(),
    };

    await db.sentinelReports.add(report);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#22c55e', '#f59e0b'],
    });

    showToast('🛡️ Saved verification to Sentinel Audit Ledger!');
  };

  // Delete Audit Entry
  const handleDeleteAudit = async (id?: number) => {
    if (!id) return;
    await db.sentinelReports.delete(id);
    showToast('🗑️ Verification record removed.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 right-6 z-50 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 font-medium text-sm"
          >
            <Sparkles size={18} className="text-amber-300 animate-bounce" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          HERO BANNER
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-5 md:p-6 bg-gradient-to-br from-aura-card via-cyan-950/20 to-emerald-950/25 border border-cyan-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Scale size={13} />
                Feature 7: Price Sentinel
              </span>
              <span className="text-xs text-aura-text-muted">
                Anti-Gouging Watchdog
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-aura-text flex items-center gap-2.5">
              <span>🛡️</span>
              <span>{t.bazaarSentinel.mandiPriceTitle}</span>
            </h1>
            <p className="text-xs md:text-sm text-aura-text-secondary mt-1 max-w-xl">
              Verify if a merchant is overcharging you. Compares quoted prices against official wholesale Mandi benchmark rates with bargaining scripts.
            </p>
          </div>

          {/* Active City Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-aura-border shrink-0 self-start md:self-auto">
            <MapPin size={16} className="text-cyan-400" />
            <div className="text-left">
              <p className="text-[10px] text-aura-text-muted uppercase tracking-wider">Benchmark Market</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN SENTINEL SCANNER INTERFACE
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Chips & Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 border border-aura-border">
            <h2 className="text-sm font-bold text-aura-text mb-3 flex items-center gap-2">
              <span>📦</span> Select Commodity or Grocery:
            </h2>

            {/* Preset Commodity Pills */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setQuotedPriceInput(preset.getBenchmark(userCity).toString());
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    selectedPresetId === preset.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-white/[0.03] border-aura-border text-aura-text-muted hover:text-aura-text hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg select-none">{preset.icon}</span>
                  <div className="truncate">
                    <p className="truncate font-semibold">{preset.name.split('(')[0]}</p>
                    <span className="text-[10px] text-aura-text-muted">{preset.urduName}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Item Name (if custom) */}
            {selectedPresetId === 'custom' && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-aura-text mb-1">Custom Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Basmati Rice, Mutton, Cooking Oil..."
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {/* Quantity and Quoted Price Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-aura-text mb-1">
                  Quantity ({activePreset.unit})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-aura-border text-sm font-mono text-aura-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-aura-text mb-1">
                  Vendor Quoted (₨ PKR) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 420"
                  value={quotedPriceInput}
                  onChange={(e) => setQuotedPriceInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-aura-border text-sm font-bold font-mono text-aura-text focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Optional Vendor Name */}
            <div>
              <label className="block text-xs font-semibold text-aura-text mb-1">
                Vendor / Shopkeeper Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Al-Madina Kiryana, Saddar Meat Market..."
                value={vendorNameInput}
                onChange={(e) => setVendorNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sentinel Verdict & Bargaining Engine (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Verdict Card */}
          <div
            className={`glass-card p-6 border transition-all ${
              analysis.status === 'gouging'
                ? 'bg-rose-950/30 border-rose-500/50 shadow-xl shadow-rose-950/40'
                : analysis.status === 'moderate'
                ? 'bg-amber-950/20 border-amber-500/40 shadow-xl shadow-amber-950/30'
                : 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-950/30'
            }`}
          >
            {/* Header Verdict */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    analysis.status === 'gouging'
                      ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                      : analysis.status === 'moderate'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {analysis.status === 'gouging' ? (
                    <ShieldAlert size={28} />
                  ) : analysis.status === 'moderate' ? (
                    <AlertTriangle size={28} />
                  ) : (
                    <ShieldCheck size={28} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-aura-text">{analysis.verdictTitle}</h3>
                  <p className="text-xs text-aura-text-muted mt-0.5">{analysis.verdictDesc}</p>
                </div>
              </div>

              {/* Price Delta Badge */}
              <div
                className={`text-right px-3 py-1.5 rounded-xl border shrink-0 ${
                  analysis.status === 'gouging'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : analysis.status === 'moderate'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}
              >
                <span className="text-xs font-mono font-black block">
                  {analysis.deltaPercent > 0 ? `+${analysis.deltaPercent}%` : `${analysis.deltaPercent}%`}
                </span>
                <span className="text-[10px] block opacity-80">vs Benchmark</span>
              </div>
            </div>

            {/* Price Comparison Glance */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-4 rounded-xl bg-black/30 border border-white/5 text-center">
              <div className="text-left">
                <span className="text-[10px] text-aura-text-muted uppercase tracking-wider block">Official Mandi Rate:</span>
                <div className="mt-1 flex items-baseline">
                  <FinancialMetric
                    value={currentBenchmarkPKR}
                    currency="PKR"
                    size="md"
                    color="text-cyan-400 font-bold"
                    align="left"
                  />
                </div>
                <span className="text-[10px] text-aura-text-muted">{userCity} Benchmark</span>
              </div>

              <div className="text-left">
                <span className="text-[10px] text-aura-text-muted uppercase tracking-wider block">Vendor Quoted:</span>
                <div className="mt-1 flex items-baseline">
                  <FinancialMetric
                    value={quotedPrice}
                    currency="PKR"
                    size="md"
                    color={analysis.status === 'gouging' ? 'text-rose-400 font-bold' : 'text-aura-text font-bold'}
                    align="left"
                  />
                </div>
                <span className="text-[10px] text-aura-text-muted">Asking Price</span>
              </div>

              <div className="text-left sm:text-right col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Fair Counter-Offer:</span>
                <div className="mt-1 flex items-baseline sm:justify-end">
                  <FinancialMetric
                    value={analysis.counterOffer}
                    currency="PKR"
                    size="md"
                    color="text-emerald-400 font-black"
                    align="right"
                  />
                </div>
                <span className="text-[10px] text-emerald-400 block font-semibold">Recommended Target</span>
              </div>
            </div>

            {/* Visual 3-Zone Anti-Gouging Gauge */}
            <div className="my-5">
              <div className="flex items-center justify-between text-[10px] text-aura-text-muted mb-1 font-semibold">
                <span className="text-emerald-400">Fair (&lt;= 5%)</span>
                <span className="text-amber-400">Acceptable Markup (5-15%)</span>
                <span className="text-rose-400">Price Gouging (&gt; 15%)</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden flex relative">
                <div className="w-[33%] bg-gradient-to-r from-emerald-600 to-emerald-400 h-full" />
                <div className="w-[33%] bg-gradient-to-r from-amber-500 to-orange-400 h-full" />
                <div className="w-[34%] bg-gradient-to-r from-rose-500 to-red-600 h-full" />
              </div>
            </div>

            {/* Culturally Authentic Bargaining Script */}
            {analysis.status !== 'fair' && (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-aura-border space-y-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-aura-text font-semibold">
                  <MessageCircle size={14} className="text-cyan-400" />
                  <span>Smart Bargaining Script (Shopkeeper Ko Ye Kahain):</span>
                </div>
                <p className="text-xs text-amber-300 font-medium italic bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  "{analysis.bargainingScriptUrdu}"
                </p>
                <p className="text-[11px] text-aura-text-muted">
                  English alternative: <span className="text-aura-text-secondary">"{analysis.bargainingScriptEnglish}"</span>
                </p>
              </div>
            )}

            {/* 1-Tap Save to Audit Button */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
              <button
                onClick={handleSaveToAudit}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
              >
                <CheckCircle2 size={15} />
                <span>Log to Sentinel Audit Ledger</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: AUDIT HISTORY & RECENT VERIFICATIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-5 border border-aura-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-cyan-400" />
            <h2 className="text-base font-bold text-aura-text">
              Recent Sentinel Verifications & Anti-Gouging Reports
            </h2>
          </div>
          <span className="text-xs text-aura-text-muted">
            {auditHistory.length} total verification{auditHistory.length !== 1 ? 's' : ''}
          </span>
        </div>

        {auditHistory.length === 0 ? (
          <div className="p-8 text-center border-dashed border border-aura-border rounded-xl">
            <Scale size={32} className="mx-auto text-aura-text-muted/40 mb-2" />
            <p className="text-xs text-aura-text-muted">
              No verification records logged yet. Use the scanner above to audit grocery and commodity rates!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-aura-border text-aura-text-muted uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Commodity Item</th>
                  <th className="pb-3 font-semibold">Vendor / Location</th>
                  <th className="pb-3 font-semibold text-right">Quoted Price</th>
                  <th className="pb-3 font-semibold text-right">Mandi Baseline</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Counter-Offer</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-border">
                {auditHistory.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-bold text-aura-text">
                      <span>{r.itemName}</span>
                      <span className="block text-[10px] text-aura-text-muted font-normal">{r.unit}</span>
                    </td>
                    <td className="py-3 text-aura-text-secondary">
                      <span>{r.vendorName}</span>
                      <span className="block text-[10px] text-aura-text-muted">{r.locationCity}</span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-aura-text">
                      ₨ {r.quotedPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-cyan-400">
                      ₨ {r.benchmarkPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          r.status === 'gouging'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : r.status === 'moderate'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {r.status === 'gouging' ? `Gouging +${r.priceDeltaPercent}%` : r.status === 'moderate' ? `Markup +${r.priceDeltaPercent}%` : 'Fair'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-semibold">
                      {r.bargainSuggestion}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleDeleteAudit(r.id)}
                        className="p-1.5 rounded-lg text-aura-text-muted hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
