import type { AccountHeading, GeneralJournalEntry } from './accounting';
import type { CashFlowRecord } from './cashflow';
import type { IOUTransaction } from '../db/database';
import type { CommodityHolding } from './commodities';

export interface AuraVaultMetadata {
  schemaVersion: '2.0.0';
  exportedAt: string;          // ISO 8601 Timestamp
  systemBuild: string;          // e.g. "AuraOS-2026.09-Retina"
  platformCurrency: string;     // Base ISO Currency
  activeLanguage: string;       // Active locale code
  activePersona: string;        // Active persona identifier
  recordChecksumSHA256: string; // Integrity verification hash
}

export interface AuraMasterVaultJSON {
  metadata: AuraVaultMetadata;
  accounts: AccountHeading[];
  journalEntries: GeneralJournalEntry[];
  cashFlowRecords: CashFlowRecord[];
  ious: IOUTransaction[];
  goals: Array<{
    id?: number;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    icon: string;
  }>;
  subscriptions: Array<{
    id?: number;
    name: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    category: string;
    autoCancelDraft?: string;
  }>;
  customPersonas: Array<{
    id?: string;
    name: string;
    userRole: string;
    monthlyIncome: number;
    currency: string;
    lifestyleTier: string;
  }>;
  commodities?: CommodityHolding[];
  transactions?: Array<any>;
  settings: Record<string, any>;
}

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  summary?: {
    accountsCount: number;
    journalEntriesCount: number;
    balancedEntries: number;
    unbalancedEntries: number;
    cashFlowCount: number;
    iousCount: number;
    goalsCount?: number;
    commoditiesCount?: number;
    currency: string;
    activeLanguage: string;
    checksumMatch?: boolean;
  };
}
