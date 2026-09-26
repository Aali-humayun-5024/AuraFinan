import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertTriangle, Loader2 } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void> | void;
  isProcessing?: boolean;
  error?: string | null;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing = false,
  error = null,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-white/[0.1] shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decrypt-vault-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Lock size={22} />
            </div>
            <div>
              <h4 id="decrypt-vault-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Encrypted Vault Container Detected
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AES-GCM (256-bit) • PBKDF2 Zero-Knowledge Envelope
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

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          This vault JSON file is encrypted with a master passkey. Provide the exact password used during export to decrypt and restore all financial records.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Decryption Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                placeholder="Enter vault master password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !password.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <KeyRound size={14} />
                  <span>Decrypt & Restore</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
