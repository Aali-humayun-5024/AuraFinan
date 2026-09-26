// AuraFinance OS — Dynamic 50/30/20 Budget Allocation Engine
// Calculates real-time breakdown of Needs (50%), Wants (30%), Savings (20%)
// Computes variances against golden financial benchmarks and generates warning alerts

import type { Transaction } from '../db/database';
import { convertCurrency, type CurrencyCode } from './fxService';

export interface Budget503020Result {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;

  // Actual Amounts
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;

  // Actual Percentages (of Total Inflow)
  needsPct: number;
  wantsPct: number;
  savingsPct: number;

  // Target Ideal Amounts (50 / 30 / 20)
  targetNeedsAmount: number;
  targetWantsAmount: number;
  targetSavingsAmount: number;

  // Variances (Actual - Target)
  needsVariance: number;
  wantsVariance: number;
  savingsVariance: number;

  // Percentage Variances
  needsVariancePct: number;
  wantsVariancePct: number;
  savingsVariancePct: number;

  // Flags & Alerts
  isWantsOverBudget: boolean;
  wantsOverrunAmount: number;
  isNeedsOverBudget: boolean;
  isSavingsDeficit: boolean;
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  alertMessage: string | null;
  recommendations: string[];
}

export function calculate503020Budget(
  transactions: Transaction[],
  baseCurrency: CurrencyCode | string,
  fxRates: Record<string, number>,
  selectedMonth?: { year: number; month: number }
): Budget503020Result {
  const now = new Date();
  const targetYear = selectedMonth?.year ?? now.getFullYear();
  const targetMonth = selectedMonth?.month ?? now.getMonth();

  // Filter transactions for target month
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // Calculate Inflow
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates), 0);

  // Group Expenses by bucket
  let needsAmount = 0;
  let wantsAmount = 0;
  let directSavingsExpense = 0;

  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const converted = convertCurrency(t.amount, t.originalCurrency, baseCurrency, fxRates);
      if (t.bucket === 'needs') {
        needsAmount += converted;
      } else if (t.bucket === 'wants') {
        wantsAmount += converted;
      } else if (t.bucket === 'savings') {
        directSavingsExpense += converted;
      } else {
        // Fallback categorization if bucket not set
        needsAmount += converted;
      }
    });

  const totalExpenses = needsAmount + wantsAmount + directSavingsExpense;
  // Net savings is unspent income + intentional savings transfers
  const unspentSurplus = Math.max(0, totalIncome - (needsAmount + wantsAmount));
  const savingsAmount = directSavingsExpense + unspentSurplus;
  const netSavings = totalIncome - totalExpenses;

  // Benchmark Calculations (50 / 30 / 20 of Income, or standard fallback if zero income)
  const effectiveIncome = Math.max(totalIncome, totalExpenses, 1);
  const targetNeedsAmount = effectiveIncome * 0.5;
  const targetWantsAmount = effectiveIncome * 0.3;
  const targetSavingsAmount = effectiveIncome * 0.2;

  const needsPct = totalIncome > 0 ? (needsAmount / totalIncome) * 100 : 0;
  const wantsPct = totalIncome > 0 ? (wantsAmount / totalIncome) * 100 : 0;
  const savingsPct = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  const needsVariance = needsAmount - targetNeedsAmount;
  const wantsVariance = wantsAmount - targetWantsAmount;
  const savingsVariance = savingsAmount - targetSavingsAmount;

  const needsVariancePct = needsPct - 50;
  const wantsVariancePct = wantsPct - 30;
  const savingsVariancePct = savingsPct - 20;

  // Warnings
  const isWantsOverBudget = wantsPct > 30 || wantsAmount > targetWantsAmount;
  const wantsOverrunAmount = Math.max(0, wantsAmount - targetWantsAmount);
  const isNeedsOverBudget = needsPct > 50;
  const isSavingsDeficit = savingsPct < 20;

  // Grade calculation
  let healthGrade: Budget503020Result['healthGrade'] = 'B';
  if (savingsPct >= 25 && wantsPct <= 28 && needsPct <= 50) healthGrade = 'A+';
  else if (savingsPct >= 20 && wantsPct <= 30) healthGrade = 'A';
  else if (wantsPct <= 35 && savingsPct >= 10) healthGrade = 'B';
  else if (wantsPct <= 45 || savingsPct >= 5) healthGrade = 'C';
  else if (wantsPct > 45) healthGrade = 'D';
  else healthGrade = 'F';

  // Alert message
  let alertMessage: string | null = null;
  if (isWantsOverBudget && wantsOverrunAmount > 0) {
    alertMessage = `⚠️ Discretionary Overrun: Wants are consuming ${wantsPct.toFixed(1)}% of your income (exceeds the 30% golden rule). Audit dining and impulse purchases to reclaim surplus.`;
  } else if (isNeedsOverBudget) {
    alertMessage = `💡 High Fixed Costs: Essential needs account for ${needsPct.toFixed(1)}% of income (target: 50%). Consider auditing utility bills and grocery wholesale bulk-buying.`;
  }

  // Recommendations
  const recommendations: string[] = [];
  if (isWantsOverBudget) {
    recommendations.push(
      `Cap discretionary dining out and delivery for the next 7 days to eliminate the ${wantsOverrunAmount.toFixed(0)} ${baseCurrency} overrun.`
    );
  }
  if (savingsPct >= 20) {
    recommendations.push(
      `Outstanding wealth discipline! Your savings rate is ${savingsPct.toFixed(1)}%. Route this surplus into compound investments or debt payoff.`
    );
  } else {
    recommendations.push(
      `To reach the 20% savings benchmark, automate an instant transfer of ${(targetSavingsAmount - savingsAmount).toFixed(0)} ${baseCurrency} at the start of each month.`
    );
  }
  if (needsPct < 45 && totalIncome > 0) {
    recommendations.push(
      `Low baseline needs (${needsPct.toFixed(1)}%) give you massive financial runway. Take advantage by boosting emergency reserves.`
    );
  }

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    needsAmount,
    wantsAmount,
    savingsAmount,
    needsPct,
    wantsPct,
    savingsPct,
    targetNeedsAmount,
    targetWantsAmount,
    targetSavingsAmount,
    needsVariance,
    wantsVariance,
    savingsVariance,
    needsVariancePct,
    wantsVariancePct,
    savingsVariancePct,
    isWantsOverBudget,
    wantsOverrunAmount,
    isNeedsOverBudget,
    isSavingsDeficit,
    healthGrade,
    alertMessage,
    recommendations,
  };
}
