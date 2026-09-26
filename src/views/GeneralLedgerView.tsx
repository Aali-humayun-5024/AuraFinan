// AuraFinance OS — General Ledger Executive View
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Scale, FileText, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';
import GeneralJournal from '../components/ledger/GeneralJournal';
import TrialBalanceView from '../components/ledger/TrialBalanceView';
import FinancialReports from '../components/ledger/FinancialReports';
import { playClickSound } from '../services/soundService';

type LedgerTab = 'journal' | 'trial-balance' | 'reports';

export default function GeneralLedgerView() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('journal');

  const tabs: { id: LedgerTab; label: string; icon: typeof BookOpen }[] = [
    { id: 'journal', label: 'General Journal & OCR Scan', icon: BookOpen },
    { id: 'trial-balance', label: 'Trial Balance Ledger', icon: Scale },
    { id: 'reports', label: 'Balance Sheet & Income Statement', icon: FileText },
  ];

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-4">
      {/* Commerce & Accounting Simulator Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1">
        <div className="border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 uppercase tracking-wider">
              <GraduationCap size={13} /> Commerce & Accounting Learning Lab
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Interactive Bookkeeping Simulator
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
              Golden Rule: Total Debits = Total Credits ($Dr = $Cr)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Accounting Simulator & Double-Entry Ledger</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-mono font-bold">
              Double-Entry Lab
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-4xl leading-relaxed">
            A hands-on, real-world bookkeeping simulation engine built for <strong>Commerce, Accounting & Business students</strong>. 
            Master the foundation of financial accounting: post multi-line journal transactions with strict Debit/Credit validation, observe automatic ledger posting to the Chart of Accounts, inspect the live Trial Balance, and generate instantaneous Balance Sheets and Profit &amp; Loss statements.
          </p>
        </div>
      </div>

      {/* Top Tab Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-aura-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-aura-accent text-white shadow-md'
                    : 'bg-aura-surface/60 hover:bg-aura-surface text-aura-text-muted hover:text-aura-text border border-aura-border'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GeneralJournal />
            </motion.div>
          )}

          {activeTab === 'trial-balance' && (
            <motion.div
              key="trial-balance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TrialBalanceView />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FinancialReports />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
