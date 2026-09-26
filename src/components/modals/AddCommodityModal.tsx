// AuraFinance OS — Precious Metals & Bullion Quick-Logger Modal
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Scale, DollarSign, BookOpen, Check } from 'lucide-react';
import { useCommodities } from '../../hooks/useCommodities';
import { useAppStore } from '../../store/useAppStore';
import { PrecisionMath, TOLA_IN_GRAMS, TROY_OUNCE_IN_GRAMS } from '../../utils/financialMath';
import { formatCurrency } from '../../services/fxService';
import { playClickSound, playSuccessSound, playCoinSound } from '../../services/soundService';
import confetti from 'canvas-confetti';
import type {
  PreciousMetalType,
  WeightUnit,
  GoldKarat,
  SilverPurity,
  PlatinumPurity,
} from '../../types/commodities';

interface AddCommodityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCommodityModal: React.FC<AddCommodityModalProps> = ({ isOpen, onClose }) => {
  const { baseCurrency } = useAppStore();
  const { marketRates, getSpotPricePerGram, addCommodityHolding } = useCommodities();

  const [metal, setMetal] = useState<PreciousMetalType>('gold');
  const [purity, setPurity] = useState<string>('24k');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<WeightUnit>('tola');
  const [costBasisInput, setCostBasisInput] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [autoJournalEntry, setAutoJournalEntry] = useState<boolean>(true);
  const [paymentAccount, setPaymentAccount] = useState<'1010' | '1020'>('1020');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When metal changes, reset purity to default
  const handleMetalChange = (m: PreciousMetalType) => {
    setMetal(m);
    if (m === 'gold') setPurity('24k');
    else if (m === 'silver') setPurity('999');
    else setPurity('950');
  };

  // Live spot price per gram for the selected metal and purity
  const spotPricePerGram = useMemo(() => {
    return getSpotPricePerGram(metal, purity);
  }, [metal, purity, getSpotPricePerGram]);

  // Normalized weight in grams
  const weightInGrams = useMemo(() => {
    return PrecisionMath.toGrams(quantity, unit);
  }, [quantity, unit]);

  // Live estimated market value
  const estimatedMarketValue = useMemo(() => {
    return PrecisionMath.round(weightInGrams * spotPricePerGram, 2);
  }, [weightInGrams, spotPricePerGram]);

  // Effective cost basis to use (custom or market estimated)
  const finalCostBasis = useMemo(() => {
    const parsed = parseFloat(costBasisInput);
    return isNaN(parsed) || parsed <= 0 ? estimatedMarketValue : parsed;
  }, [costBasisInput, estimatedMarketValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setIsSubmitting(true);
    playClickSound();

    try {
      await addCommodityHolding(
        {
          metal,
          purity: purity as GoldKarat | SilverPurity | PlatinumPurity,
          quantity,
          unit,
          purchaseDate,
          costBasisTotal: finalCostBasis,
          costBasisCurrency: baseCurrency,
          linkedAccountId: '1060',
          notes: notes || `${quantity} ${unit} ${metal.toUpperCase()} (${purity})`,
        },
        {
          autoJournalEntry,
          paymentAccount,
        }
      );

      playCoinSound();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err) {
      console.error('Failed to log commodity holding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-3xl bg-aura-card border border-aura-border-bright p-6 shadow-2xl backdrop-blur-2xl text-aura-text relative overflow-hidden"
      >
        {/* Ambient Gold Radial Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-aura-border relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-aura-text">Log Precious Metals & Bullion</h2>
              <p className="text-xs text-aura-text-muted">Account 1060 • Real-time Cross-Currency Valuation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-aura-text-muted hover:text-aura-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
          {/* Metal Selector */}
          <div>
            <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
              Precious Metal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gold' as const, label: 'Gold (XAU)', icon: '🟡', glow: 'hover:border-amber-500/50' },
                { id: 'silver' as const, label: 'Silver (XAG)', icon: '⚪', glow: 'hover:border-slate-400/50' },
                { id: 'platinum' as const, label: 'Platinum (XPT)', icon: '🔘', glow: 'hover:border-cyan-500/50' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleMetalChange(m.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    metal === m.id
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                      : 'bg-white/[0.03] border-aura-border text-aura-text-secondary hover:text-aura-text'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Karat / Purity Selector & Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
                Karat / Purity
              </label>
              {metal === 'gold' && (
                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs font-semibold text-aura-text outline-none focus:border-amber-500/50"
                >
                  <option value="24k" className="bg-aura-card">24K (Fine Gold 99.9%)</option>
                  <option value="22k" className="bg-aura-card">22K (Jewelry Standard 91.67%)</option>
                  <option value="21k" className="bg-aura-card">21K (Gulf / Arab 87.5%)</option>
                  <option value="18k" className="bg-aura-card">18K (Western Jewelry 75.0%)</option>
                </select>
              )}
              {metal === 'silver' && (
                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs font-semibold text-aura-text outline-none focus:border-slate-400/50"
                >
                  <option value="999" className="bg-aura-card">Fine Silver 999 (99.9%)</option>
                  <option value="925" className="bg-aura-card">Sterling Silver 925 (92.5%)</option>
                </select>
              )}
              {metal === 'platinum' && (
                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs font-semibold text-aura-text outline-none focus:border-cyan-500/50"
                >
                  <option value="950" className="bg-aura-card">Pt 950 (95.0% Fine)</option>
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
                Weight Measurement Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as WeightUnit)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs font-semibold text-aura-text outline-none focus:border-aura-accent/50"
              >
                <option value="tola" className="bg-aura-card">Tola (11.6638 g • South Asia)</option>
                <option value="grams" className="bg-aura-card">Grams (g)</option>
                <option value="troy_ounce" className="bg-aura-card">Troy Ounce (31.1035 g)</option>
                <option value="kilograms" className="bg-aura-card">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          {/* Quantity & Normalized Equivalence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
                Quantity in {unit.toUpperCase()}
              </label>
              <input
                type="number"
                step="any"
                min="0.001"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 1 or 2.5"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-sm font-bold text-aura-text outline-none focus:border-amber-500/50 tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
                Baseline Equivalence
              </label>
              <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-aura-border text-xs font-mono text-aura-text-muted flex items-center justify-between">
                <span>Weight:</span>
                <span className="font-bold text-aura-text tabular-nums">{weightInGrams.toFixed(3)} g</span>
              </div>
            </div>
          </div>

          {/* Live Valuation Callout Plate */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-amber-500/5 border border-amber-500/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400/80 block">
                Current Spot Valuation ({baseCurrency})
              </span>
              <span className="text-lg font-extrabold text-amber-300 tabular-nums">
                {formatCurrency(estimatedMarketValue, baseCurrency)}
              </span>
            </div>
            <div className="text-end text-[11px] font-mono text-aura-text-muted">
              <div>Spot: {formatCurrency(spotPricePerGram, baseCurrency)}/g</div>
              <div className="text-emerald-400 font-semibold">100% Reconciled Spot</div>
            </div>
          </div>

          {/* Cost Basis & Purchase Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
                Purchase Cost ({baseCurrency})
              </label>
              <input
                type="number"
                step="any"
                value={costBasisInput}
                onChange={(e) => setCostBasisInput(e.target.value)}
                placeholder={estimatedMarketValue.toString()}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs font-semibold text-aura-text outline-none focus:border-aura-accent/50 tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-aura-text-secondary block mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs font-semibold text-aura-text outline-none focus:border-aura-accent/50"
              />
            </div>
          </div>

          {/* Double-Entry Journal Integration Option */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-aura-border space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoJournalEntry}
                onChange={(e) => setAutoJournalEntry(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-aura-text flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-400" />
                Auto-Draft Balanced General Journal Entry
              </span>
            </label>
            {autoJournalEntry && (
              <div className="text-[11px] text-aura-text-muted pl-6 space-y-1 font-mono">
                <div>Debit: <strong className="text-emerald-400">1060 Precious Metals Asset</strong> ({formatCurrency(finalCostBasis, baseCurrency)})</div>
                <div className="flex items-center gap-2">
                  <span>Credit:</span>
                  <select
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value as '1010' | '1020')}
                    className="bg-white/5 border border-aura-border rounded px-1.5 py-0.5 text-[11px] text-aura-text outline-none"
                  >
                    <option value="1020" className="bg-aura-card">1020 Bank Operating Account</option>
                    <option value="1010" className="bg-aura-card">1010 Cash on Hand</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-aura-text-muted hover:text-aura-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || quantity <= 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{isSubmitting ? 'Logging...' : 'Confirm & Save Bullion'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCommodityModal;
