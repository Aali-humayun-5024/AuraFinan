// AuraFinance OS — Universal Single-Source-of-Truth (SSOT) Reconciliation Types
// Strictly enforces The Five Mathematical Laws of Coherence across the entire platform

export interface UnifiedFinancialState {
  // 1. LIQUIDITY & TOTALS (Overview, Cash Flow, Personal Flow, Ledger)
  liquidity: {
    totalInflows: number;       // Sum of all credits to 4000s (Sales, Consulting, Yield)
    totalOutflows: number;      // Sum of all debits to 5000s (Expenses)
    netPosition: number;        // Inflows - Outflows
    liquidCash: number;         // Balance of 1010 (Cash) + 1020 (Bank)
    totalAssets: number;        // Liquid cash + Commodities (1060) + IOUs Owed to Me (1030)
    totalLiabilities: number;   // AP (2010) + IOUs I Owe Others
    netWorth: number;           // Total Assets - Total Liabilities
    // Backward compatibility aliases
    openingBalance24h: number;
    closingBalance: number;
    currency: string;
  };

  // 2. 50/30/20 EQUILIBRIUM (Overview, Personal Flow, Impulse Interceptor)
  buckets: {
    needsTotal: number;
    needsPercentage: number;
    wantsTotal: number;
    wantsPercentage: number;
    savingsTotal: number;
    savingsPercentage: number;
    remainingWantsBudget: number; // Max(0, (0.30 * Inflows) - wantsTotal)
    isWantsBreached: boolean;
  };
  buckets503020: {
    needsTotal: number;
    needsPercentage: number;
    wantsTotal: number;
    wantsPercentage: number;
    savingsTotal: number;
    savingsPercentage: number;
    remainingWantsBudget: number;
    isWantsBreached: boolean;
  };

  // 3. DOUBLE-ENTRY LEDGER STATE (General Ledger, Trial Balance, Academic Suite)
  ledger: {
    totalDebits: number;
    totalCredits: number;
    variance: number;
    isBalanced: boolean;
    accountBalances: Record<string, number>; // code -> currentBalance
  };
  ledgerBalances: {
    totalDebits: number;
    totalCredits: number;
    variance: number;
    isBalanced: boolean;
    accountBalances: Record<string, number>;
  };

  // 4. COMMODITIES HOLDINGS (Overview Bullion Card, Settings Vault)
  commodities: {
    goldGrams: number;
    goldTolas: number;
    goldValuation: number;
    silverValuation: number;
    totalBullionValue: number;
    // Backward compatibility aliases
    totalGoldValue: number;
    totalSilverValue: number;
    totalPlatinumValue: number;
    totalPreciousMetalsValue: number;
    holdingsWeightGrams: number;
  };

  // 5. P2P & DEBTS (P2P Bill Splitter, Overview Debt Card)
  ious: {
    owedToMe: number;
    iOwe: number;
    netIOUPosition: number;
    // Backward compatibility aliases
    totalOwedToMe: number;
    totalIOweOthers: number;
  };

  // 6. DYNAMIC SLIDER BASELINES (Time Machine, Academic Lab, Impulse Interceptor)
  sliderBaselines: {
    timeMachineStartingPrincipal: number; // Equals liquidCash
    timeMachineDefaultMonthlyYield: number; // Equals actual average monthly savings
    academicBudgetFixedCosts: number;    // Real 5010/5040 rent & utility averages
    academicBudgetVariableCosts: number; // Real 5020 food & dining averages
  };

  // 7. BALANCE SHEET & AUDIT IDENTITY
  netWorth: {
    totalAssets: number;
    totalLiabilities: number;
    netWorthTotal: number;
  };
  meta: {
    lastReconciledTimestamp: string;
    baseCurrency: string;
    isSystemBalanced: boolean;
    checksumSHA256: string;
  };
}

export type CoherentFinancialState = UnifiedFinancialState;
