// AuraFinance OS — Universal Single-Source-of-Truth (SSOT) Reconciliation Types
// Strictly enforces The Five Mathematical Laws of Coherence across the entire platform

export interface CoherentFinancialState {
  meta: {
    lastReconciledTimestamp: string;
    baseCurrency: string;
    isSystemBalanced: boolean;
    checksumSHA256: string;
  };
  liquidity: {
    openingBalance24h: number;
    totalInflows: number;
    totalOutflows: number;
    netPosition: number;
    closingBalance: number;
    currency: string;
  };
  buckets503020: {
    needsTotal: number;
    needsPercentage: number;
    wantsTotal: number;
    wantsPercentage: number;
    savingsTotal: number;
    savingsPercentage: number;
    isWantsBreached: boolean;
  };
  ledgerBalances: {
    totalDebits: number;
    totalCredits: number;
    variance: number;
    accountBalances: Record<string, number>; // Keyed by account code: "1010", "2010", etc.
  };
  commodities: {
    totalGoldValue: number;
    totalSilverValue: number;
    totalPlatinumValue: number;
    totalPreciousMetalsValue: number;
    holdingsWeightGrams: number;
  };
  ious: {
    totalOwedToMe: number;
    totalIOweOthers: number;
    netIOUPosition: number;
  };
  netWorth: {
    totalAssets: number;
    totalLiabilities: number;
    netWorthTotal: number;
  };
}
