import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface WipeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isProcessing?: boolean;
}

export const WipeConfirmModal: React.FC<WipeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const [confirmKeyword, setConfirmKeyword] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmKeyword.trim().toUpperCase() === 'WIPE';

  const handleConfirm = () => {
    if (!isConfirmed || isProcessing) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0D1322] border border-rose-500/30 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wipe-confirm-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-rose-500">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 id="wipe-confirm-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Wipe All Financial Records?
              </h4>
              <p className="text-xs text-rose-500 font-medium mt-0.5">
                Irreversible Destructive Operation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
          This will permanently purge all General Journal entries, accounts, trial balances, IOUs, budgets, and settings from local IndexedDB. <strong>Ensure you have exported a JSON backup first.</strong>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">WIPE</span> below to confirm:
          </label>
          <input
            type="text"
            autoFocus
            placeholder="Type WIPE..."
            value={confirmKeyword}
            onChange={(e) => setConfirmKeyword(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.1] text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Wiping Data...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Yes, Wipe Everything</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
