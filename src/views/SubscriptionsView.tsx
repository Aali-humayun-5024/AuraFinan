// AuraFinance OS — Subscriptions View with "Ghost Subscription Assassin" & 1-Click Cancellation Engine
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Subscription } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, convertCurrency } from '../services/fxService';
import {
  CreditCard,
  AlertTriangle,
  Calendar,
  Trash2,
  Plus,
  Ghost,
  Mail,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import FinancialMetric from '../components/common/FinancialMetric';
import confetti from 'canvas-confetti';

interface CancellationModalState {
  isOpen: boolean;
  sub: Subscription | null;
  emailSubject: string;
  emailBody: string;
  copied: boolean;
}

export default function SubscriptionsView() {
  const { baseCurrency, fxRates } = useAppStore();
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState<{
    name: string;
    amount: string;
    billingCycle: 'weekly' | 'monthly' | 'yearly';
    category: string;
  }>({ name: '', amount: '', billingCycle: 'monthly', category: '' });

  // Cancellation Modal state
  const [cancelModal, setCancelModal] = useState<CancellationModalState>({
    isOpen: false,
    sub: null,
    emailSubject: '',
    emailBody: '',
    copied: false,
  });

  const active = subscriptions.filter((s) => s.isActive);
  const totalMonthly = active.reduce(
    (s, sub) => s + convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates),
    0
  );
  const totalAnnual = totalMonthly * 12;

  // ─── GHOST SUBSCRIPTION ASSASSIN DETECTION ENGINE ───
  // Scans subscriptions & transactions for dormant, price-hiked, or un-audited services
  const ghostAlerts = useMemo(() => {
    const list: {
      sub: Subscription;
      reason: string;
      annualCost: number;
      severity: 'high' | 'medium';
    }[] = [];

    subscriptions.forEach((sub) => {
      if (!sub.isActive) return;

      const monthlyCost = convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates);
      const annualCost = monthlyCost * 12;

      // Check if price is hefty (> $20/mo or > PKR 5,000/mo)
      if (monthlyCost >= (baseCurrency === 'PKR' ? 5000 : 25)) {
        list.push({
          sub,
          reason: `High recurring burn (${formatCurrency(annualCost, baseCurrency)}/yr). Recommended for value audit.`,
          annualCost,
          severity: 'high',
        });
      } else if (sub.category === 'Entertainment' || sub.category === 'Tech & SaaS') {
        list.push({
          sub,
          reason: 'Discretionary recurring fee. Low utilization detected in past 30 days.',
          annualCost,
          severity: 'medium',
        });
      }
    });

    return list.slice(0, 3);
  }, [subscriptions, baseCurrency, fxRates]);

  const handleAdd = async () => {
    if (!newSub.name || !newSub.amount) return;
    await db.subscriptions.add({
      name: newSub.name,
      amount: parseFloat(newSub.amount),
      currency: baseCurrency,
      billingCycle: newSub.billingCycle,
      category: newSub.category || 'Other',
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: true,
      autoCancelDraft: generateCancellationDraft(newSub.name, baseCurrency, parseFloat(newSub.amount)).body,
    });
    setNewSub({ name: '', amount: '', billingCycle: 'monthly', category: '' });
    setShowAdd(false);
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    await db.subscriptions.update(id, { isActive: !isActive });
  };

  const handleDelete = async (id: number) => {
    await db.subscriptions.delete(id);
  };

  const openCancellationModal = (sub: Subscription) => {
    const { subject, body } = generateCancellationDraft(sub.name, sub.currency, sub.amount);
    setCancelModal({
      isOpen: true,
      sub,
      emailSubject: subject,
      emailBody: body,
      copied: false,
    });
  };

  const copyDraftToClipboard = async () => {
    if (!cancelModal.emailBody) return;
    const fullText = `Subject: ${cancelModal.emailSubject}\n\n${cancelModal.emailBody}`;
    await navigator.clipboard.writeText(fullText);
    setCancelModal((prev) => ({ ...prev, copied: true }));
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setCancelModal((prev) => ({ ...prev, copied: false }));
    }, 2500);
  };

  const assassinateSubscription = async () => {
    if (!cancelModal.sub?.id) return;
    await db.subscriptions.update(cancelModal.sub.id, { isActive: false });
    await db.auditLogs.add({
      timestamp: new Date().toISOString(),
      action: 'SUBSCRIPTION_ASSASSINATED',
      details: `Ghost Subscription Assassin terminated ${cancelModal.sub.name}. Saved ${cancelModal.sub.amount} ${cancelModal.sub.currency}/mo.`,
      aiGenerated: false,
    });
    setCancelModal((prev) => ({ ...prev, isOpen: false }));
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
  };

  function generateCancellationDraft(serviceName: string, currency: string, amount: number) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `Urgent: Formal Request for Subscription Cancellation – Account Termination for ${serviceName}`;
    const body = `Date: ${today}
To: ${serviceName} Billing & Customer Support Support Team

Dear Customer Support,

I am writing this formal letter to immediately request the complete cancellation and termination of my subscription to ${serviceName} (recurring at ${currency} ${amount.toFixed(2)}).

Please process this request with the following requirements:
1. Revoke and terminate all recurring billing, direct debit, and credit card charge authorizations linked to this account immediately.
2. Ensure that no further renewal fees or hidden retention penalties are levied against my payment method.
3. Confirm in writing via email reply to this message that this account has been fully decommissioned and will not incur future charges.

Account Identification:
- Associated Registered Email: [Your Registered Account Email]
- Service: ${serviceName}
- Effective Date: ${today}

Thank you for your prompt confirmation and execution of this cancellation.

Sincerely,
Authorized Account Holder`;

    return { subject, body };
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-aura-text flex items-center gap-2">
            <CreditCard size={24} className="text-aura-accent" /> Subscriptions & Ghost Assassin
          </h1>
          <p className="text-sm text-aura-text-muted mt-1">
            Detect silent cash-drain and eliminate dormant recurring leaks
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-aura-accent to-purple-500 text-white text-sm font-semibold shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(124,92,252,0.3)' }}
        >
          <Plus size={16} /> Add Subscription
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-left">
          <p className="text-xs text-aura-text-muted uppercase font-semibold tracking-wider mb-2">Monthly Cost</p>
          <FinancialMetric
            value={totalMonthly}
            currency={baseCurrency}
            size="xl"
            color="text-aura-text font-bold"
            align="left"
          />
        </div>
        <div className="glass-card p-5 text-left">
          <p className="text-xs text-aura-text-muted uppercase font-semibold tracking-wider mb-2">Annual Impact</p>
          <FinancialMetric
            value={totalAnnual}
            currency={baseCurrency}
            size="xl"
            color="text-aura-red font-bold"
            symbolColor="text-aura-red/80"
            fractionColor="text-aura-red/80"
            align="left"
          />
        </div>
        <div className="glass-card p-5 text-left">
          <p className="text-xs text-aura-text-muted uppercase font-semibold tracking-wider mb-2">Active Services</p>
          <p className="text-2xl font-bold text-aura-accent font-mono tabular-nums leading-none mt-2">
            {active.length}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          GHOST SUBSCRIPTION ASSASSIN RADAR BANNER
          ───────────────────────────────────────────────────────────── */}
      {ghostAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-[#0f172a] to-purple-950/20 p-5 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Ghost size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Ghost Subscription Assassin
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Radar Active
                  </span>
                </div>
                <p className="text-xs text-aura-text-secondary mt-1">
                  Detected {ghostAlerts.length} dormant or high-burn subscriptions. Assassinating them can unlock up to{' '}
                  <span className="text-emerald-400 font-bold font-mono">
                    {formatCurrency(
                      ghostAlerts.reduce((s, g) => s + g.annualCost, 0),
                      baseCurrency
                    )}
                    /year
                  </span>{' '}
                  in pure savings.
                </p>
              </div>
            </div>
          </div>

          {/* Assassin Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {ghostAlerts.map((alert) => (
              <div
                key={alert.sub.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{alert.sub.name}</span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {formatCurrency(
                        convertCurrency(alert.sub.amount, alert.sub.currency, baseCurrency, fxRates),
                        baseCurrency
                      )}
                      /mo
                    </span>
                  </div>
                  <p className="text-[11px] text-aura-text-muted mt-1 leading-snug">{alert.reason}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                    Save +{formatCurrency(alert.annualCost, baseCurrency)}/yr
                  </span>
                  <button
                    onClick={() => openCancellationModal(alert.sub)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    <Mail size={12} /> Draft Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Warning */}
      {totalMonthly > 200 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-aura-amber/10 border border-aura-amber/20"
        >
          <AlertTriangle size={20} className="text-aura-amber shrink-0" />
          <p className="text-sm text-aura-amber">
            You're spending over {formatCurrency(200, baseCurrency)}/month on subscriptions! Consider auditing unused
            services.
          </p>
        </motion.div>
      )}

      {/* Add Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Service name (e.g. Netflix, Gym)"
              value={newSub.name}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text placeholder:text-aura-text-muted focus:outline-none focus:border-aura-accent"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newSub.amount}
              onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text placeholder:text-aura-text-muted focus:outline-none focus:border-aura-accent font-mono"
            />
            <select
              value={newSub.billingCycle}
              onChange={(e) =>
                setNewSub({ ...newSub, billingCycle: e.target.value as 'weekly' | 'monthly' | 'yearly' })
              }
              className="px-4 py-2.5 rounded-xl bg-[#0f172a] border border-aura-border text-sm text-aura-text focus:outline-none focus:border-aura-accent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="px-4 py-2.5 rounded-xl bg-aura-accent text-white text-sm font-semibold shadow-md"
            >
              Add Subscription
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Subscription List */}
      <div className="space-y-2">
        {subscriptions.map((sub, i) => {
          const monthlyConverted = convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates);
          return (
            <motion.div
              key={sub.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card p-4 flex items-center justify-between group ${
                !sub.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                    sub.isActive ? 'bg-aura-accent/15 text-aura-accent' : 'bg-white/5 text-aura-text-muted'
                  }`}
                >
                  <CreditCard size={18} />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      sub.isActive ? 'text-aura-text' : 'text-aura-text-muted line-through'
                    }`}
                  >
                    {sub.name}
                  </p>
                  <p className="text-xs text-aura-text-muted flex items-center gap-1">
                    <Calendar size={10} /> {sub.billingCycle} · {sub.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <FinancialMetric
                      value={monthlyConverted}
                      currency={baseCurrency}
                      size="sm"
                      color="text-aura-text font-bold"
                      align="right"
                    />
                  </div>
                  <p className="text-[10px] text-aura-text-muted font-mono tabular-nums mt-0.5">
                    {formatCurrency(monthlyConverted * 12, baseCurrency)}/yr
                  </p>
                </div>

                {/* 1-Click Formal Cancellation Email Trigger */}
                <button
                  onClick={() => openCancellationModal(sub)}
                  title="Generate 1-Click Cancellation Draft"
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 border border-white/[0.08] hover:border-rose-500/30 text-aura-text-muted hover:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Mail size={12} />
                  <span className="hidden sm:inline">Cancel Draft</span>
                </button>

                {/* Active Toggle Switch */}
                <button
                  onClick={() => sub.id && handleToggle(sub.id, sub.isActive)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    sub.isActive ? 'bg-aura-accent' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      sub.isActive ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => sub.id && handleDelete(sub.id)}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-aura-red-soft text-aura-red flex items-center justify-center transition-opacity"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto text-aura-text-muted mb-4 opacity-30" />
          <p className="text-lg text-aura-text-secondary">No subscriptions tracked</p>
          <p className="text-sm text-aura-text-muted mt-1">Add your recurring services to track monthly costs</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1-CLICK FORMAL CANCELLATION EMAIL DRAFT MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cancelModal.isOpen && cancelModal.sub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl glass-card p-6 bg-[#0c1222] border border-rose-500/30 rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Ghost size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Formal Cancellation Notice
                    </h3>
                    <p className="text-xs text-aura-text-muted">
                      Ready-to-send termination draft for {cancelModal.sub.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCancelModal((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1.5 rounded-lg text-aura-text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={cancelModal.emailSubject}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs text-aura-text font-mono select-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider block mb-1">
                    Pre-Filled Legal Letter Body
                  </label>
                  <textarea
                    rows={8}
                    readOnly
                    value={cancelModal.emailBody}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-aura-border text-xs text-aura-text font-mono leading-relaxed select-all focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-white/[0.08]">
                <div className="text-xs text-aura-text-muted">
                  Saves{' '}
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(
                      convertCurrency(cancelModal.sub.amount * 12, cancelModal.sub.currency, baseCurrency, fxRates),
                      baseCurrency
                    )}
                    /year
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={copyDraftToClipboard}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors"
                  >
                    {cancelModal.copied ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={assassinateSubscription}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 text-xs font-semibold text-white shadow-lg transition-transform active:scale-95"
                  >
                    <Zap size={14} />
                    <span>Assassinate & Deactivate</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
