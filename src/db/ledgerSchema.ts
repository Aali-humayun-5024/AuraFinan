// AuraFinance OS — General Ledger Dexie.js Database
import Dexie, { type Table } from 'dexie';
import type { AccountHeading, GeneralJournalEntry } from '../types/accounting';
import type { CashFlowRecord } from '../types/cashflow';

export class AuraLedgerDatabase extends Dexie {
  accounts!: Table<AccountHeading, string>;
  journalEntries!: Table<GeneralJournalEntry, number>;
  cashFlowRecords!: Table<CashFlowRecord, number>;
  auditTrail!: Table<{ id?: number; timestamp: string; action: string; hash: string; data: any }, number>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('AuraFinanceLedgerDB');
    this.version(2).stores({
      accounts: 'code, name, category, normalBalance',
      journalEntries: '++id, entryNumber, date, source, isBalanced',
      cashFlowRecords: '++id, date, type, subCategory',
      auditTrail: '++id, timestamp, action, hash',
      settings: 'key',
    });
  }
}

export const ledgerDb = new AuraLedgerDatabase();
