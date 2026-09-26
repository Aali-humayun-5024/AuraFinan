// AuraFinance OS — Academic Suite & CPA Curriculum Types
export type CoreSubject = 'financial_accounting' | 'cost_management' | 'corporate_finance' | 'tax_audit';

export interface VarianceCalculation {
  costCenter: string;
  budgetedCost: number;
  actualCost: number;
  varianceAmount: number;
  nature: 'favorable' | 'unfavorable'; // Favorable if actual <= budget for expenses
}

export interface BreakEvenSimulation {
  fixedCosts: number;
  salesPricePerUnit: number;
  variableCostPerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMarginRatio: number;
}

export interface CapitalBudgetingModel {
  initialInvestment: number;
  discountRate: number;      // e.g., 0.10 for 10%
  cashFlows: number[];       // Year 1..N
  npv: number;
  irrEstimate: number;
}
