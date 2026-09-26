// AuraFinance OS — Cash Flow Engine & Waterfall Types
export type InflowSource = 'operating_sales' | 'capital_investment' | 'financing_loan';
export type OutflowDest = 'operating_expense' | 'supplier_inventory' | 'debt_amortization';

export interface CashFlowRecord {
  id?: number;
  date: string;
  type: 'inflow' | 'outflow';
  subCategory: InflowSource | OutflowDest;
  amount: number;
  currency: string;
  referenceEntryId?: number;  // Correlated Journal Entry ID
  description: string;
}

export interface CashFlowWaterfallNode {
  name: string;
  amount: number;
  runningTotal: number;
  type: 'start' | 'inflow' | 'outflow' | 'net';
}
