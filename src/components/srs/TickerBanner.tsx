// BudgetBasics — Real-time Date/Time, Visitor Counter & Financial Quotes Ticker
// Complies with TechWiz 7 SRS Requirements 1.6 & 1.6.11
import React, { useState, useEffect } from 'react';
import { Clock, Users, Sparkles, TrendingUp, ShieldAlert, Award } from 'lucide-react';

const FINANCIAL_QUOTES = [
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "The 50/30/20 rule: 50% for Needs, 30% for Wants, 20% for your Future.", author: "BudgetBasics Golden Rule" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "Never spend your money before you have earned it.", author: "Thomas Jefferson" },
];

export default function TickerBanner() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    const saved = localStorage.getItem('budgetbasics_visitor_count');
    if (saved) return parseInt(saved, 10);
    const initial = 14285;
    localStorage.setItem('budgetbasics_visitor_count', initial.toString());
    return initial;
  });

  // Clock ticker every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Quotes cycler every 7 seconds
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % FINANCIAL_QUOTES.length);
    }, 7000);
    return () => clearInterval(quoteTimer);
  }, []);

  // Increment visitor counter on first mount in session
  useEffect(() => {
    if (!sessionStorage.getItem('budgetbasics_session_counted')) {
      sessionStorage.setItem('budgetbasics_session_counted', 'true');
      setVisitorCount((prev) => {
        const next = prev + 1;
        localStorage.setItem('budgetbasics_visitor_count', next.toString());
        return next;
      });
    }
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const currentQuote = FINANCIAL_QUOTES[quoteIndex];

  return (
    <div className="w-full bg-amber-500/10 dark:bg-amber-950/25 border-b border-amber-500/20 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
      {/* Left: Financial Quote / Tip Ticker */}
      <div className="flex items-center gap-2 min-w-0 max-w-2xl overflow-hidden">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider shrink-0">
          <Sparkles size={11} /> Smart Money Tip
        </span>
        <div className="truncate text-slate-800 dark:text-slate-200 transition-all duration-500">
          <span className="italic font-medium">"{currentQuote.text}"</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold ms-1.5">— {currentQuote.author}</span>
        </div>
      </div>

      {/* Right: Visitor Counter & Live Real-Time Clock */}
      <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
        {/* Visitor Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
          <Users size={12} className="text-emerald-500" />
          <span>Visitors: <strong className="font-bold">{visitorCount.toLocaleString()}</strong></span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200">
          <Clock size={12} className="text-cyan-600 dark:text-cyan-400" />
          <span>{formattedDate} · <span className="font-bold text-cyan-600 dark:text-cyan-400">{formattedTime}</span></span>
        </div>
      </div>
    </div>
  );
}
