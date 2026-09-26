export interface TranslationDictionary {
  metadata: {
    code: string;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    fontFamily: string;
  };
  navigation: {
    overview: string;
    cashflow: string;
    generalLedger: string;
    academicSuite: string;
    bazaarSentinel: string;
    settings: string;
    auditLog: string;
  };
  header: {
    searchPlaceholder: string;
    wakeWordActive: string;
    healthScoreTooltip: string;
    judgePersonaSelect: string;
    themeToggleLight: string;
    themeToggleDark: string;
    downloadPdfStatement: string;
  };
  kpiCards: {
    netCashPosition: string;
    inflowVelocity: string;
    outflowBurn: string;
    capitalEquilibrium: string;
    benchmarkComparison: string;
    needsLabel: string;
    wantsLabel: string;
    savingsLabel: string;
    wantsAlertMessage: string;
  };
  cashflow: {
    waterfallTitle: string;
    startingBalance: string;
    inflowsTitle: string;
    outflowsTitle: string;
    endingBalance: string;
    operatingSales: string;
    capitalInvestment: string;
    financingLoan: string;
    operatingExpenses: string;
    supplierPayables: string;
    debtAmortization: string;
  };
  generalLedger: {
    journalTitle: string;
    trialBalanceTitle: string;
    postEntryButton: string;
    addLineItemButton: string;
    dateColumn: string;
    accountHeadingColumn: string;
    debitColumn: string;
    creditColumn: string;
    narrationColumn: string;
    narrationPlaceholder: string;
    balancedBadge: string;
    unbalancedBadge: string;
    varianceNotice: string;
    totalDebits: string;
    totalCredits: string;
  };
  academicSuite: {
    financialAccountingTab: string;
    costManagementTab: string;
    corporateFinanceTab: string;
    taxationAuditingTab: string;
    varianceAnalysisTitle: string;
    favorableIndicator: string;
    unfavorableIndicator: string;
    breakEvenPointTitle: string;
    npvTitle: string;
    auditHashTitle: string;
  };
  bazaarSentinel: {
    mandiPriceTitle: string;
    bargainBadge: string;
    fairPriceBadge: string;
    gougedBadge: string;
    stapleItem: string;
    unitPrice: string;
    cityAverage: string;
  };
  iouSettler: {
    youAreOwed: string;
    youOwe: string;
    whatsappReminderButton: string;
    markSettledButton: string;
    friendNamePlaceholder: string;
    billSplitTitle: string;
    reminderMessageTemplate: string;
  };
  aiCopilot: {
    orbListening: string;
    orbAnalyzing: string;
    orbAdvising: string;
    mentorModeTab: string;
    roastModeTab: string;
    vampireHunterTitle: string;
    cancelDraftButton: string;
    impulseCheckTitle: string;
    walkAwayKarma: string;
  };
  modals: {
    omniInputTitle: string;
    dropReceiptText: string;
    speakVoiceText: string;
    confirmButton: string;
    cancelButton: string;
    closeButton: string;
    saveSuccessNotice: string;
  };
}

export const en: TranslationDictionary = {
  metadata: {
    code: 'en',
    name: 'English',
    nativeName: 'English (US)',
    direction: 'ltr',
    fontFamily: 'inherit',
  },
  navigation: {
    overview: 'Overview',
    cashflow: 'Cash Flow',
    generalLedger: 'General Ledger',
    academicSuite: 'Academic Suite',
    bazaarSentinel: 'Bazaar Sentinel',
    settings: 'Settings & Vault',
    auditLog: 'Audit Log',
  },
  header: {
    searchPlaceholder: 'Search transactions, prompt AI, or press ⌘K...',
    wakeWordActive: 'Voice Assistant Active',
    healthScoreTooltip: 'Real-time financial health score & savings rate',
    judgePersonaSelect: 'Select Experience Persona',
    themeToggleLight: 'Light Mode',
    themeToggleDark: 'Dark Mode',
    downloadPdfStatement: 'Download 24h Bank Statement',
  },
  kpiCards: {
    netCashPosition: 'Net Cash Position',
    inflowVelocity: 'Inflow Velocity',
    outflowBurn: 'Outflow Burn Rate',
    capitalEquilibrium: 'Capital Equilibrium (50/30/20)',
    benchmarkComparison: 'vs. Previous Period',
    needsLabel: 'Needs (50%)',
    wantsLabel: 'Wants (30%)',
    savingsLabel: 'Savings (20%)',
    wantsAlertMessage: 'Warning: Discretionary spend exceeds 30% threshold!',
  },
  cashflow: {
    waterfallTitle: 'Intraday Liquidity Waterfall',
    startingBalance: 'Opening Cash Balance',
    inflowsTitle: 'Total Operational Inflows',
    outflowsTitle: 'Total Operational Outflows',
    endingBalance: 'Closing Cash Balance',
    operatingSales: 'Client Invoices & Sales',
    capitalInvestment: 'Capital Injection & Equity',
    financingLoan: 'Financing & Credit Line',
    operatingExpenses: 'Operating Expenses & OPEX',
    supplierPayables: 'Vendor & Supplier Payables',
    debtAmortization: 'Debt & Interest Amortization',
  },
  generalLedger: {
    journalTitle: 'Double-Entry General Journal',
    trialBalanceTitle: 'Unadjusted Trial Balance',
    postEntryButton: 'Post Journal Entry',
    addLineItemButton: 'Add Split Line',
    dateColumn: 'Posting Date',
    accountHeadingColumn: 'Account Title & Code',
    debitColumn: 'Debit ($DR)',
    creditColumn: 'Credit ($CR)',
    narrationColumn: 'Narration & Memo',
    narrationPlaceholder: 'Enter transaction business rationale...',
    balancedBadge: 'Balanced (Variance $0.00)',
    unbalancedBadge: 'Out of Balance',
    varianceNotice: 'Debit/Credit Imbalance:',
    totalDebits: 'Total Debits',
    totalCredits: 'Total Credits',
  },
  academicSuite: {
    financialAccountingTab: 'Financial Accounting (GAAP)',
    costManagementTab: 'Managerial & Cost Accounting',
    corporateFinanceTab: 'Corporate Finance & Valuation',
    taxationAuditingTab: 'Taxation & Audit Verification',
    varianceAnalysisTitle: 'Standard Costing Variance Analysis',
    favorableIndicator: 'Favorable Variance (F)',
    unfavorableIndicator: 'Unfavorable Variance (U)',
    breakEvenPointTitle: 'CVP Break-Even Equilibrium',
    npvTitle: 'Discounted DCF / Net Present Value',
    auditHashTitle: 'Cryptographic Audit Trail SHA-256',
  },
  bazaarSentinel: {
    mandiPriceTitle: 'Commodity Price Sentinel & Mandi Index',
    bargainBadge: 'Great Bargain',
    fairPriceBadge: 'Fair Market Price',
    gougedBadge: 'Price Gouging Alert',
    stapleItem: 'Essential Commodity',
    unitPrice: 'Quoted Unit Rate',
    cityAverage: 'Official Benchmark',
  },
  iouSettler: {
    youAreOwed: 'Receivable from Friends',
    youOwe: 'Payable to Friends',
    whatsappReminderButton: 'Send WhatsApp Reminder',
    markSettledButton: 'Mark Settle (Zero Balance)',
    friendNamePlaceholder: "Friend or peer's name...",
    billSplitTitle: 'Peer-to-Peer Bill Splitter',
    reminderMessageTemplate: 'Salam! Friendly reminder regarding your share of',
  },
  aiCopilot: {
    orbListening: 'Aura is listening...',
    orbAnalyzing: 'Synthesizing fiscal advice...',
    orbAdvising: 'Active Wealth Advisory',
    mentorModeTab: 'Wealth Mentor',
    roastModeTab: 'Brutal Roast',
    vampireHunterTitle: 'Subscription Vampire Hunter',
    cancelDraftButton: 'Generate Cancellation Notice',
    impulseCheckTitle: 'Impulse Spending Interceptor',
    walkAwayKarma: 'Karma Points Earned for Restraint',
  },
  modals: {
    omniInputTitle: 'Omni Universal Transaction Engine',
    dropReceiptText: 'Drop receipt image here or click to browse',
    speakVoiceText: 'Hold to speak voice command...',
    confirmButton: 'Commit to Vault',
    cancelButton: 'Discard Draft',
    closeButton: 'Close Window',
    saveSuccessNotice: 'Ledger securely updated in local vault',
  },
};
