// AuraFinance OS — Chart of Accounts & General Ledger Seeder
import { ledgerDb } from './ledgerSchema';
import type { AccountHeading, GeneralJournalEntry } from '../types/accounting';
import type { CashFlowRecord } from '../types/cashflow';

export const STANDARD_CHART_OF_ACCOUNTS: AccountHeading[] = [
  // ─── Assets (1000s) — Normal Balance: Debit ───
  { code: '1010', name: 'Cash on Hand', category: 'asset', normalBalance: 'debit', currentBalance: 12500, description: 'Petty cash and liquid currency reserves' },
  { code: '1020', name: 'Bank Operating Account', category: 'asset', normalBalance: 'debit', currentBalance: 48600, description: 'Primary commercial checking and treasury' },
  { code: '1030', name: 'Accounts Receivable', category: 'asset', normalBalance: 'debit', currentBalance: 14200, description: 'Client invoices billed and awaiting settlement' },
  { code: '1040', name: 'Inventory / Stock', category: 'asset', normalBalance: 'debit', currentBalance: 9800, description: 'Commercial goods held for sale and distribution' },
  { code: '1050', name: 'Prepaid Expenses', category: 'asset', normalBalance: 'debit', currentBalance: 3200, description: 'Advance payments for insurance and cloud hosting' },
  { code: '1060', name: 'Precious Metals / Bullion', category: 'asset', normalBalance: 'debit', currentBalance: 0, description: 'Physical gold, silver, and platinum bullion reserves' },

  // ─── Liabilities (2000s) — Normal Balance: Credit ───
  { code: '2010', name: 'Accounts Payable', category: 'liability', normalBalance: 'credit', currentBalance: 8400, description: 'Vendor bills and supplier trade liabilities' },
  { code: '2020', name: 'Short-Term Notes Payable', category: 'liability', normalBalance: 'credit', currentBalance: 12000, description: 'Working capital bank facility due within 12 months' },
  { code: '2030', name: 'Sales Tax / VAT Payable', category: 'liability', normalBalance: 'credit', currentBalance: 1950, description: 'Collected consumption tax payable to revenue authority' },

  // ─── Equity (3000s) — Normal Balance: Credit ───
  { code: '3010', name: "Owner's Capital", category: 'equity', normalBalance: 'credit', currentBalance: 50000, description: 'Initial founder equity and paid-in capital' },
  { code: '3020', name: 'Retained Earnings', category: 'equity', normalBalance: 'credit', currentBalance: 10450, description: 'Cumulative undistributed operating surpluses' },

  // ─── Revenue (4000s) — Normal Balance: Credit ───
  { code: '4010', name: 'Sales / Consulting Revenue', category: 'revenue', normalBalance: 'credit', currentBalance: 18500, description: 'Gross revenue from services and software contracts' },
  { code: '4020', name: 'Interest Income', category: 'revenue', normalBalance: 'credit', currentBalance: 450, description: 'Yield earned on treasury bank deposits' },

  // ─── Expenses (5000s) — Normal Balance: Debit ───
  { code: '5010', name: 'Cost of Goods Sold (COGS)', category: 'expense', normalBalance: 'debit', currentBalance: 4200, description: 'Direct procurement and fulfillment costs' },
  { code: '5020', name: 'Food & Dining Expense', category: 'expense', normalBalance: 'debit', currentBalance: 1350, description: 'Business hospitality and client meal expenses' },
  { code: '5030', name: 'Office Supplies & SaaS', category: 'expense', normalBalance: 'debit', currentBalance: 2400, description: 'Workstation hardware, licenses, and productivity tools' },
  { code: '5040', name: 'Utilities & Living', category: 'expense', normalBalance: 'debit', currentBalance: 3100, description: 'Electricity, fiber internet, and workspace lease' },
  { code: '5050', name: 'Travel & Transit', category: 'expense', normalBalance: 'debit', currentBalance: 1850, description: 'Rideshare, flights, and logistics mobility' },
];

export const INITIAL_JOURNAL_ENTRIES: GeneralJournalEntry[] = [
  {
    entryNumber: 'JE-2026-0001',
    date: '2026-09-01',
    narration: 'Initial equity injection from founder via bank wire transfer',
    isBalanced: true,
    source: 'manual',
    createdAt: new Date('2026-09-01T09:00:00Z').toISOString(),
    lines: [
      { accountId: '1020', accountName: 'Bank Operating Account', debit: 50000, credit: 0 },
      { accountId: '3010', accountName: "Owner's Capital", debit: 0, credit: 50000 },
    ],
  },
  {
    entryNumber: 'JE-2026-0002',
    date: '2026-09-05',
    narration: 'Enterprise client software delivery retainer payment received',
    isBalanced: true,
    source: 'manual',
    createdAt: new Date('2026-09-05T11:30:00Z').toISOString(),
    lines: [
      { accountId: '1020', accountName: 'Bank Operating Account', debit: 18500, credit: 0 },
      { accountId: '4010', accountName: 'Sales / Consulting Revenue', debit: 0, credit: 18500 },
    ],
  },
  {
    entryNumber: 'JE-2026-0003',
    date: '2026-09-08',
    narration: 'Bulk procurement of retail trade inventory on vendor credit term',
    isBalanced: true,
    source: 'manual',
    createdAt: new Date('2026-09-08T14:15:00Z').toISOString(),
    lines: [
      { accountId: '1040', accountName: 'Inventory / Stock', debit: 9800, credit: 0 },
      { accountId: '2010', accountName: 'Accounts Payable', debit: 0, credit: 9800 },
    ],
  },
  {
    entryNumber: 'JE-2026-0004',
    date: '2026-09-12',
    narration: 'Monthly AWS cloud hosting, GitHub Copilot, and Figma seats invoice',
    isBalanced: true,
    source: 'ocr_scan',
    createdAt: new Date('2026-09-12T16:45:00Z').toISOString(),
    lines: [
      { accountId: '5030', accountName: 'Office Supplies & SaaS', debit: 2400, credit: 0 },
      { accountId: '1020', accountName: 'Bank Operating Account', debit: 0, credit: 2400 },
    ],
  },
  {
    entryNumber: 'JE-2026-0005',
    date: '2026-09-16',
    narration: 'Fiber internet, electricity tariff, and co-working workspace lease',
    isBalanced: true,
    source: 'voice_assistant',
    createdAt: new Date('2026-09-16T10:00:00Z').toISOString(),
    lines: [
      { accountId: '5040', accountName: 'Utilities & Living', debit: 3100, credit: 0 },
      { accountId: '1010', accountName: 'Cash on Hand', debit: 0, credit: 3100 },
    ],
  },
  {
    entryNumber: 'JE-2026-0006',
    date: '2026-09-20',
    narration: 'Client dinner at Monal with sales tax itemization',
    isBalanced: true,
    source: 'ocr_scan',
    createdAt: new Date('2026-09-20T21:20:00Z').toISOString(),
    lines: [
      { accountId: '5020', accountName: 'Food & Dining Expense', debit: 1350, credit: 0 },
      { accountId: '2030', accountName: 'Sales Tax / VAT Payable', debit: 0, credit: 150 },
      { accountId: '1010', accountName: 'Cash on Hand', debit: 0, credit: 1200 },
    ],
  },
];

export const INITIAL_CASH_FLOWS: CashFlowRecord[] = [
  {
    date: '2026-09-01',
    type: 'inflow',
    subCategory: 'capital_investment',
    amount: 50000,
    currency: 'USD',
    description: "Founder Equity Injection",
  },
  {
    date: '2026-09-05',
    type: 'inflow',
    subCategory: 'operating_sales',
    amount: 18500,
    currency: 'USD',
    description: "Enterprise Software Retainer Payout",
  },
  {
    date: '2026-09-10',
    type: 'outflow',
    subCategory: 'supplier_inventory',
    amount: 4200,
    currency: 'USD',
    description: "Direct Supplier Inventory Restock",
  },
  {
    date: '2026-09-12',
    type: 'outflow',
    subCategory: 'operating_expense',
    amount: 2400,
    currency: 'USD',
    description: "Cloud Architecture & Software Subscriptions",
  },
  {
    date: '2026-09-16',
    type: 'outflow',
    subCategory: 'operating_expense',
    amount: 3100,
    currency: 'USD',
    description: "Facility Utilities, Internet & Office Lease",
  },
  {
    date: '2026-09-18',
    type: 'outflow',
    subCategory: 'debt_amortization',
    amount: 1500,
    currency: 'USD',
    description: "Short-Term Working Capital Facility Principal Payment",
  },
  {
    date: '2026-09-22',
    type: 'outflow',
    subCategory: 'operating_expense',
    amount: 1850,
    currency: 'USD',
    description: "Client Summit Flight & Transit Mobility",
  },
];

let isSeeding = false;

export async function seedAccountingDatabaseIfEmpty(): Promise<boolean> {
  if (isSeeding) return false;
  isSeeding = true;
  try {
    const count = await ledgerDb.accounts.count();
    if (count > 0) {
      isSeeding = false;
      return false; // Already seeded
    }

    await ledgerDb.transaction('rw', [ledgerDb.accounts, ledgerDb.journalEntries, ledgerDb.cashFlowRecords, ledgerDb.auditTrail], async () => {
      // 1. Seed Chart of Accounts with bulkPut (idempotent upsert)
      await ledgerDb.accounts.bulkPut(STANDARD_CHART_OF_ACCOUNTS);

      // 2. Seed Journal Entries
      const entryCount = await ledgerDb.journalEntries.count();
      if (entryCount === 0) {
        await ledgerDb.journalEntries.bulkAdd(INITIAL_JOURNAL_ENTRIES);
      }

      // 3. Seed Cash Flow Records
      const flowCount = await ledgerDb.cashFlowRecords.count();
      if (flowCount === 0) {
        await ledgerDb.cashFlowRecords.bulkAdd(INITIAL_CASH_FLOWS);
      }

      // 4. Seed Initial Cryptographic Audit Trail Node
      const auditCount = await ledgerDb.auditTrail.count();
      if (auditCount === 0) {
        await ledgerDb.auditTrail.add({
          timestamp: new Date().toISOString(),
          action: 'GENESIS_CHART_OF_ACCOUNTS_INITIALIZED',
          hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
          data: {
            accountsCount: STANDARD_CHART_OF_ACCOUNTS.length,
            initialEntries: INITIAL_JOURNAL_ENTRIES.length,
            version: 'SRS_V2.0_ACADEMIC_CPA',
          },
        });
      }
    });

    return true;
  } catch (err) {
    console.warn('Accounting DB seed handled:', err);
    return false;
  } finally {
    isSeeding = false;
  }
}
