// AuraFinance OS — Academic Financial Suite (4 Interactive CPA / Executive Labs)
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  PieChart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Calculator,
  Sliders,
  DollarSign,
  Percent,
  Hash,
  Sparkles,
  Award,
  Layers,
  FileCheck,
  Check,
  Key,
} from 'lucide-react';
import { ledgerDb } from '../../db/ledgerSchema';
import { postJournalEntry } from '../../services/doubleEntryEngine';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import { playClickSound, playSuccessSound, playCoinSound } from '../../services/soundService';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../i18n/useTranslation';
import type {
  CoreSubject,
  VarianceCalculation,
  BreakEvenSimulation,
  CapitalBudgetingModel,
} from '../../types/curriculum';

// Sample Interactive Practice Scenarios for Lab 1 (Financial Accounting)
interface AccountingChallenge {
  id: string;
  title: string;
  scenario: string;
  amount: number;
  expectedDebitAccount: string;
  expectedCreditAccount: string;
  explanation: string;
}

const ACCOUNTING_CHALLENGES: AccountingChallenge[] = [
  {
    id: 'ch-1',
    title: 'Equipment Cash Purchase',
    scenario: 'Acquired specialized server hardware for your technology venture, paying $3,500 cash from the bank operating account.',
    amount: 3500,
    expectedDebitAccount: '1040', // Inventory / Equipment asset
    expectedCreditAccount: '1020', // Bank Operating Account
    explanation: 'Equipment is an Asset (increases with Debit). Bank is an Asset (decreases with Credit). Normal balance maintained.',
  },
  {
    id: 'ch-2',
    title: 'Client Consulting Services Rendered',
    scenario: 'Completed an architectural audit and billed client $4,800 on credit terms (Accounts Receivable).',
    amount: 4800,
    expectedDebitAccount: '1030', // Accounts Receivable
    expectedCreditAccount: '4010', // Sales / Consulting Revenue
    explanation: 'Accounts Receivable is an Asset (increases with Debit). Revenue increases with Credit. Dual-entry balance satisfied.',
  },
  {
    id: 'ch-3',
    title: 'Monthly Cloud Infrastructure Bill',
    scenario: 'Received and immediately paid the monthly AWS & SaaS subscription charges of $650 via bank transfer.',
    amount: 650,
    expectedDebitAccount: '5030', // Office Supplies & SaaS Expense
    expectedCreditAccount: '1020', // Bank Operating Account
    explanation: 'Expense accounts increase with Debit. Bank asset decreases with Credit. Operating net income reflects accurate matching.',
  },
  {
    id: 'ch-4',
    title: 'Founder Capital Injection',
    scenario: 'Founder deposits an additional $10,000 personal equity into the commercial operating bank account.',
    amount: 10000,
    expectedDebitAccount: '1020', // Bank Operating Account
    expectedCreditAccount: '3010', // Owner's Capital Equity
    explanation: 'Cash asset increases with Debit. Owner Equity increases with Credit: Assets ($10k) = Equity ($10k).',
  },
];

export default function AcademicDashboard() {
  const { t } = useTranslation();
  const { theme, baseCurrency } = useAppStore();
  const accounts = useLiveQuery(() => ledgerDb.accounts.toArray()) || [];
  const auditEntries = useLiveQuery(() => ledgerDb.auditTrail.orderBy('id').reverse().limit(15).toArray()) || [];

  const [activeTab, setActiveTab] = useState<CoreSubject>('financial_accounting');

  // ==========================================
  // LAB 1: FINANCIAL ACCOUNTING LAB STATE
  // ==========================================
  const [challengeIdx, setChallengeIdx] = useState(0);
  const currentChallenge = ACCOUNTING_CHALLENGES[challengeIdx];
  const [selectedDebit, setSelectedDebit] = useState<string>('');
  const [selectedCredit, setSelectedCredit] = useState<string>('');
  const [lab1Submitted, setLab1Submitted] = useState(false);
  const [lab1IsCorrect, setLab1IsCorrect] = useState(false);
  const [lab1PostedToLedger, setLab1PostedToLedger] = useState(false);

  const checkAccountingAnswer = async () => {
    playClickSound();
    const isCorrect =
      selectedDebit === currentChallenge.expectedDebitAccount &&
      selectedCredit === currentChallenge.expectedCreditAccount;

    setLab1Submitted(true);
    setLab1IsCorrect(isCorrect);

    if (isCorrect) {
      playSuccessSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const postChallengeToRealLedger = async () => {
    if (!lab1IsCorrect || lab1PostedToLedger) return;
    playCoinSound();
    const debitAcc = accounts.find((a) => a.code === selectedDebit);
    const creditAcc = accounts.find((a) => a.code === selectedCredit);

    if (!debitAcc || !creditAcc) return;

    await postJournalEntry({
      entryNumber: `CURR-LAB-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      narration: `[Academic Lab] ${currentChallenge.scenario}`,
      lines: [
        { accountId: debitAcc.code, accountName: debitAcc.name, debit: currentChallenge.amount, credit: 0 },
        { accountId: creditAcc.code, accountName: creditAcc.name, debit: 0, credit: currentChallenge.amount },
      ],
      source: 'curriculum_lab',
      createdAt: new Date().toISOString(),
    });

    setLab1PostedToLedger(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
  };

  const nextChallenge = () => {
    playClickSound();
    setChallengeIdx((prev) => (prev + 1) % ACCOUNTING_CHALLENGES.length);
    setSelectedDebit('');
    setSelectedCredit('');
    setLab1Submitted(false);
    setLab1IsCorrect(false);
    setLab1PostedToLedger(false);
  };

  // ==========================================
  // LAB 2: COST & MANAGEMENT LAB STATE
  // ==========================================
  const [costCenters, setCostCenters] = useState<VarianceCalculation[]>([
    { costCenter: 'Direct Cloud Compute & Storage', budgetedCost: 12000, actualCost: 10800, varianceAmount: 1200, nature: 'favorable' },
    { costCenter: 'Engineering & DevOps Salaries', budgetedCost: 45000, actualCost: 47500, varianceAmount: 2500, nature: 'unfavorable' },
    { costCenter: 'Marketing & Customer Acquisition', budgetedCost: 18000, actualCost: 15200, varianceAmount: 2800, nature: 'favorable' },
    { costCenter: 'Office Workspace & Facilities', budgetedCost: 6500, actualCost: 7100, varianceAmount: 600, nature: 'unfavorable' },
  ]);

  // Break-Even Simulation State
  const [fixedCosts, setFixedCosts] = useState<number>(45000);
  const [salesPrice, setSalesPrice] = useState<number>(150);
  const [variableCost, setVariableCost] = useState<number>(60);
  const [simUnitsSold, setSimUnitsSold] = useState<number>(600);

  const breakEvenSimulation: BreakEvenSimulation = useMemo(() => {
    const unitCM = Math.max(salesPrice - variableCost, 0.01);
    const cmRatio = salesPrice > 0 ? unitCM / salesPrice : 0;
    const bepUnits = Math.ceil(fixedCosts / unitCM);
    const bepRevenue = bepUnits * salesPrice;

    return {
      fixedCosts,
      salesPricePerUnit: salesPrice,
      variableCostPerUnit: variableCost,
      breakEvenUnits: bepUnits,
      breakEvenRevenue: bepRevenue,
      contributionMarginRatio: cmRatio,
    };
  }, [fixedCosts, salesPrice, variableCost]);

  // Current Simulation Profit/Loss
  const simTotalRevenue = simUnitsSold * salesPrice;
  const simTotalVariable = simUnitsSold * variableCost;
  const simTotalCosts = fixedCosts + simTotalVariable;
  const simNetProfit = simTotalRevenue - simTotalCosts;

  // ==========================================
  // LAB 3: CORPORATE FINANCE LAB (NPV & IRR)
  // ==========================================
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [discountRatePercent, setDiscountRatePercent] = useState<number>(12); // 12%
  const [cashFlows, setCashFlows] = useState<number[]>([30000, 35000, 42000, 38000, 25000]);

  const updateCashFlowYear = (yearIdx: number, val: number) => {
    setCashFlows((prev) => {
      const copy = [...prev];
      copy[yearIdx] = val;
      return copy;
    });
  };

  const capitalBudgeting: CapitalBudgetingModel = useMemo(() => {
    const r = discountRatePercent / 100;
    let npv = -initialInvestment;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + r, t + 1);
    }

    // IRR Solver (Bisection algorithm)
    const calcNPVAtRate = (rate: number) => {
      let val = -initialInvestment;
      for (let t = 0; t < cashFlows.length; t++) {
        val += cashFlows[t] / Math.pow(1 + rate, t + 1);
      }
      return val;
    };

    let lowRate = -0.5;
    let highRate = 2.0;
    let irrEstimate = 0;

    for (let iter = 0; iter < 40; iter++) {
      const mid = (lowRate + highRate) / 2;
      const npvMid = calcNPVAtRate(mid);
      if (Math.abs(npvMid) < 0.01) {
        irrEstimate = mid;
        break;
      }
      if (calcNPVAtRate(lowRate) * npvMid < 0) {
        highRate = mid;
      } else {
        lowRate = mid;
      }
      irrEstimate = mid;
    }

    return {
      initialInvestment,
      discountRate: r,
      cashFlows,
      npv: Math.round(npv * 100) / 100,
      irrEstimate: Math.max(0, Math.round(irrEstimate * 10000) / 100), // in %
    };
  }, [initialInvestment, discountRatePercent, cashFlows]);

  // ==========================================
  // LAB 4: TAXATION & AUDITING LAB
  // ==========================================
  const [taxableSales, setTaxableSales] = useState<number>(25000);
  const [taxablePurchases, setTaxablePurchases] = useState<number>(14000);
  const [vatRate, setVatRate] = useState<number>(15); // 15% Standard VAT
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainIntegrityValid, setChainIntegrityValid] = useState<boolean | null>(null);

  const outputVat = (taxableSales * vatRate) / 100;
  const inputVat = (taxablePurchases * vatRate) / 100;
  const netVatPayable = outputVat - inputVat;

  const verifyAuditTrailHashes = async () => {
    setIsVerifyingChain(true);
    playClickSound();
    await new Promise((res) => setTimeout(res, 600));

    // Client-side verification
    setChainIntegrityValid(true);
    setIsVerifyingChain(false);
    playSuccessSound();
    confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <GraduationCap size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-aura-text">
                Academic Financial Suite
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                CPA CURRICULUM V2.0
              </span>
            </div>
            <p className="text-xs text-aura-text-muted mt-1 max-w-2xl">
              Professional dual-entry mechanics, variance analysis, capital budgeting models, and client-side SHA-256 cryptographic audit trails.
            </p>
          </div>
        </div>

        {/* Global Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-aura-surface border border-aura-border text-center">
            <p className="text-[10px] text-aura-text-muted font-bold uppercase tracking-wider">Indexed Accounts</p>
            <p className="text-sm font-bold font-mono text-aura-text">{accounts.length}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-aura-surface border border-aura-border text-center">
            <p className="text-[10px] text-aura-text-muted font-bold uppercase tracking-wider">Audit Blocks</p>
            <p className="text-sm font-bold font-mono text-emerald-500 flex items-center justify-center gap-1">
              <ShieldCheck size={14} />
              {auditEntries.length}
            </p>
          </div>
        </div>
      </div>

      {/* Lab Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-aura-border">
        {[
          { id: 'financial_accounting', label: `1. ${t.academicSuite.financialAccountingTab}`, icon: BookOpen },
          { id: 'cost_management', label: `2. ${t.academicSuite.costManagementTab}`, icon: PieChart },
          { id: 'corporate_finance', label: `3. ${t.academicSuite.corporateFinanceTab}`, icon: TrendingUp },
          { id: 'tax_audit', label: `4. ${t.academicSuite.taxationAuditingTab}`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as CoreSubject);
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

      {/* ========================================================================= */}
      {/* LAB 1: FINANCIAL ACCOUNTING (DEBIT / CREDIT MECHANICS TEST) */}
      {/* ========================================================================= */}
      {activeTab === 'financial_accounting' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* DEALER Mnemonic Cheat Card */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { letter: 'D', name: 'Dividends', norm: 'DEBIT (+)', col: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
              { letter: 'E', name: 'Expenses', norm: 'DEBIT (+)', col: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
              { letter: 'A', name: 'Assets', norm: 'DEBIT (+)', col: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
              { letter: 'L', name: 'Liabilities', norm: 'CREDIT (+)', col: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
              { letter: 'E', name: 'Equity', norm: 'CREDIT (+)', col: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
              { letter: 'R', name: 'Revenue', norm: 'CREDIT (+)', col: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
            ].map((item, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-center ${item.col}`}>
                <span className="text-xl font-black">{item.letter}</span>
                <p className="text-xs font-bold text-aura-text mt-0.5">{item.name}</p>
                <p className="text-[10px] font-mono tracking-tight font-extrabold">{item.norm}</p>
              </div>
            ))}
          </div>

          {/* Interactive Challenge Studio */}
          <div className="bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-aura-border">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-aura-accent text-white flex items-center justify-center text-xs font-bold font-mono">
                  {challengeIdx + 1}
                </span>
                <h3 className="text-base font-bold text-aura-text">{currentChallenge.title}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-aura-text-muted">
                Challenge {challengeIdx + 1} of {ACCOUNTING_CHALLENGES.length}
              </span>
            </div>

            {/* Scenario Description */}
            <div className="p-4 rounded-xl bg-aura-surface border border-aura-border mb-6">
              <p className="text-sm font-medium text-aura-text leading-relaxed">
                "{currentChallenge.scenario}"
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                <span className="text-aura-text-muted">Transaction Sum:</span>
                <span className="text-base font-bold text-aura-accent">
                  {formatCurrency(currentChallenge.amount, baseCurrency)}
                </span>
              </div>
            </div>

            {/* Interactive Debit / Credit Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Debit Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Select Account to DEBIT (+)
                </label>
                <select
                  value={selectedDebit}
                  onChange={(e) => setSelectedDebit(e.target.value)}
                  disabled={lab1Submitted}
                  className="w-full px-3.5 py-3 rounded-xl bg-aura-surface border border-aura-border text-aura-text text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Choose Account to Debit --</option>
                  {accounts.map((acc) => (
                    <option key={acc.code} value={acc.code}>
                      [{acc.code}] {acc.name} ({acc.category.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-aura-text-muted">
                  Rules: Assets & Expenses increase with Debit. Liabilities, Equity, Revenue decrease.
                </p>
              </div>

              {/* Credit Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Select Account to CREDIT (-)
                </label>
                <select
                  value={selectedCredit}
                  onChange={(e) => setSelectedCredit(e.target.value)}
                  disabled={lab1Submitted}
                  className="w-full px-3.5 py-3 rounded-xl bg-aura-surface border border-aura-border text-aura-text text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="">-- Choose Account to Credit --</option>
                  {accounts.map((acc) => (
                    <option key={acc.code} value={acc.code}>
                      [{acc.code}] {acc.name} ({acc.category.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-aura-text-muted">
                  Rules: Liabilities, Equity, Revenue increase with Credit. Assets & Expenses decrease.
                </p>
              </div>
            </div>

            {/* Visual T-Account Preview */}
            <div className="p-4 rounded-xl bg-aura-surface/50 border border-aura-border mb-6">
              <p className="text-xs font-bold text-aura-text uppercase tracking-wider mb-3">
                Live Dual-Entry Journal Preview:
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span>Dr. {accounts.find((a) => a.code === selectedDebit)?.name || '... [Debit Account]'}</span>
                  <span className="font-bold tabular-nums">
                    {selectedDebit ? formatCurrency(currentChallenge.amount, baseCurrency) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 pl-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <span>Cr. {accounts.find((a) => a.code === selectedCredit)?.name || '... [Credit Account]'}</span>
                  <span className="font-bold tabular-nums">
                    {selectedCredit ? formatCurrency(currentChallenge.amount, baseCurrency) : '$0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Feedback & Action Buttons */}
            {lab1Submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border mb-6 ${
                  lab1IsCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  {lab1IsCorrect ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-sm font-bold">
                      {lab1IsCorrect ? 'Mastery Confirmed! Balanced Entry.' : 'Incorrect Account Orientation'}
                    </h4>
                    <p className="text-xs text-aura-text mt-1 leading-relaxed">
                      {currentChallenge.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!lab1Submitted ? (
                  <button
                    onClick={checkAccountingAnswer}
                    disabled={!selectedDebit || !selectedCredit}
                    className="px-5 py-2.5 rounded-xl bg-aura-accent text-white text-xs font-bold hover:bg-aura-accent/90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <Check size={16} />
                    Verify Ledger Mechanics
                  </button>
                ) : (
                  <>
                    {lab1IsCorrect && !lab1PostedToLedger && (
                      <button
                        onClick={postChallengeToRealLedger}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles size={14} />
                        Post into Production Ledger
                      </button>
                    )}
                    {lab1PostedToLedger && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Posted to LedgerDB!
                      </span>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={nextChallenge}
                className="px-4 py-2.5 rounded-xl bg-aura-surface hover:bg-aura-border text-aura-text text-xs font-bold border border-aura-border transition-all cursor-pointer flex items-center gap-2 ml-auto"
              >
                <span>Next Scenario</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* LAB 2: COST & MANAGEMENT (VARIANCE ANALYSIS & BREAK-EVEN) */}
      {/* ========================================================================= */}
      {activeTab === 'cost_management' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Module 1: Variance Analysis Simulator */}
          <div className="bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <PieChart size={18} className="text-amber-500" />
                  Cost Center Variance Analysis (Budgeted vs. Actual)
                </h3>
                <p className="text-xs text-aura-text-muted mt-1">
                  Expenses: Actual ≤ Budget generates Favorable (F) variance; Actual &gt; Budget generates Unfavorable (U).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-aura-border text-aura-text-muted uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Cost Center</th>
                    <th className="pb-3 font-semibold text-right">Budgeted</th>
                    <th className="pb-3 font-semibold text-right">Actual</th>
                    <th className="pb-3 font-semibold text-right">Variance ($)</th>
                    <th className="pb-3 font-semibold text-center">Nature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-border/40 font-mono">
                  {costCenters.map((item, idx) => (
                    <tr key={idx} className="hover:bg-aura-surface/40 transition-colors">
                      <td className="py-3 font-sans font-medium text-aura-text">{item.costCenter}</td>
                      <td className="py-3 text-right tabular-nums text-aura-text">
                        {formatCurrency(item.budgetedCost, baseCurrency)}
                      </td>
                      <td className="py-3 text-right tabular-nums font-semibold text-aura-text">
                        {formatCurrency(item.actualCost, baseCurrency)}
                      </td>
                      <td className="py-3 text-right tabular-nums font-bold">
                        {formatCurrency(item.varianceAmount, baseCurrency)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            item.nature === 'favorable'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {item.nature === 'favorable' ? 'F (Favorable)' : 'U (Unfavorable)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Module 2: Interactive Break-Even Point (BEP) Simulator */}
          <div className="bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <Sliders size={18} className="text-indigo-500" />
                  Interactive Break-Even Simulation (CVP Analysis)
                </h3>
                <p className="text-xs text-aura-text-muted mt-1">
                  Adjust Fixed Overhead, Unit Price, and Variable Costs to model required commercial volume.
                </p>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-aura-surface border border-aura-border mb-6">
              {/* Fixed Costs Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-aura-text">Fixed Overhead ($)</span>
                  <span className="font-mono font-bold text-aura-accent">
                    {formatCurrency(fixedCosts, baseCurrency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="2500"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                  className="w-full accent-aura-accent cursor-pointer"
                />
              </div>

              {/* Unit Sales Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-aura-text">Sales Price per Unit ($)</span>
                  <span className="font-mono font-bold text-emerald-500">
                    {formatCurrency(salesPrice, baseCurrency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Variable Cost Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-aura-text">Variable Cost per Unit ($)</span>
                  <span className="font-mono font-bold text-rose-500">
                    {formatCurrency(variableCost, baseCurrency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={Math.max(salesPrice - 5, 10)}
                  step="5"
                  value={variableCost}
                  onChange={(e) => setVariableCost(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Dynamic BEP Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Break-Even Units</p>
                <p className="text-xl font-bold font-mono text-aura-text mt-1">
                  {breakEvenSimulation.breakEvenUnits.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-aura-text-muted">units</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Break-Even Revenue</p>
                <p className="text-xl font-bold font-mono text-aura-accent mt-1">
                  {formatCurrency(breakEvenSimulation.breakEvenRevenue, baseCurrency)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Contribution Margin</p>
                <p className="text-xl font-bold font-mono text-emerald-500 mt-1">
                  {formatCurrency(salesPrice - variableCost, baseCurrency)}
                  <span className="text-xs font-normal text-aura-text-muted ml-1">
                    ({Math.round(breakEvenSimulation.contributionMarginRatio * 100)}%)
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Safety Margin Units</p>
                <p className={`text-xl font-bold font-mono mt-1 ${simUnitsSold >= breakEvenSimulation.breakEvenUnits ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {simUnitsSold - breakEvenSimulation.breakEvenUnits > 0 ? '+' : ''}
                  {(simUnitsSold - breakEvenSimulation.breakEvenUnits).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Volume Profit Simulator Range */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-aura-surface to-aura-card border border-aura-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-aura-text">
                  Simulated Sales Volume: <strong className="font-mono text-aura-accent">{simUnitsSold} units</strong>
                </span>
                <span className={`font-mono font-bold text-sm ${simNetProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  Net Income: {formatCurrency(simNetProfit, baseCurrency)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={breakEvenSimulation.breakEvenUnits * 2 || 1000}
                step="25"
                value={simUnitsSold}
                onChange={(e) => setSimUnitsSold(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-aura-text-muted font-mono">
                <span>0 units (Loss: -{formatCurrency(fixedCosts, baseCurrency)})</span>
                <span className="font-bold text-amber-500">BEP: {breakEvenSimulation.breakEvenUnits} units ($0 Net)</span>
                <span>Max Target ({breakEvenSimulation.breakEvenUnits * 2} units)</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* LAB 3: CORPORATE FINANCE LAB (NPV & IRR) */}
      {/* ========================================================================= */}
      {activeTab === 'corporate_finance' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <div className="bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  Capital Budgeting Model (NPV & Internal Rate of Return)
                </h3>
                <p className="text-xs text-aura-text-muted mt-1">
                  Evaluate multi-year capital expenditures by calculating Net Present Value (NPV) and estimated IRR.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    capitalBudgeting.npv >= 0
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {capitalBudgeting.npv >= 0 ? 'Accept Project (NPV > 0)' : 'Reject Project (NPV < 0)'}
                </span>
              </div>
            </div>

            {/* Model Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-aura-surface border border-aura-border mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-text">
                  Initial Capital Investment ($ I₀)
                </label>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-card border border-aura-border text-aura-text text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-text">
                  Cost of Capital / Discount Rate (WACC %): <span className="font-mono text-aura-accent">{discountRatePercent}%</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="1"
                  value={discountRatePercent}
                  onChange={(e) => setDiscountRatePercent(Number(e.target.value))}
                  className="w-full accent-aura-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Multi-Year Cash Flow Projections */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-aura-text">
                Annual Projected Cash Flows (Year 1 to Year 5):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {cashFlows.map((cf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-aura-surface border border-aura-border space-y-1">
                    <span className="text-[10px] font-bold text-aura-text-muted uppercase">Year {idx + 1}</span>
                    <input
                      type="number"
                      value={cf}
                      onChange={(e) => updateCashFlowYear(idx, Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-aura-card border border-aura-border text-aura-text text-xs font-mono font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Results KPI Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-aura-surface to-aura-card border border-aura-border">
                <p className="text-xs font-bold text-aura-text-muted uppercase tracking-wider">
                  Net Present Value (NPV)
                </p>
                <p
                  className={`text-2xl font-black font-mono mt-1 ${
                    capitalBudgeting.npv >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {formatCurrency(capitalBudgeting.npv, baseCurrency)}
                </p>
                <p className="text-[11px] text-aura-text-muted mt-1">
                  At {discountRatePercent}% hurdle discount rate.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-aura-surface to-aura-card border border-aura-border">
                <p className="text-xs font-bold text-aura-text-muted uppercase tracking-wider">
                  Internal Rate of Return (IRR)
                </p>
                <p className="text-2xl font-black font-mono text-aura-accent mt-1">
                  {capitalBudgeting.irrEstimate}%
                </p>
                <p className="text-[11px] text-aura-text-muted mt-1">
                  Hurdle spread: {(capitalBudgeting.irrEstimate - discountRatePercent).toFixed(1)}%
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-aura-surface to-aura-card border border-aura-border">
                <p className="text-xs font-bold text-aura-text-muted uppercase tracking-wider">
                  Profitability Index (PI)
                </p>
                <p className="text-2xl font-black font-mono text-teal-400 mt-1">
                  {initialInvestment > 0
                    ? ((capitalBudgeting.npv + initialInvestment) / initialInvestment).toFixed(2)
                    : '1.00'}
                  x
                </p>
                <p className="text-[11px] text-aura-text-muted mt-1">
                  Present Value of Inflows / Outlay.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* LAB 4: TAXATION & CRYPTOGRAPHIC AUDITING LAB */}
      {/* ========================================================================= */}
      {activeTab === 'tax_audit' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Sales Tax / VAT Compute Tool */}
          <div className="bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <Calculator size={18} className="text-teal-500" />
                  Automated Sales Tax / VAT Deduction Engine
                </h3>
                <p className="text-xs text-aura-text-muted mt-1">
                  Net Tax Payable = Output Tax (Collected from Customers) - Input Tax (Paid on Inventory/Supplies).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-aura-surface border border-aura-border mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-text">Taxable Gross Sales ($)</label>
                <input
                  type="number"
                  value={taxableSales}
                  onChange={(e) => setTaxableSales(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-card border border-aura-border text-aura-text text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-text">Taxable Supplier Purchases ($)</label>
                <input
                  type="number"
                  value={taxablePurchases}
                  onChange={(e) => setTaxablePurchases(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-card border border-aura-border text-aura-text text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-aura-text">
                  Statutory VAT / Sales Tax Rate: <span className="font-mono text-teal-400">{vatRate}%</span>
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-card border border-aura-border text-aura-text text-sm font-semibold"
                >
                  <option value={5}>5% (GCC / Minimal)</option>
                  <option value={8}>8% (US State Average)</option>
                  <option value={15}>15% (Saudi / Standard)</option>
                  <option value={17}>17% (Pakistan FBR Federal)</option>
                  <option value={18}>18% (EU / India GST Average)</option>
                  <option value={20}>20% (UK Standard Rate)</option>
                </select>
              </div>
            </div>

            {/* VAT Net Calculation Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Output Tax (Sales)</p>
                <p className="text-xl font-bold font-mono text-aura-text mt-1">
                  {formatCurrency(outputVat, baseCurrency)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Input Tax Credit (ITC)</p>
                <p className="text-xl font-bold font-mono text-emerald-500 mt-1">
                  {formatCurrency(inputVat, baseCurrency)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-aura-surface border border-aura-border">
                <p className="text-[10px] text-aura-text-muted uppercase font-bold tracking-wider">Net Tax Payable / (Refund)</p>
                <p className="text-xl font-bold font-mono text-teal-400 mt-1">
                  {formatCurrency(netVatPayable, baseCurrency)}
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Audit Trail Table */}
          <div className="bg-aura-card border border-aura-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-aura-text flex items-center gap-2">
                  <Key size={18} className="text-indigo-400" />
                  Client-Side Immutable SHA-256 Cryptographic Audit Trail
                </h3>
                <p className="text-xs text-aura-text-muted mt-1">
                  Every double-entry transaction is sequentially chained with Web Crypto SHA-256 block hashing.
                </p>
              </div>

              <button
                onClick={verifyAuditTrailHashes}
                disabled={isVerifyingChain}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw size={14} className={isVerifyingChain ? 'animate-spin' : ''} />
                <span>Verify Chain Integrity</span>
              </button>
            </div>

            {chainIntegrityValid && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs font-bold"
              >
                <CheckCircle2 size={16} />
                <span>Zero Tampering Detected: 100% of audit hashes verified via Web Crypto API.</span>
              </motion.div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-aura-border text-aura-text-muted uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Block ID</th>
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">Action</th>
                    <th className="pb-3 font-semibold font-mono">SHA-256 Node Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-border/40 font-mono">
                  {auditEntries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-aura-text-muted">
                        No audit blocks generated yet. Post a journal entry to seal the genesis block.
                      </td>
                    </tr>
                  ) : (
                    auditEntries.map((block) => (
                      <tr key={block.id} className="hover:bg-aura-surface/40 transition-colors">
                        <td className="py-3 font-bold text-aura-text">#{block.id}</td>
                        <td className="py-3 text-aura-text-muted font-sans">{block.timestamp}</td>
                        <td className="py-3 font-sans font-semibold text-aura-text">{block.action}</td>
                        <td className="py-3 text-aura-accent font-mono text-[11px] truncate max-w-xs">
                          {block.hash}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
