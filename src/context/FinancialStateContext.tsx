// AuraFinance OS — Universal Single-Source-of-Truth (SSOT) Financial State Provider
// Sole reactive computational engine guaranteeing 100% mathematical coherence across all DOM elements

import React, { createContext, useContext, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ledgerDb } from '../db/ledgerSchema';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { ReconciliationEngine } from '../services/reconciliationEngine';
import { UnifiedFinancialState } from '../types/reconciliation';

export interface FinancialStateContextValue extends UnifiedFinancialState {
  state: UnifiedFinancialState;
  isLoading: boolean;
}

const FinancialStateContext = createContext<FinancialStateContextValue | null>(null);

export const FinancialStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { baseCurrency, fxRates } = useAppStore();

  // Unified Reactive IndexedDB Stream across all Dexie tables
  const accounts = useLiveQuery(() => ledgerDb.accounts.toArray()) || [];
  const entries = useLiveQuery(() => ledgerDb.journalEntries.toArray()) || [];
  const commodities = useLiveQuery(() => db.commodities?.toArray()) || [];
  const ious = useLiveQuery(() => db.ious?.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions?.toArray()) || [];

  // Master Reactive Calculation Pipeline
  const masterState = useMemo<UnifiedFinancialState>(() => {
    return ReconciliationEngine.computeMasterState(
      accounts,
      entries,
      commodities as any,
      ious as any,
      baseCurrency,
      fxRates,
      transactions
    );
  }, [accounts, entries, commodities, ious, transactions, baseCurrency, fxRates]);

  const isLoading = accounts.length === 0 && entries.length === 0 && transactions.length === 0;

  const contextValue = useMemo<FinancialStateContextValue>(() => {
    return {
      ...masterState,
      state: masterState,
      isLoading,
    };
  }, [masterState, isLoading]);

  return (
    <FinancialStateContext.Provider value={contextValue}>
      {children}
    </FinancialStateContext.Provider>
  );
};

export function useCoherentFinancialState(): FinancialStateContextValue {
  const context = useContext(FinancialStateContext);
  if (!context) {
    const fallback = ReconciliationEngine.computeMasterState([], [], [], [], 'PKR');
    return {
      ...fallback,
      state: fallback,
      isLoading: false,
    };
  }
  return context;
}
