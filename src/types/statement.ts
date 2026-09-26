// AuraFinance OS — Statement Calculation & Line Item Interfaces

export interface StatementLineItem {
  timestamp: string;
  reference: string;
  narration: string;
  accounts: string;
  debit: number | null;
  credit: number | null;
}

export interface StatementGenerationParams {
  vaultName: string;
  accountHolder: string;
  baseCurrency: string;
}

export interface StatementSummary {
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  netVariance: number;
  windowStart: string;
  windowEnd: string;
  digestSHA256: string;
}
