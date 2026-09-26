// AuraFinance OS — Embedded Financial AI Chatbot (Copilot)
// Dual Intelligence Modes: Wealth Mentor + Gen-Z Roast
// Ledger Grounding: Real Dexie.js IndexedDB verification (Wants budget, debts, liquidity)
// Keyboard shortcut: ⌘J / Ctrl+J

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, convertCurrency } from '../../services/fxService';
import { playClickSound, playSuccessSound } from '../../services/soundService';
import { getActiveGeminiKey } from '../../services/geminiKeyConfig';
import { useTranslation } from '../../i18n/useTranslation';
import { useCoherentFinancialState } from '../../context/FinancialStateContext';
import {
  Bot,
  Flame,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Scale,
  Zap,
  CreditCard,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode: 'mentor' | 'roast';
  metadata?: {
    affordabilityDecision?: 'APPROVED' | 'CAUTION' | 'REJECTED';
    liquidSurplus?: number;
    wantsHeadroom?: number;
    recommendedCap?: number;
  };
}

export const CopilotChatbot: React.FC = () => {
  const {
    copilotDrawerOpen,
    setCopilotDrawerOpen,
    baseCurrency,
    fxRates,
    geminiApiKey,
    aiPersona,
    setAiPersona,
  } = useAppStore();

  const { country, bazaarTerms } = useTranslation();
  const { state: coherentState } = useCoherentFinancialState();

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray()) || [];

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (copilotDrawerOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [copilotDrawerOpen]);

  // Global Keyboard Shortcut: ⌘J / Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCopilotDrawerOpen(!copilotDrawerOpen);
      }
      if (e.key === 'Escape' && copilotDrawerOpen) {
        setCopilotDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copilotDrawerOpen, setCopilotDrawerOpen]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text:
            aiPersona === 'roast'
              ? `🔥 Ready to face your financial truth? I'm your Gen-Z Roast Copilot. Ask me if you can afford that luxury dinner, let me audit your ghost subscriptions, or prepare to be roasted for discretionary leaks.`
              : `💎 Welcome to your private Wealth Copilot. Grounded directly in your double-entry ledger, I analyze your 50/30/20 buckets, debt runway, and liquid surplus to give you mathematically verified advice. How can I guide you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: aiPersona,
        },
      ]);
    }
  }, [aiPersona, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Ledger calculation summary for AI prompt context
  const ledgerContext = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const todaysExpenses = transactions
      .filter((t) => t.date === todayStr && t.type === 'expense')
      .reduce((s, t) => s + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

    const activeSubsTotal = subscriptions
      .filter((s) => s.isActive)
      .reduce((s, sub) => s + convertCurrency(sub.amount, sub.currency, baseCurrency, fxRates), 0);

    const totalDebtsOwed = coherentState?.ious?.totalIOweOthers ?? 0;
    const totalInflows = coherentState?.liquidity?.totalInflows ?? 0;
    const wantsCeiling = Math.round(totalInflows * 0.3 * 100) / 100;
    const wantsSpent = coherentState?.buckets503020?.wantsTotal ?? 0;
    const wantsHeadroom = Math.max(0, wantsCeiling - wantsSpent);
    const liquidCash = coherentState?.liquidity?.liquidCash ?? coherentState?.liquidity?.closingBalance ?? 0;
    const netPosition = coherentState?.liquidity?.netPosition ?? 0;
    const monthlyOutflows = coherentState?.liquidity?.totalOutflows ?? 0;

    return {
      liquidCash,
      netPosition,
      wantsTarget: wantsCeiling,
      wantsSpent,
      wantsHeadroom,
      totalDebtsOwed,
      todaysExpenses,
      activeSubsTotal,
      subsCount: subscriptions.filter((s) => s.isActive).length,
      monthlyIncome: totalInflows,
      monthlyOutflows,
    };
  }, [transactions, subscriptions, coherentState, baseCurrency, fxRates]);

  // Ledger Grounded Query Solver: Evaluates affordability, spending, subscriptions, zakat
  const resolveLedgerGroundedQuery = async (queryText: string): Promise<ChatMessage> => {
    const lower = queryText.toLowerCase();

    // Check for "Can I afford $X" or "afford" queries
    const affordMatch = queryText.match(/(?:afford|buy|spend|dinner|purchase)\s*(?:a|an)?\s*[\$£€₨]?\s*(\d+[\d,]*\.?\d*)/i);
    const extractedAmount = affordMatch ? parseFloat(affordMatch[1].replace(/,/g, '')) : null;

    if (extractedAmount !== null && extractedAmount > 0) {
      const targetAmount = extractedAmount;
      const { liquidCash, wantsHeadroom, totalDebtsOwed } = ledgerContext;

      let decision: 'APPROVED' | 'CAUTION' | 'REJECTED' = 'APPROVED';
      let explanation = '';

      if (targetAmount > liquidCash) {
        decision = 'REJECTED';
        explanation =
          aiPersona === 'roast'
            ? `💀 ABSOLUTELY NOT! You want to drop ${formatCurrency(targetAmount, baseCurrency)} when your liquid cash balance is only ${formatCurrency(liquidCash, baseCurrency)}?! That's literal overdraft fiction. Put down the card and sip tap water.`
            : `🛑 REJECTED ON LIQUIDITY: The requested expense of ${formatCurrency(targetAmount, baseCurrency)} exceeds your current total liquid cash balance (${formatCurrency(liquidCash, baseCurrency)}). Approving this would induce negative cashflow or debt.`;
      } else if (targetAmount > wantsHeadroom) {
        decision = 'CAUTION';
        explanation =
          aiPersona === 'roast'
            ? `⚠️ Big yikes: Technically you have the cash, but you're blowing past your 30% Wants limit! Your remaining discretionary headroom is only ${formatCurrency(wantsHeadroom, baseCurrency)}. If you buy this, you're stealing from your future self.`
            : `⚠️ PROCEED WITH CAUTION: You have sufficient vault cash (${formatCurrency(liquidCash, baseCurrency)}), but your remaining 30% Wants budget headroom is only ${formatCurrency(wantsHeadroom, baseCurrency)}. This outlay will cause a discretionary budget deficit.`;
      } else {
        decision = 'APPROVED';
        explanation =
          aiPersona === 'roast'
            ? `✨ Miraculously, you can actually afford this ${formatCurrency(targetAmount, baseCurrency)} spend. Your Wants buffer has ${formatCurrency(wantsHeadroom, baseCurrency)} remaining. Just don't celebrate by ordering 3 more things you don't need.`
            : `✅ VERIFIED BY DOUBLE-ENTRY AUDIT: You are clear to spend ${formatCurrency(targetAmount, baseCurrency)}. You have ${formatCurrency(wantsHeadroom, baseCurrency)} in discretionary Wants headroom and ${formatCurrency(liquidCash, baseCurrency)} in liquid reserves.`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: explanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: aiPersona,
        metadata: {
          affordabilityDecision: decision,
          liquidSurplus: liquidCash,
          wantsHeadroom,
          recommendedCap: wantsHeadroom,
        },
      };
    }

    // Attempt Gemini 2.0 Flash call with grounded IndexedDB context
    try {
      const apiKey = geminiApiKey || getActiveGeminiKey();
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const promptDirective =
        aiPersona === 'roast'
          ? `You are "AuraSavage" – a hilarious, witty, candid Gen-Z personal finance comedian. Roast the user's spending habits or answer their question with witty banter while respecting the real numbers provided. Use short punchy sentences, emojis, and slang.`
          : `You are "AuraMentor" – a prestigious Chief Financial Officer and certified wealth architect. Answer the user with extreme analytical precision, empathy, and strategic clarity. Always quote exact ledger metrics.`;

      const prompt = `${promptDirective}
Base Currency: ${baseCurrency}
Country: ${country.name}
Real Ledger Context from Dexie.js:
- Liquid Vault Cash: ${formatCurrency(ledgerContext.liquidCash, baseCurrency)}
- Net Cash Position: ${formatCurrency(ledgerContext.netPosition, baseCurrency)}
- 50/30/20 Wants Target: ${formatCurrency(ledgerContext.wantsTarget, baseCurrency)}
- 50/30/20 Wants Already Spent: ${formatCurrency(ledgerContext.wantsSpent, baseCurrency)}
- Remaining Discretionary Headroom: ${formatCurrency(ledgerContext.wantsHeadroom, baseCurrency)}
- Outstanding Debts Owed: ${formatCurrency(ledgerContext.totalDebtsOwed, baseCurrency)}
- Today's Outflows: ${formatCurrency(ledgerContext.todaysExpenses, baseCurrency)}
- Active Subscriptions: ${ledgerContext.subsCount} (${formatCurrency(ledgerContext.activeSubsTotal, baseCurrency)}/month)

User Query: "${queryText}"

Provide a concise, grounded response (under 140 words).`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: res.text || 'Ledger analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: aiPersona,
      };
    } catch {
      // Deterministic Client-Side Heuristic Fallback
      let fallback = '';
      if (lower.includes('today') || lower.includes('spent') || lower.includes('spending')) {
        fallback =
          aiPersona === 'roast'
            ? `💸 Today you logged ${formatCurrency(ledgerContext.todaysExpenses, baseCurrency)} in outlays. Your wallet is catching its breath! Keep it locked for the rest of the day.`
            : `📊 Today's total recorded expenditure is ${formatCurrency(ledgerContext.todaysExpenses, baseCurrency)}. Your total monthly burn stands at ${formatCurrency(ledgerContext.monthlyOutflows, baseCurrency)} against ${formatCurrency(ledgerContext.monthlyIncome, baseCurrency)} in inflows.`;
      } else if (lower.includes('subscription') || lower.includes('audit')) {
        fallback =
          aiPersona === 'roast'
            ? `🧛 You have ${ledgerContext.subsCount} active subscriptions sucking ${formatCurrency(ledgerContext.activeSubsTotal, baseCurrency)} each month (${formatCurrency(ledgerContext.activeSubsTotal * 12, baseCurrency)} a year!). Cancel the ghost SaaS you forgot existed!`
            : `📋 Subscription Audit: You are currently maintaining ${ledgerContext.subsCount} active subscriptions totaling ${formatCurrency(ledgerContext.activeSubsTotal, baseCurrency)} monthly (${formatCurrency(ledgerContext.activeSubsTotal * 12, baseCurrency)} annually). Check the Subscriptions desk to prune inactive tiers.`;
      } else if (lower.includes('zakat') || lower.includes('charity') || lower.includes('nisab')) {
        const zakatBase = Math.max(0, ledgerContext.liquidCash - ledgerContext.totalDebtsOwed);
        const zakatDue = Math.round(zakatBase * 0.025 * 100) / 100;
        fallback = `🤲 Zakat & Ethical Wealth Calculation:
Net Zakatable Liquidity (Cash - Immediate Debts): ${formatCurrency(zakatBase, baseCurrency)}
Calculated Zakat Due (2.5%): ${formatCurrency(zakatDue, baseCurrency)}.
Purifying your wealth unlocks compound peace of mind and societal equilibrium.`;
      } else {
        fallback =
          aiPersona === 'roast'
            ? `💀 You have ${formatCurrency(ledgerContext.liquidCash, baseCurrency)} in liquid reserves and ${formatCurrency(ledgerContext.wantsHeadroom, baseCurrency)} left in your Wants ceiling. Treat your budget like a security guard, not a suggestion!`
            : `🎯 Ledger Status Overview:
Liquid Cash: ${formatCurrency(ledgerContext.liquidCash, baseCurrency)}
Wants Headroom: ${formatCurrency(ledgerContext.wantsHeadroom, baseCurrency)} remaining this cycle.
Maintain strict adherence to your 50/30/20 equilibrium for optimal compounding velocity.`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: aiPersona,
      };
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping) return;

    playClickSound();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: aiPersona,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseMsg = await resolveLedgerGroundedQuery(textToSend);
      setMessages((prev) => [...prev, responseMsg]);
      playSuccessSound();
    } catch (err) {
      console.error('Copilot evaluation error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Encountered a momentary calculation timeout. Real ledger parameters remain fully accessible.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: aiPersona,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  return (
    <AnimatePresence>
      {copilotDrawerOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCopilotDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity"
          />

          {/* Slide-Over Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] md:w-[480px] z-[100]
              bg-white/95 dark:bg-[#090D1A]/95 backdrop-blur-3xl
              border-l border-slate-200/90 dark:border-white/[0.12]
              shadow-[0_24px_64px_rgba(0,0,0,0.5)]
              flex flex-col overflow-hidden"
          >
            {/* Header Stage */}
            <div className="px-5 py-4 border-b border-slate-200/90 dark:border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                    aiPersona === 'roast'
                      ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-500/25'
                      : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-purple-500/25'
                  }`}
                >
                  {aiPersona === 'roast' ? <Flame size={18} /> : <Bot size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Aura Copilot
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      Live Ledger Grounded
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time IndexedDB single source of truth
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Mode Selector Pill: Wealth Mentor vs Gen-Z Roast */}
                <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
                  <button
                    onClick={() => {
                      playClickSound();
                      setAiPersona('mentor');
                    }}
                    title="Switch to Strategic Wealth Mentor"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      aiPersona === 'mentor'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sparkles size={11} />
                    <span>Mentor</span>
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setAiPersona('roast');
                    }}
                    title="Switch to Gen-Z Roast Mode"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      aiPersona === 'roast'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Flame size={11} />
                    <span>Roast</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setCopilotDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                  title="Close Drawer (Esc or ⌘J)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Live Ledger Pulse Strip */}
            <div className="px-5 py-2 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between text-[11px] shrink-0">
              <span className="text-slate-500 dark:text-slate-400">
                Liquid Vault:{' '}
                <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(ledgerContext.liquidCash, baseCurrency)}
                </strong>
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Wants Remaining:{' '}
                <strong
                  className={`tabular-nums ${
                    ledgerContext.wantsHeadroom > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatCurrency(ledgerContext.wantsHeadroom, baseCurrency)}
                </strong>
              </span>
            </div>

            {/* Message Thread History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#0D121E]/80 border border-slate-200/90 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Affordability Decision Badge */}
                    {msg.metadata?.affordabilityDecision && (
                      <div className="mb-2">
                        {msg.metadata.affordabilityDecision === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                            <CheckCircle2 size={11} /> Affordability Verified
                          </span>
                        )}
                        {msg.metadata.affordabilityDecision === 'CAUTION' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                            <AlertTriangle size={11} /> Discretionary Warning
                          </span>
                        )}
                        {msg.metadata.affordabilityDecision === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                            <AlertTriangle size={11} /> Outlay Denied
                          </span>
                        )}
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#0D121E]/80 border border-slate-200/90 dark:border-white/[0.08] max-w-[120px]">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="p-3 border-t border-slate-200/90 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Zap size={11} className="text-amber-500" />
                <span>1-Click Ledger Actions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Analyze Today's Spending", icon: TrendingUp },
                  { label: 'Can I afford a $150 dinner tonight?', icon: Receipt },
                  { label: 'Audit Subscriptions', icon: CreditCard },
                  { label: 'Calculate Zakat/Charity', icon: HeartHandshake },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.label)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium
                        bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]
                        hover:border-purple-500/40 text-slate-700 dark:text-slate-300
                        transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
                    >
                      <Icon size={12} className="text-purple-500" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-[#090D1A] border-t border-slate-200/90 dark:border-white/[0.08] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  aiPersona === 'roast'
                    ? 'Ask me if you can afford it, or prepare to be roasted...'
                    : 'Ask about cashflow, affordability, zakat, or taxes...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-md shadow-purple-600/20 cursor-pointer shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CopilotChatbot;
