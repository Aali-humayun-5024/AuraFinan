// AuraFinance OS — "Split with Friends" Peer Debt & WhatsApp IOU Settle Ledger
// Splitwise-grade peer ledger with zero-backend local IndexedDB and 1-tap WhatsApp settlement
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type IOUTransaction } from '../db/database';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { useCoherentFinancialState } from '../context/FinancialStateContext';
import FinancialMetric from '../components/common/FinancialMetric';
import confetti from 'canvas-confetti';
import {
  Users, Plus, Share2, CheckCircle2, Clock, ArrowDownLeft,
  ArrowUpRight, Phone, MessageSquare, Trash2, Search,
  Sparkles, Check, X, Tag, Receipt, Send, ChevronRight
} from 'lucide-react';
import { DEFAULT_IOUS } from '../data/seedData';

const CATEGORIES = [
  { id: 'Dining', label: '🍽️ Food & Dining' },
  { id: 'Groceries', label: '🛒 Groceries & Bazaar' },
  { id: 'Uber/Taxi', label: '🚖 Rides & Commute' },
  { id: 'Rent', label: '🏠 Rent & Utilities' },
  { id: 'Entertainment', label: '🎬 Events & Fun' },
  { id: 'Trip', label: '✈️ Travel & Trip' },
  { id: 'Other', label: '📦 General / Other' },
];

const COUNTRY_DIAL_CODES = [
  { code: '+92', flag: '🇵🇰', name: 'PK (+92)' },
  { code: '+971', flag: '🇦🇪', name: 'AE (+971)' },
  { code: '+966', flag: '🇸🇦', name: 'SA (+966)' },
  { code: '+1', flag: '🇺🇸', name: 'US (+1)' },
  { code: '+44', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+91', flag: '🇮🇳', name: 'IN (+91)' },
  { code: '+81', flag: '🇯🇵', name: 'JP (+81)' },
  { code: '+49', flag: '🇩🇪', name: 'DE (+49)' },
  { code: '+33', flag: '🇫🇷', name: 'FR (+33)' },
  { code: '+52', flag: '🇲🇽', name: 'MX (+52)' },
];

export default function SplitLedgerView() {
  const { convertToBase, baseCurrency } = useCurrency();
  const { t, country, bazaarTerms, locale } = useTranslation();
  const { activeProfileId } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();

  const rawIous = useLiveQuery(() => db.ious.toArray()) || [];

  // Auto-seed if empty
  const ious = useMemo(() => {
    if (rawIous.length === 0) {
      // Background seed without blocking
      db.ious.bulkAdd(DEFAULT_IOUS).catch(() => {});
      return DEFAULT_IOUS as IOUTransaction[];
    }
    return rawIous;
  }, [rawIous]);

  // View state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'they_owe_me' | 'i_owe_them'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'ledger' | 'friends'>('ledger');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New IOU Form State
  const [formData, setFormData] = useState({
    title: '',
    totalBill: '',
    splitType: '50_50' as '50_50' | 'custom_amount' | 'percentage',
    customFriendShare: '',
    customPercentage: '50',
    friendName: '',
    dialCode: '+92',
    phoneLocal: '',
    direction: 'they_owe_me' as 'they_owe_me' | 'i_owe_them',
    category: 'Dining',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations for new IOU
  const calculatedFriendShare = useMemo(() => {
    const total = parseFloat(formData.totalBill) || 0;
    if (formData.splitType === '50_50') {
      return Math.round((total / 2) * 100) / 100;
    }
    if (formData.splitType === 'percentage') {
      const pct = parseFloat(formData.customPercentage) || 50;
      return Math.round(((total * pct) / 100) * 100) / 100;
    }
    return parseFloat(formData.customFriendShare) || 0;
  }, [formData.totalBill, formData.splitType, formData.customPercentage, formData.customFriendShare]);

  const calculatedMyShare = useMemo(() => {
    const total = parseFloat(formData.totalBill) || 0;
    return Math.max(0, Math.round((total - calculatedFriendShare) * 100) / 100);
  }, [formData.totalBill, calculatedFriendShare]);

  // Aggregate Metrics in baseCurrency
  const metrics = useMemo(() => {
    let totalTheyOweMeBase = 0;
    let totalIOweThemBase = 0;
    let totalSettledBase = 0;
    const friendsTheyOweSet = new Set<string>();
    const friendsIOweSet = new Set<string>();

    ious.forEach((iou) => {
      const shareInBase = convertToBase(iou.friendShare, iou.currency);
      if (iou.status === 'pending') {
        if (iou.direction === 'they_owe_me') {
          totalTheyOweMeBase += shareInBase;
          friendsTheyOweSet.add(iou.friendName);
        } else {
          totalIOweThemBase += shareInBase;
          friendsIOweSet.add(iou.friendName);
        }
      } else {
        totalSettledBase += shareInBase;
      }
    });

    const netPeerBalance = totalTheyOweMeBase - totalIOweThemBase;

    return {
      netPeerBalance,
      totalTheyOweMeBase,
      totalIOweThemBase,
      totalSettledBase,
      friendsTheyOweCount: friendsTheyOweSet.size,
      friendsIOweCount: friendsIOweSet.size,
    };
  }, [ious, convertToBase]);

  // Friend Group Breakdown
  const friendSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone?: string;
        netBalanceBase: number;
        theyOweMeBase: number;
        iOweThemBase: number;
        pendingCount: number;
        ious: IOUTransaction[];
      }
    >();

    ious.forEach((iou) => {
      const existing = map.get(iou.friendName) || {
        name: iou.friendName,
        phone: iou.friendPhone,
        netBalanceBase: 0,
        theyOweMeBase: 0,
        iOweThemBase: 0,
        pendingCount: 0,
        ious: [],
      };

      if (!existing.phone && iou.friendPhone) {
        existing.phone = iou.friendPhone;
      }

      existing.ious.push(iou);

      if (iou.status === 'pending') {
        existing.pendingCount += 1;
        const converted = convertToBase(iou.friendShare, iou.currency);
        if (iou.direction === 'they_owe_me') {
          existing.theyOweMeBase += converted;
          existing.netBalanceBase += converted;
        } else {
          existing.iOweThemBase += converted;
          existing.netBalanceBase -= converted;
        }
      }

      map.set(iou.friendName, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.netBalanceBase - a.netBalanceBase);
  }, [ious, convertToBase]);

  // Filtered IOUs
  const filteredIous = useMemo(() => {
    return ious.filter((iou) => {
      const matchesStatus = statusFilter === 'all' || iou.status === statusFilter;
      const matchesDirection = directionFilter === 'all' || iou.direction === directionFilter;
      const matchesCategory = selectedCategory === 'all' || iou.category === selectedCategory;
      const matchesSearch =
        iou.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iou.friendName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (iou.notes && iou.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesDirection && matchesCategory && matchesSearch;
    });
  }, [ious, statusFilter, directionFilter, selectedCategory, searchQuery]);

  // Save new IOU
  const handleSaveIOU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.friendName || !formData.totalBill) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }

    const total = parseFloat(formData.totalBill);
    const fullPhone = formData.phoneLocal.trim()
      ? `${formData.dialCode}${formData.phoneLocal.replace(/^0+/, '').trim()}`
      : undefined;

    const newIOU: Omit<IOUTransaction, 'id'> = {
      title: formData.title.trim(),
      totalBill: total,
      myShare: calculatedMyShare,
      friendName: formData.friendName.trim(),
      friendPhone: fullPhone,
      friendShare: calculatedFriendShare,
      currency: baseCurrency,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      direction: formData.direction,
      category: formData.category,
      notes: formData.notes.trim() || undefined,
      profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
    };

    await db.ious.add(newIOU);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#7c5cfc', '#22c55e', '#06b6d4'],
    });

    showToast(`✅ Split "${formData.title}" with ${formData.friendName} saved!`);
    setIsAddModalOpen(false);

    // Reset Form
    setFormData({
      title: '',
      totalBill: '',
      splitType: '50_50',
      customFriendShare: '',
      customPercentage: '50',
      friendName: '',
      dialCode: '+92',
      phoneLocal: '',
      direction: 'they_owe_me',
      category: 'Dining',
      notes: '',
    });
  };

  // Settle IOU Action
  const handleSettleIOU = async (iou: IOUTransaction, autoLogTransaction: boolean = true) => {
    if (!iou.id) return;

    const today = new Date().toISOString().split('T')[0];
    await db.ious.update(iou.id, {
      status: 'settled',
      settledAt: today,
    });

    // Option to auto-log repayment into transactions
    if (autoLogTransaction) {
      if (iou.direction === 'they_owe_me') {
        // Friend paid me back -> Income
        await db.transactions.add({
          title: `🤝 Repayment: ${iou.friendName} settled "${iou.title}"`,
          amount: iou.friendShare,
          originalCurrency: iou.currency,
          amountInUSD: convertToBase(iou.friendShare, iou.currency),
          type: 'income',
          bucket: 'savings',
          category: 'Income',
          merchant: `${iou.friendName} (IOU Settle)`,
          date: today,
          isRecurring: false,
          tags: ['iou-settled', 'repayment', 'peer-debt'],
          profileId: iou.profileId || (activeProfileId === 'all' ? 'household' : activeProfileId),
        });
      } else {
        // I paid friend back -> Expense
        await db.transactions.add({
          title: `🤝 Settled Debt: Paid ${iou.friendName} for "${iou.title}"`,
          amount: iou.friendShare,
          originalCurrency: iou.currency,
          amountInUSD: convertToBase(iou.friendShare, iou.currency),
          type: 'expense',
          bucket: 'needs',
          category: iou.category || 'Other',
          merchant: `${iou.friendName} (IOU Settle)`,
          date: today,
          isRecurring: false,
          tags: ['iou-settled', 'debt-paid', 'peer-debt'],
          profileId: iou.profileId || (activeProfileId === 'all' ? 'household' : activeProfileId),
        });
      }
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#10b981', '#3b82f6'],
    });

    showToast(`🎉 Settled "${iou.title}" with ${iou.friendName}!`);
  };

  // Delete IOU
  const handleDeleteIOU = async (id?: number) => {
    if (!id) return;
    await db.ious.delete(id);
    showToast('🗑️ IOU deleted.');
  };

  // WhatsApp 1-Click Reminder Generator
  const generateWhatsAppMessage = (iou: IOUTransaction) => {
    const isUrdu = locale.code === 'ur';
    const isArabic = locale.code === 'ar';

    if (isUrdu) {
      return `السلام علیکم / Salam ${iou.friendName}! 
AuraFinance OS se friendly reminder:
Hamara "${iou.title}" ka bill total ${iou.currency} ${iou.totalBill.toLocaleString()} tha, jisme aapka share ${iou.currency} ${iou.friendShare.toLocaleString()} banta hai.
Jab time miley check aur settle kar lijiye ga. JazakAllah! ✨`;
    }

    if (isArabic) {
      return `مرحباً ${iou.friendName}! 👋
تذكير ودّي بخصوص فاتورة "${iou.title}" (المجموع: ${iou.currency} ${iou.totalBill.toLocaleString()}).
حصتك المستحقة هي: ${iou.currency} ${iou.friendShare.toLocaleString()}.
شكراً لك!`;
    }

    return `👋 Hey ${iou.friendName}! 
Friendly split reminder via AuraFinance OS:
Regarding "${iou.title}" (Total: ${iou.currency} ${iou.totalBill.toLocaleString()}), your share comes to ${iou.currency} ${iou.friendShare.toLocaleString()}.
Let me know once settled. Cheers! 🙌`;
  };

  const handleSendWhatsApp = (iou: IOUTransaction) => {
    const message = generateWhatsAppMessage(iou);
    const encoded = encodeURIComponent(message);

    if (iou.friendPhone) {
      const cleanDigits = iou.friendPhone.replace(/[^\d+]/g, '');
      const url = `https://wa.me/${cleanDigits.replace(/^\+/, '')}?text=${encoded}`;
      window.open(url, '_blank');
      showToast(`📲 Opened WhatsApp for ${iou.friendName}`);
    } else {
      navigator.clipboard.writeText(message);
      showToast(`📋 Reminder message copied to clipboard! (Add phone to 1-click send)`);
    }
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
            className="fixed top-16 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 font-medium text-sm"
          >
            <Sparkles size={18} className="text-amber-300 animate-spin" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          HEADER & METRICS HERO
          ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-5 md:p-6 bg-gradient-to-br from-aura-card via-purple-950/20 to-cyan-950/30 border border-aura-accent/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-aura-accent/20 text-aura-accent border border-aura-accent/30 flex items-center gap-1.5">
                <Users size={13} />
                Splitwise Alternative
              </span>
              <span className="text-xs text-aura-text-muted">
                100% Client-Side IndexedDB
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-aura-text flex items-center gap-2.5">
              <span>🤝</span>
              <span>{t.iouSettler.billSplitTitle}</span>
            </h1>
            <p className="text-xs md:text-sm text-aura-text-secondary mt-1 max-w-xl">
              Track shared dinners, group grocery runs, taxi rides, and trip expenses. Instant WhatsApp settle links with zero awkwardness.
            </p>
          </div>

          {/* Quick Add Split Action */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-aura-accent to-purple-600 text-white font-bold text-sm shadow-xl shadow-aura-accent/30 hover:brightness-110 transition-all shrink-0"
          >
            <Plus size={18} />
            <span>Split a Bill / Add IOU</span>
          </motion.button>
        </div>

        {/* 3 Metric Cards (SSOT: CoherentFinancialState ious & netWorth) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-aura-border">
          {/* Net Peer Balance */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-aura-border flex items-center justify-between">
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wider text-aura-text-muted font-semibold">Net Peer Balance</p>
              <div className="mt-1 flex items-baseline">
                <FinancialMetric
                  value={Math.abs(coherentState.ious.netIOUPosition)}
                  currency={baseCurrency}
                  size="lg"
                  color={coherentState.ious.netIOUPosition >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}
                  prefixSign={coherentState.ious.netIOUPosition >= 0 ? '+' : '-'}
                  align="left"
                />
              </div>
              <span className="text-[11px] text-aura-text-muted mt-0.5 block">
                {coherentState.ious.netIOUPosition >= 0 ? 'Overall others owe you' : 'Overall you owe friends'}
              </span>
            </div>
            <div className={`p-3 rounded-2xl ${coherentState.ious.netIOUPosition >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
              {coherentState.ious.netIOUPosition >= 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
            </div>
          </div>

          {/* Total Owed To You */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">{t.iouSettler.youAreOwed}</p>
              <div className="mt-1 flex items-baseline">
                <FinancialMetric
                  value={coherentState.ious.totalOwedToMe}
                  currency={baseCurrency}
                  size="lg"
                  color="text-emerald-400 font-black"
                  align="left"
                />
              </div>
              <span className="text-[11px] text-aura-text-secondary mt-0.5 block">
                Reflected in Net Worth Assets (+{coherentState.ious.totalOwedToMe.toFixed(2)})
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400">
              <ArrowDownLeft size={24} />
            </div>
          </div>

          {/* Total You Owe */}
          <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold">{t.iouSettler.youOwe}</p>
              <div className="mt-1 flex items-baseline">
                <FinancialMetric
                  value={coherentState.ious.totalIOweOthers}
                  currency={baseCurrency}
                  size="lg"
                  color="text-rose-400 font-black"
                  align="left"
                />
              </div>
              <span className="text-[11px] text-aura-text-secondary mt-0.5 block">
                Reflected in Liabilities (-{coherentState.ious.totalIOweOthers.toFixed(2)})
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW TABS & FILTERS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-aura-border pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ledger'
                ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/20'
                : 'bg-white/5 text-aura-text-secondary hover:text-aura-text'
            }`}
          >
            📋 All Split Transactions ({filteredIous.length})
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'friends'
                ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/20'
                : 'bg-white/5 text-aura-text-secondary hover:text-aura-text'
            }`}
          >
            👥 Friends Breakdown ({friendSummaries.length})
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-aura-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by friend, bill name..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-aura-border rounded-xl text-xs text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent"
            />
          </div>
        </div>
      </div>

      {/* Secondary Filter Pills */}
      {activeTab === 'ledger' && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-aura-border">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'pending', label: '⏳ Pending' },
              { id: 'settled', label: '✅ Settled' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setStatusFilter(p.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === p.id
                    ? 'bg-aura-accent/25 text-aura-accent font-bold'
                    : 'text-aura-text-muted hover:text-aura-text'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Direction Pills */}
          <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-aura-border">
            {[
              { id: 'all', label: 'All Directions' },
              { id: 'they_owe_me', label: '🟢 They Owe Me' },
              { id: 'i_owe_them', label: '🔴 I Owe Them' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDirectionFilter(d.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  directionFilter === d.id
                    ? 'bg-aura-accent/25 text-aura-accent font-bold'
                    : 'text-aura-text-muted hover:text-aura-text'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ALL TRANSACTIONS LIST
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          {filteredIous.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-aura-border">
              <Users size={40} className="mx-auto text-aura-text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-aura-text">No split debts match your filters</h3>
              <p className="text-xs text-aura-text-muted mt-1 max-w-sm mx-auto">
                Add a new bill split or reset your filters to see your peer debt ledger.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-aura-accent text-white text-xs font-bold shadow-md"
              >
                + Split Your First Bill
              </button>
            </div>
          ) : (
            filteredIous.map((iou, idx) => {
              const shareInBase = convertToBase(iou.friendShare, iou.currency);
              const isSettled = iou.status === 'settled';
              const isTheyOweMe = iou.direction === 'they_owe_me';

              return (
                <motion.div
                  key={iou.id !== undefined ? `iou-${iou.id}` : `iou-idx-${idx}`}
                  whileHover={{ scale: 1.005 }}
                  className={`glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                    isSettled
                      ? 'opacity-65 border-aura-border bg-white/[0.01]'
                      : isTheyOweMe
                      ? 'border-emerald-500/25 hover:border-emerald-500/50 bg-emerald-500/[0.02]'
                      : 'border-rose-500/25 hover:border-rose-500/50 bg-rose-500/[0.02]'
                  }`}
                >
                  {/* Left Column: Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl text-xl select-none shrink-0 ${
                        isSettled
                          ? 'bg-white/5 text-aura-text-muted'
                          : isTheyOweMe
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {iou.category === 'Dining' && '🍽️'}
                      {iou.category === 'Groceries' && '🛒'}
                      {iou.category === 'Uber/Taxi' && '🚖'}
                      {iou.category === 'Rent' && '🏠'}
                      {iou.category === 'Entertainment' && '🎬'}
                      {iou.category === 'Trip' && '✈️'}
                      {iou.category === 'Other' && '🤝'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-aura-text text-sm sm:text-base">{iou.title}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSettled
                              ? 'bg-white/10 text-aura-text-muted'
                              : isTheyOweMe
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isSettled ? 'Settled' : isTheyOweMe ? 'They Owe You' : 'You Owe'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-aura-text-muted mt-1">
                        <span className="font-semibold text-aura-text">With: {iou.friendName}</span>
                        {iou.friendPhone && (
                          <span className="text-[11px] font-mono text-aura-text-muted flex items-center gap-1">
                            <Phone size={11} /> {iou.friendPhone}
                          </span>
                        )}
                        <span>•</span>
                        <span>Total Bill: {iou.currency} {iou.totalBill.toLocaleString()}</span>
                        <span>•</span>
                        <span>{iou.createdAt}</span>
                      </div>

                      {iou.notes && (
                        <p className="text-xs text-aura-text-secondary mt-1.5 italic bg-white/[0.02] px-2.5 py-1 rounded-lg">
                          "{iou.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-aura-border">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline sm:justify-end">
                        <FinancialMetric
                          value={shareInBase}
                          currency={baseCurrency}
                          size="md"
                          color={isSettled ? 'text-aura-text-muted line-through font-bold' : isTheyOweMe ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}
                          prefixSign={isTheyOweMe ? '+' : '-'}
                          align="right"
                        />
                      </div>
                      <span className="text-[10px] text-aura-text-muted block">
                        {isSettled ? `Settled on ${iou.settledAt}` : isTheyOweMe ? `${iou.friendName}'s share` : 'Your share to pay'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Reminder Button */}
                      {!isSettled && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSendWhatsApp(iou)}
                          title="Send Friendly Reminder on WhatsApp"
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1 text-xs font-semibold"
                        >
                          <Send size={14} />
                          <span className="hidden md:inline">WhatsApp</span>
                        </motion.button>
                      )}

                      {/* Settle Up Button */}
                      {!isSettled && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSettleIOU(iou, true)}
                          title="Mark as Settled and log repayment"
                          className="px-3 py-2 rounded-xl bg-aura-accent hover:bg-purple-600 text-white text-xs font-bold shadow-md shadow-aura-accent/25 transition-all flex items-center gap-1"
                        >
                          <Check size={14} />
                          <span>Settle Up</span>
                        </motion.button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteIOU(iou.id)}
                        title="Delete IOU"
                        className="p-2 rounded-xl text-aura-text-muted hover:text-rose-400 hover:bg-white/5 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FRIENDS GROUP BREAKDOWN
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendSummaries.map((f) => (
            <div
              key={f.name}
              className="glass-card p-4 flex flex-col justify-between border border-aura-border hover:border-aura-accent/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-accent to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-aura-text text-sm">{f.name}</h3>
                      <p className="text-xs text-aura-text-muted font-mono">{f.phone || 'No phone registered'}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-aura-text-secondary font-medium">
                    {f.pendingCount} pending bill{f.pendingCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Net balance with Friend */}
                <div className="my-4 p-3 rounded-xl bg-white/[0.02] border border-aura-border flex items-center justify-between">
                  <span className="text-xs text-aura-text-muted font-medium">Net Balance:</span>
                  <div className="text-right">
                    <FinancialMetric
                      value={Math.abs(f.netBalanceBase)}
                      currency={baseCurrency}
                      size="md"
                      color={f.netBalanceBase >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}
                      prefixSign={f.netBalanceBase >= 0 ? '+' : '-'}
                      align="right"
                    />
                    <span className="text-[10px] text-aura-text-muted block">
                      {f.netBalanceBase > 0 ? 'Owes you' : f.netBalanceBase < 0 ? 'You owe them' : 'Settled clean'}
                    </span>
                  </div>
                </div>

                {/* Outstanding items overview */}
                <div className="space-y-1.5 mb-4">
                  {f.ious.filter((i) => i.status === 'pending').slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-aura-text truncate max-w-[160px]">• {item.title}</span>
                      <span className={`font-mono font-semibold ${item.direction === 'they_owe_me' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.direction === 'they_owe_me' ? '+' : '-'}{item.currency} {item.friendShare.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {f.phone && f.pendingCount > 0 && (
                <button
                  onClick={() => {
                    const pending = f.ious.filter((i) => i.status === 'pending');
                    const text = `👋 Salam/Hey ${f.name}! Outstanding balance summary from AuraFinance OS:\nTotal Net: ${baseCurrency} ${Math.round(Math.abs(f.netBalanceBase)).toLocaleString()} across ${pending.length} bills.\n` +
                      pending.map((p) => `• ${p.title}: ${p.currency} ${p.friendShare.toLocaleString()}`).join('\n');
                    const url = `https://wa.me/${f.phone!.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Send size={13} />
                  <span>WhatsApp Full Outstanding</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SPLIT A BILL / ADD IOU
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg p-6 bg-aura-card border border-aura-border shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-aura-text-muted hover:text-aura-text hover:bg-white/5"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Receipt className="text-aura-accent" size={20} />
                <h2 className="text-lg font-bold text-aura-text">Split a Bill / Add Peer Debt</h2>
              </div>
              <p className="text-xs text-aura-text-muted mb-5">
                Calculate friend shares, record debt into local IndexedDB, and generate WhatsApp links.
              </p>

              <form onSubmit={handleSaveIOU} className="space-y-4">
                {/* Direction Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-aura-text mb-1.5">Who Paid?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, direction: 'they_owe_me' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formData.direction === 'they_owe_me'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 border-aura-border text-aura-text-muted hover:text-aura-text'
                      }`}
                    >
                      <ArrowDownLeft size={16} />
                      <span>I Paid (They Owe Me)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, direction: 'i_owe_them' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formData.direction === 'i_owe_them'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/20'
                          : 'bg-white/5 border-aura-border text-aura-text-muted hover:text-aura-text'
                      }`}
                    >
                      <ArrowUpRight size={16} />
                      <span>They Paid (I Owe Them)</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-aura-text mb-1">Expense / Bill Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dinner at Monal, Costco Run, Uber Ride..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-aura-border text-sm text-aura-text focus:outline-none focus:border-aura-accent"
                  />
                </div>

                {/* Total Bill & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-aura-text mb-1">Total Bill ({baseCurrency}) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={formData.totalBill}
                      onChange={(e) => setFormData({ ...formData, totalBill: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-aura-border text-sm font-mono text-aura-text focus:outline-none focus:border-aura-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-aura-text mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Split Calculation Type */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-aura-border">
                  <label className="block text-xs font-semibold text-aura-text mb-2">Split Calculation</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { id: '50_50', label: '50 / 50 (Equal)' },
                      { id: 'percentage', label: '% Percentage' },
                      { id: 'custom_amount', label: 'Exact Amount' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, splitType: mode.id as any })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                          formData.splitType === mode.id
                            ? 'bg-aura-accent text-white font-bold'
                            : 'bg-white/5 text-aura-text-muted hover:text-aura-text'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {formData.splitType === 'percentage' && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-aura-text-muted">Friend Share:</span>
                      <input
                        type="range"
                        min="1"
                        max="99"
                        value={formData.customPercentage}
                        onChange={(e) => setFormData({ ...formData, customPercentage: e.target.value })}
                        className="flex-1 accent-aura-accent"
                      />
                      <span className="text-xs font-bold text-aura-accent font-mono w-12 text-right">
                        {formData.customPercentage}%
                      </span>
                    </div>
                  )}

                  {formData.splitType === 'custom_amount' && (
                    <div>
                      <input
                        type="number"
                        placeholder="Friend Share Amount"
                        value={formData.customFriendShare}
                        onChange={(e) => setFormData({ ...formData, customFriendShare: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text font-mono"
                      />
                    </div>
                  )}

                  {/* Computed Shares Glance */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5 text-xs">
                    <div className="p-2 rounded-lg bg-white/5 text-left">
                      <span className="text-[10px] text-aura-text-muted block">Friend's Share:</span>
                      <span className="font-bold text-aura-accent font-mono">
                        {baseCurrency} {calculatedFriendShare.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-left">
                      <span className="text-[10px] text-aura-text-muted block">Your Share:</span>
                      <span className="font-bold text-aura-text font-mono">
                        {baseCurrency} {calculatedMyShare.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Friend Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-aura-text mb-1">Friend's Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hamza, Sarah, Ali"
                      value={formData.friendName}
                      onChange={(e) => setFormData({ ...formData, friendName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-aura-border text-sm text-aura-text focus:outline-none focus:border-aura-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-aura-text mb-1">WhatsApp Number (Optional)</label>
                    <div className="flex gap-1.5">
                      <select
                        value={formData.dialCode}
                        onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                        className="px-2 py-2 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text focus:outline-none"
                      >
                        {COUNTRY_DIAL_CODES.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.flag} {d.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="3001234567"
                        value={formData.phoneLocal}
                        onChange={(e) => setFormData({ ...formData, phoneLocal: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-aura-border text-sm font-mono text-aura-text focus:outline-none focus:border-aura-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-aura-text mb-1">Memo / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Split Shinwari platter and naans"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-aura-border text-xs text-aura-text focus:outline-none focus:border-aura-accent"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-aura-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-aura-text-muted hover:text-aura-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-aura-accent to-purple-600 text-white font-bold text-xs shadow-lg shadow-aura-accent/30 hover:brightness-110 transition-all"
                  >
                    Save & Add to Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
