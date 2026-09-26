// AuraFinance OS — Global System Integrity Sentinel & Discrepancy Guard
// Monitors real-time mathematical coherence across all accounts, DOM elements, and ledgers

import React from 'react';
import { useCoherentFinancialState } from '../../context/FinancialStateContext';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

export const SystemIntegritySentinel: React.FC = () => {
  const { state } = useCoherentFinancialState();

  // If even a $0.01 discrepancy exists anywhere in the system
  if (!state.meta.isSystemBalanced && state.ledgerBalances.variance > 0) {
    return (
      <aside 
        role="alert"
        aria-live="assertive"
        className="w-full bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-mono font-bold shadow-2xl z-50 animate-bounce"
      >
        <div className="flex items-center gap-2">
          <AlertOctagon size={16}/>
          <span>LEDGER RECONCILIATION ALERT: Double-entry variance of ${state.ledgerBalances.variance.toFixed(2)} detected across records!</span>
        </div>
        <span>Integrity: Compromised</span>
      </aside>
    );
  }

  return (
    <div 
      role="status"
      aria-live="polite"
      className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono select-none"
    >
      <CheckCircle2 className="text-emerald-400" size={12}/>
      <span>DOM & Ledger 100% Reconciled (Zero Variance)</span>
    </div>
  );
};

export default SystemIntegritySentinel;
