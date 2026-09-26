// AuraFinance OS — Double-Entry General Ledger & Accounting Types
export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';

export interface AccountHeading {
  code: string;               // e.g., "1010" Cash, "2010" AP
  name: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  currentBalance: number;     // Maintained dynamically from posted entries
  description?: string;
}

export interface JournalLineItem {
  accountId: string;          // Maps to AccountHeading.code
  accountName: string;
  debit: number;
  credit: number;
}

export interface GeneralJournalEntry {
  id?: number;
  entryNumber: string;        // e.g., "JE-2026-0001"
  date: string;               // ISO 8601 string (YYYY-MM-DD)
  narration: string;
  lines: JournalLineItem[];
  isBalanced: boolean;
  source: 'manual' | 'ocr_scan' | 'voice_assistant' | 'curriculum_lab';
  createdAt: string;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  debitBalance: number;
  creditBalance: number;
}

export interface FinancialStatements {
  incomeStatement: {
    revenues: { name: string; amount: number }[];
    totalRevenue: number;
    expenses: { name: string; amount: number }[];
    totalExpenses: number;
    netIncome: number;
  };
  balanceSheet: {
    assets: { name: string; amount: number }[];
    totalAssets: number;
    liabilities: { name: string; amount: number }[];
    totalLiabilities: number;
    equity: { name: string; amount: number }[];
    retainedEarnings: number;
    totalEquity: number;
    isEquationBalanced: boolean; // Assets === Liabilities + Equity
  };
}
