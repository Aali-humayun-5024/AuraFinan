// AuraFinance OS — General Ledger Executive View
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Scale, FileText, CheckCircle2 } from 'lucide-react';
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
    <div className="w-full flex-1 flex flex-col min-h-0">
      {/* Top Tab Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
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
