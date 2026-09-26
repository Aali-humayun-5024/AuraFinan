// BudgetBasics — AI Chatbot Assistant Module
// Complies with TechWiz 7 SRS Section 1.6.8:
// - Question input area and Ask button
// - Responds to common questions using pre-defined responses, keyword matching, and smart rules
// - Suggested prompts: 'What is a need?', 'How much should I save?', 'How do I avoid overspending?'
// - Safe fallback message when question is outside available educational topics
// - Prominent educational disclaimer

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  'What is a need?',
  'How much should I save as a student?',
  'How do I avoid overspending on campus?',
  'Explain the 50/30/20 rule simply',
  'What should my emergency fund size be?',
  'How do I manage impulse shopping?',
];

const PREDEFINED_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['what is a need', 'need vs want', 'definition of need', 'requirements'],
    answer:
      'A **Need** is an essential requirement for basic living, health, and academic continuation. For students, needs include hostel/dorm rent, essential groceries/mess food, mandatory textbooks, and transit passes. Unlike wants, needs cannot be eliminated without causing severe disruption.',
  },
  {
    keywords: ['how much should i save', 'saving percentage', 'savings rate', 'student savings'],
    answer:
      'As a baseline student guideline, aim for **20% of your monthly allowance or income** under the 50/30/20 rule. If your fixed costs are particularly high, even saving **10% or $25/month** builds the habit of paying yourself first. Start small, but be consistent!',
  },
  {
    keywords: ['avoid overspending', 'stop overspending', 'overspending', 'save money campus'],
    answer:
      'To prevent overspending on campus:\n1. **Adopt the 48-Hour Rule:** Wait two full days before buying non-essentials.\n2. **Weekly Allowance:** Divide your discretionary money into 4 weekly cash envelopes instead of one monthly pool.\n3. **Cook/Pack Snacks:** Carry coffee and light meals to avoid frequent $5 cafeteria swipes.\n4. **Audit Subscriptions:** Cancel unused streaming and gaming trials.',
  },
  {
    keywords: ['50/30/20', '50 30 20', 'golden ratio', 'rule of thumb'],
    answer:
      'The **50/30/20 Rule** divides your monthly net income into three distinct buckets:\n• **50% for Needs:** Rent, groceries, transport, utilities, tuition.\n• **30% for Wants:** Dining out, entertainment, fashion, gaming, hobbies.\n• **20% for Savings:** Emergency fund, long-term reserves, goal targets.',
  },
  {
    keywords: ['emergency fund', 'safety net', 'emergency buffer'],
    answer:
      'For college students, an initial emergency fund of **$300 to $500 (or PKR 15,000 to 25,000)** is an ideal starter target. This safely covers unexpected laptop repairs, prescription medicines, or urgent travel without taking on high-interest debt.',
  },
  {
    keywords: ['impulse', 'flash sale', 'online shopping'],
    answer:
      'Impulse buying is driven by dopamine and artificial urgency (like flash sales). Counter it by deleting saved payment cards from shopping apps, keeping a 30-day wishlist, and calculating cost in hours of study/work rather than dollars.',
  },
];

const FALLBACK_MESSAGE =
  "I am BudgetBee, an educational assistant trained on personal budgeting fundamentals (the 50/30/20 rule, needs vs wants, student expense planning, and savings goals). For topics outside student budgeting or specific tax/legal advice, please consult an accredited financial advisor.";

export default function AIChatbotModule() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hello! I am **BudgetBee**, your AI student financial assistant. Ask me anything about budgeting fundamentals, dividing your allowance with the 50/30/20 rule, separating needs from wants, or setting your first savings goal.",
      timestamp: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Process answer via rule-based keyword match
    setTimeout(() => {
      const lower = clean.toLowerCase();
      let matchedAnswer: string | null = null;

      for (const item of PREDEFINED_KNOWLEDGE) {
        if (item.keywords.some((kw) => lower.includes(kw))) {
          matchedAnswer = item.answer;
          break;
        }
      }

      const replyText = matchedAnswer || FALLBACK_MESSAGE;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputVal);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
          <Bot size={14} /> AI Financial Assistant
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <span>AI Budget Assistant (BudgetBee)</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-mono font-bold">
            Interactive Q&A
          </span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          Ask questions about saving, managing allowances, reducing unnecessary expenses, or avoiding common money pitfalls.
        </p>
      </div>

      {/* Suggested Prompts Ribbon (SRS Requirement 1.6.8) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          Suggested Student Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer shadow-2xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Display Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden flex flex-col h-[460px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? <User size={15} /> : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-amber-500/15 text-slate-900 dark:text-white border border-amber-500/30'
                    : 'bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className="text-[10px] text-slate-400 text-right pt-0.5 font-mono">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2"
        >
          <label htmlFor="ai-chat-input" className="sr-only">
            Ask a financial question
          </label>
          <input
            id="ai-chat-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your question here (e.g. 'What is a need?' or 'How to save $500')..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              inputVal.trim()
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Ask</span>
            <Send size={13} />
          </button>
        </form>
      </div>

      {/* Mandatory Disclaimer (SRS Requirement 1.6.8) */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info size={16} className="text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-slate-900 dark:text-white">Educational Disclaimer:</strong>{' '}
          BudgetBee provides general budgeting and financial awareness content for educational purposes only. It does not provide certified banking services, investment advice, or tax consulting.
        </div>
      </div>
    </div>
  );
}
