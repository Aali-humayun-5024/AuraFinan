// AuraFinance OS — AI Copilot: Mentor + Roast Modes + Subscription Hunter
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, convertCurrency } from '../services/fxService';
import { geminiFinancialAdvice } from '../services/aiService';
import { Bot, Flame, Heart, RefreshCw, Skull, Copy, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';

export default function AICopilotView() {
  const { baseCurrency, fxRates, aiPersona, setAiPersona, geminiApiKey } = useAppStore();
  const { country, bazaarTerms, locale } = useTranslation();
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray()) || [];
  
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  // Build context string for AI
  const context = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amountInUSD, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amountInUSD, 0);
    
    const cats: Record<string, number> = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amountInUSD;
    });

    const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const subsTotal = subscriptions.filter(s => s.isActive).reduce((s, sub) => s + sub.amount, 0);

    return `User Region: ${country.name} (${country.region}). Currency: ${baseCurrency}.
This month's income: $${income.toFixed(0)}. Total expenses: $${expenses.toFixed(0)}. Net: $${(income - expenses).toFixed(0)}.
Top spending categories: ${topCats.map(([c, v]) => `${c}: $${v.toFixed(0)}`).join(', ')}.
Active subscriptions: ${subscriptions.filter(s => s.isActive).length} totaling $${subsTotal.toFixed(2)}/month ($${(subsTotal * 12).toFixed(0)}/year).
Recent purchases: ${thisMonth.slice(0, 8).map(t => `${t.title} ($${t.amountInUSD.toFixed(0)})`).join(', ')}.`;
  }, [transactions, subscriptions, country, baseCurrency]);

  const generateAdvice = async () => {
    setLoading(true);
    try {
      const result = await geminiFinancialAdvice(context, aiPersona, geminiApiKey, country.name, bazaarTerms);
      setAdvice(result);
    } catch {
      setAdvice('Unable to generate advice. Please try again.');
    }
    setLoading(false);
  };

  // Subscription Hunter
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const totalMonthly = activeSubscriptions.reduce((s, sub) => {
    const converted = convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates);
    return s + converted;
  }, 0);
  const totalAnnual = totalMonthly * 12;

  const generateCancelEmail = (sub: typeof activeSubscriptions[0]) => {
    return `Subject: Subscription Cancellation Request - ${sub.name}

Dear ${sub.merchant || sub.name} Support Team,

I am writing to request the cancellation of my ${sub.name} subscription effective immediately. 

Please confirm the cancellation and ensure that no further charges will be made to my account. If there are any remaining steps I need to complete, please let me know.

Thank you for your prompt attention to this matter.

Best regards`;
  };

  const handleCopyEmail = (index: number, sub: typeof activeSubscriptions[0]) => {
    navigator.clipboard.writeText(generateCancelEmail(sub));
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-aura-accent/20 text-aura-accent border border-aura-accent/30 flex items-center gap-1.5">
              <span>{country.flag}</span>
              <span>{country.name} Vernacular AI</span>
            </span>
            <span className="text-xs text-aura-text-muted">
              Active Terms: {bazaarTerms.savingsCommunity} • {bazaarTerms.emergencyFund}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-aura-text flex items-center gap-2">
            <Bot size={24} className="text-aura-accent" /> AI Financial Co-Pilot
          </h1>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System AI Core: Active & Connected (Gemini 2.0 Flash Pro Tier)</span>
          </p>
        </div>
      </div>

      {/* Persona Toggle */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-aura-text mb-4">Choose Your AI Persona</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAiPersona('mentor')}
            className={`p-4 rounded-xl border transition-all text-left ${
              aiPersona === 'mentor'
                ? 'bg-aura-cyan/10 border-aura-cyan/30 shadow-lg'
                : 'bg-white/[0.03] border-aura-border hover:border-aura-border-bright'
            }`}
            style={aiPersona === 'mentor' ? { boxShadow: '0 0 25px rgba(6,182,212,0.15)' } : {}}
          >
            <Heart size={24} className={aiPersona === 'mentor' ? 'text-aura-cyan mb-2' : 'text-aura-text-muted mb-2'} />
            <h4 className="text-sm font-semibold text-aura-text">Mentor Mode 🧑‍🏫</h4>
            <p className="text-xs text-aura-text-muted mt-1">
              Kind, encouraging financial coach. Zero jargon, teen-friendly explanations.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAiPersona('roast')}
            className={`p-4 rounded-xl border transition-all text-left ${
              aiPersona === 'roast'
                ? 'bg-aura-red/10 border-aura-red/30 shadow-lg'
                : 'bg-white/[0.03] border-aura-border hover:border-aura-border-bright'
            }`}
            style={aiPersona === 'roast' ? { boxShadow: '0 0 25px rgba(239,68,68,0.15)' } : {}}
          >
            <Skull size={24} className={aiPersona === 'roast' ? 'text-aura-red mb-2' : 'text-aura-text-muted mb-2'} />
            <h4 className="text-sm font-semibold text-aura-text">Gen-Z Roast Mode 🔥</h4>
            <p className="text-xs text-aura-text-muted mt-1">
              Savage, witty, viral-worthy roasts of your spending habits. No mercy.
            </p>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateAdvice}
          disabled={loading || transactions.length === 0}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-aura-accent to-purple-500 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ boxShadow: '0 4px 20px rgba(124,92,252,0.3)' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Analyzing your finances...
            </>
          ) : (
            <>
              <Flame size={16} /> Get {aiPersona === 'roast' ? 'Roasted' : 'Advice'}
            </>
          )}
        </motion.button>

        {/* AI Response */}
        <AnimatePresence>
          {advice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-5 rounded-xl border ${
                aiPersona === 'roast'
                  ? 'bg-aura-red/5 border-aura-red/20'
                  : 'bg-aura-cyan/5 border-aura-cyan/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {aiPersona === 'roast' ? (
                  <Skull size={16} className="text-aura-red" />
                ) : (
                  <Heart size={16} className="text-aura-cyan" />
                )}
                <span className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider">
                  {aiPersona === 'roast' ? 'AuraSavage Says' : 'AuraMentor Says'}
                </span>
              </div>
              <p className="text-sm text-aura-text leading-relaxed whitespace-pre-line">{advice}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🧛 Vampire Subscription Hunter */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-aura-text flex items-center gap-2">
              🧛 Vampire Subscription Hunter
            </h3>
            <p className="text-xs text-aura-text-muted mt-1">Recurring charges draining your wallet silently</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-aura-text-muted">Annual Impact</p>
            <p className="text-lg font-bold text-aura-red font-mono">{formatCurrency(totalAnnual, baseCurrency)}</p>
          </div>
        </div>

        {activeSubscriptions.length > 0 ? (
          <div className="space-y-2">
            {activeSubscriptions.map((sub, i) => {
              const monthlyConverted = convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates);
              return (
                <motion.div
                  key={sub.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aura-red-soft flex items-center justify-center text-sm">
                      🧛
                    </div>
                    <div>
                      <p className="text-sm font-medium text-aura-text">{sub.name}</p>
                      <p className="text-xs text-aura-text-muted">{sub.category} · {sub.billingCycle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-mono text-aura-red">{formatCurrency(monthlyConverted, baseCurrency)}/mo</p>
                      <p className="text-[10px] text-aura-text-muted font-mono">{formatCurrency(monthlyConverted * 12, baseCurrency)}/yr</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopyEmail(i, sub)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-aura-accent/15 text-aura-accent text-xs font-semibold flex items-center gap-1"
                    >
                      {copied === i ? <Check size={12} /> : <Copy size={12} />}
                      {copied === i ? 'Copied!' : 'Cancel Email'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-aura-text-muted text-center py-6">No active subscriptions tracked</p>
        )}

        {activeSubscriptions.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-aura-amber/10 border border-aura-amber/20">
            <p className="text-xs text-aura-amber font-semibold">
              💡 Pro Tip: If you canceled just 2 unused subscriptions, you could save up to{' '}
              <span className="font-mono">
                {formatCurrency(
                  activeSubscriptions.slice(-2).reduce((s, sub) => s + convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates), 0) * 12,
                  baseCurrency
                )}
              </span>{' '}
              per year!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
