// AuraFinance OS — CPA Financial Statement & Trial Balance Generator
import { ledgerDb } from '../db/ledgerSchema';
import type { AccountHeading, TrialBalanceRow, FinancialStatements } from '../types/accounting';

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  variance: number;
}

/**
 * Computes Trial Balance from live Chart of Accounts balances
 */
export async function generateTrialBalance(): Promise<TrialBalanceReport> {
  const accounts = await ledgerDb.accounts.toArray();
  const rows: TrialBalanceRow[] = [];
  let totalDebits = 0;
  let totalCredits = 0;

  // Sort by Account Code ascending
  accounts.sort((a, b) => a.code.localeCompare(b.code));

  accounts.forEach((acc) => {
    let debitBalance = 0;
    let creditBalance = 0;

    if (acc.normalBalance === 'debit') {
      if (acc.currentBalance >= 0) {
        debitBalance = acc.currentBalance;
      } else {
        // Abnormal credit balance for a debit normal account
        creditBalance = Math.abs(acc.currentBalance);
      }
    } else {
      if (acc.currentBalance >= 0) {
        creditBalance = acc.currentBalance;
      } else {
        // Abnormal debit balance for a credit normal account
        debitBalance = Math.abs(acc.currentBalance);
      }
    }

    totalDebits += debitBalance;
    totalCredits += creditBalance;

    rows.push({
      accountCode: acc.code,
      accountName: acc.name,
      category: acc.category,
      debitBalance: Math.round(debitBalance * 100) / 100,
      creditBalance: Math.round(creditBalance * 100) / 100,
    });
  });

  const variance = Math.abs(totalDebits - totalCredits);
  const isBalanced = variance < 0.01;

  return {
    rows,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    isBalanced,
    variance: Math.round(variance * 100) / 100,
  };
}

/**
 * Generates Real-Time Financial Statements:
 * 1. Income Statement (Revenues, Expenses, Net Income)
 * 2. Balance Sheet (Assets, Liabilities, Equity with Ending Retained Earnings)
 */
export async function generateFinancialStatements(): Promise<FinancialStatements> {
  const accounts = await ledgerDb.accounts.toArray();

  const revenues: { name: string; amount: number }[] = [];
  let totalRevenue = 0;

  const expenses: { name: string; amount: number }[] = [];
  let totalExpenses = 0;

  const assets: { name: string; amount: number }[] = [];
  let totalAssets = 0;

  const liabilities: { name: string; amount: number }[] = [];
  let totalLiabilities = 0;

  const equity: { name: string; amount: number }[] = [];
  let initialEquity = 0;
  let initialRetainedEarnings = 0;

  accounts.forEach((acc) => {
    const bal = Math.round(acc.currentBalance * 100) / 100;
    switch (acc.category) {
      case 'revenue':
        revenues.push({ name: acc.name, amount: bal });
        totalRevenue += bal;
        break;
      case 'expense':
        expenses.push({ name: acc.name, amount: bal });
        totalExpenses += bal;
        break;
      case 'asset':
        assets.push({ name: acc.name, amount: bal });
        totalAssets += bal;
        break;
      case 'liability':
        liabilities.push({ name: acc.name, amount: bal });
        totalLiabilities += bal;
        break;
      case 'equity':
        if (acc.code === '3020') {
          initialRetainedEarnings += bal;
        } else {
          equity.push({ name: acc.name, amount: bal });
          initialEquity += bal;
        }
        break;
    }
  });

  const netIncome = Math.round((totalRevenue - totalExpenses) * 100) / 100;
  const retainedEarnings = Math.round((initialRetainedEarnings + netIncome) * 100) / 100;
  const totalEquity = Math.round((initialEquity + retainedEarnings) * 100) / 100;

  // The fundamental equation: Assets === Liabilities + Total Equity
  const isEquationBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.05;

  return {
    incomeStatement: {
      revenues,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      expenses,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netIncome,
    },
    balanceSheet: {
      assets,
      totalAssets: Math.round(totalAssets * 100) / 100,
      liabilities,
      totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      equity,
      retainedEarnings,
      totalEquity,
      isEquationBalanced,
    },
  };
}
