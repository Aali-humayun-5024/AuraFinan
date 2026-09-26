// AuraFinance OS — Dexie.js Database Schema
import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  title: string;
  amount: number;
  originalCurrency: string;
  amountInUSD: number;
  type: 'income' | 'expense';
  bucket: 'needs' | 'wants' | 'savings';
  category: string;
  merchant?: string;
  date: string;
  isRecurring: boolean;
  receiptImage?: string;
  tags: string[];
  profileId?: string; // Multi-User support: 'household' | 'personal' | 'business' | custom user id
}

export interface FinancialGoal {
  id?: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  icon: string;
  profileId?: string;
}

export interface UserSettings {
  id?: number;
  baseCurrency: string;
  geminiApiKey?: string;
  aiPersona: 'mentor' | 'roast';
  monthlyIncomeTarget: number;
  isEncrypted: boolean;
  activePersona: 'student' | 'freelancer' | 'household' | 'clean' | 'custom';
  detectedCity?: string;
  familySize?: number;
}

export interface AuditLog {
  id?: number;
  timestamp: string;
  action: string;
  details: string;
  aiGenerated: boolean;
}

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  category: string;
  nextBillingDate: string;
  isActive: boolean;
  merchant?: string;
  profileId?: string;
  autoCancelDraft?: string;
}

export interface UserProfile {
  id: string; // 'household' | 'personal' | 'business' | 'family-1', etc.
  name: string;
  urduName: string;
  role: string; // 'Household / Ghar Ka Kharcha' | 'Personal Pocket' | 'Business' | 'Family Member'
  avatar: string; // emoji
  color: string;
  monthlyBudget?: number;
  isDefault?: boolean;
}

export interface IOUTransaction {
  id?: number;
  title: string;
  totalBill: number;
  myShare: number;
  friendName: string;
  friendPhone?: string; // with country code
  friendShare: number;
  currency: string;
  status: 'pending' | 'settled';
  createdAt: string; // ISO date
  settledAt?: string;
  direction: 'they_owe_me' | 'i_owe_them';
  category: string; // e.g. "Dining", "Groceries", "Uber/Taxi", "Rent", "Trip", "Other"
  notes?: string;
  profileId?: string;
}

export interface SentinelReport {
  id?: number;
  itemName: string;
  itemCategory: string;
  vendorName?: string;
  locationCity: string;
  quotedPrice: number;
  benchmarkPrice: number;
  currency: string;
  unit: string;
  priceDeltaPercent: number; // e.g. +22%
  status: 'fair' | 'moderate' | 'gouging';
  bargainSuggestion: string;
  timestamp: string;
}

export interface CustomPersonaProfile {
  id?: string;
  name: string;                // e.g. "Struggling Medical Resident", "Single Mom in Dubai", "Crypto Day Trader"
  avatarIcon: string;          // Emoji or Lucide icon key
  userRole: 'student' | 'early_career' | 'freelancer' | 'business_owner' | 'retiree' | 'custom';
  monthlyIncome: number;
  currency: string;            // USD, EUR, PKR, GBP, etc.
  lifestyleTier: 'frugal' | 'balanced' | 'lavish';
  primaryGoal: {
    title: string;
    targetAmount: number;
    timelineMonths: number;
  };
  biggestExpenseLeak: 'dining_out' | 'gadgets_tech' | 'rent_living' | 'shopping' | 'travel';
  culturalContext: string;     // Country code (PK, US, GB, AE, IN, JP, etc.)
  createdAt: string;
}

import type { CommodityHolding } from '../types/commodities';

export class AuraFinanceDB extends Dexie {
  transactions!: Table<Transaction>;
  goals!: Table<FinancialGoal>;
  settings!: Table<UserSettings>;
  auditLogs!: Table<AuditLog>;
  subscriptions!: Table<Subscription>;
  profiles!: Table<UserProfile, string>;
  ious!: Table<IOUTransaction>;
  sentinelReports!: Table<SentinelReport>;
  customPersonas!: Table<CustomPersonaProfile, string>;
  commodities!: Table<CommodityHolding, number>;

  constructor() {
    super('AuraFinanceOS');
    this.version(1).stores({
      transactions: '++id, type, bucket, category, date, merchant, isRecurring, originalCurrency',
      goals: '++id, category, deadline',
      settings: '++id',
      auditLogs: '++id, timestamp, aiGenerated',
      subscriptions: '++id, name, billingCycle, isActive',
    });
    this.version(2).stores({
      transactions: '++id, type, bucket, category, date, merchant, isRecurring, originalCurrency, profileId',
      goals: '++id, category, deadline, profileId',
      settings: '++id',
      auditLogs: '++id, timestamp, aiGenerated',
      subscriptions: '++id, name, billingCycle, isActive, profileId',
      profiles: 'id, name, role',
    });
    this.version(3).stores({
      transactions: '++id, type, bucket, category, date, merchant, isRecurring, originalCurrency, profileId',
      goals: '++id, category, deadline, profileId',
      settings: '++id',
      auditLogs: '++id, timestamp, aiGenerated',
      subscriptions: '++id, name, billingCycle, isActive, profileId',
      profiles: 'id, name, role',
      ious: '++id, friendName, status, direction, createdAt, category',
      sentinelReports: '++id, itemName, status, locationCity, timestamp',
    });
    this.version(4).stores({
      transactions: '++id, type, bucket, category, date, merchant, isRecurring, originalCurrency, profileId',
      goals: '++id, category, deadline, profileId',
      settings: '++id',
      auditLogs: '++id, timestamp, aiGenerated',
      subscriptions: '++id, name, billingCycle, isActive, profileId',
      profiles: 'id, name, role',
      ious: '++id, friendName, status, direction, createdAt, category',
      sentinelReports: '++id, itemName, status, locationCity, timestamp',
      customPersonas: 'id, name, userRole, currency, createdAt',
    });
    this.version(5).stores({
      transactions: '++id, type, bucket, category, date, merchant, isRecurring, originalCurrency, profileId',
      goals: '++id, category, deadline, profileId',
      settings: '++id',
      auditLogs: '++id, timestamp, aiGenerated',
      subscriptions: '++id, name, billingCycle, isActive, profileId',
      profiles: 'id, name, role',
      ious: '++id, friendName, status, direction, createdAt, category',
      sentinelReports: '++id, itemName, status, locationCity, timestamp',
      customPersonas: 'id, name, userRole, currency, createdAt',
      commodities: '++id, metal, purity, purchaseDate, linkedAccountId',
    });
  }
}

export const db = new AuraFinanceDB();
