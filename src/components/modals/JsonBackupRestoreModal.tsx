// AuraFinance OS — Full JSON Vault Backup & Data Hydration Modal
// Supports AES-GCM (256-bit) Encrypted Containers & Compulsory Master JSON Hydration

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Download,
  ShieldCheck,
  FileJson,
  AlertTriangle,
  KeyRound,
  X,
  CheckCircle2,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import { jsonVaultService } from '../../services/jsonVaultService';
import masterSeedData from '../../data/masterSeed.json';
import { playClickSound, playSuccessSound, playCoinSound } from '../../services/soundService';
import confetti from 'canvas-confetti';
import type { AuraMasterVaultJSON, JsonValidationResult } from '../../types/vaultJson';

interface JsonBackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JsonBackupRestoreModal: React.FC<JsonBackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const [encryptToggle, setEncryptToggle] = useState(false);
  const [password, setPassword] = useState('');
  const [decryptPassword, setDecryptPassword] = useState('');
  const [needsDecryptPassword, setNeedsDecryptPassword] = useState(false);
  const [encryptedFileContent, setEncryptedFileContent] = useState<string | null>(null);

  const [importSummary, setImportSummary] = useState<JsonValidationResult['summary'] | null>(null);
  const [pendingPayload, setPendingPayload] = useState<AuraMasterVaultJSON | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  // Handle Export
  const handleExport = async () => {
    setIsExporting(true);
    playClickSound();
    try {
      const { blob, filename } = await jsonVaultService.exportVaultToJson(
        encryptToggle && password.trim().length > 0 ? password : undefined
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      playSuccessSound();
      setSuccessMsg(`Successfully generated ${filename}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Drop / Select
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setNeedsDecryptPassword(false);
    setEncryptedFileContent(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Check if file is encrypted container
        if (parsed.isEncrypted && parsed.algorithm === 'AES-GCM-256') {
          setNeedsDecryptPassword(true);
          setEncryptedFileContent(text);
          return;
        }

        const check = jsonVaultService.validateJsonSchema(parsed);
        if (!check.valid) {
          setErrorMsg(check.error || 'Invalid JSON Schema');
          return;
        }

        setImportSummary(check.summary || null);
        setPendingPayload(parsed);
        playClickSound();
      } catch {
        setErrorMsg('Failed to parse file: Invalid JSON format or corrupted container.');
      }
    };
    reader.readAsText(file);
  };

  // Handle Encrypted Decrypt Attempt
  const handleDecryptAttempt = async () => {
    if (!encryptedFileContent || !decryptPassword) return;
    setErrorMsg(null);
    try {
      const decrypted = await jsonVaultService.decryptAndParse(
        encryptedFileContent,
        decryptPassword
      );
      const check = jsonVaultService.validateJsonSchema(decrypted);
      if (!check.valid) {
        setErrorMsg(check.error || 'Decrypted JSON failed schema audit.');
        return;
      }
      setNeedsDecryptPassword(false);
      setPendingPayload(decrypted);
      setImportSummary(check.summary || null);
      playSuccessSound();
    } catch (err: any) {
      setErrorMsg(err.message || 'Decryption failed: Incorrect password.');
    }
  };

  // Handle Confirm Restore
  const handleConfirmRestore = async (mode: 'wipe_and_restore' | 'merge') => {
    if (!pendingPayload) return;
    setIsHydrating(true);
    try {
      await jsonVaultService.hydrateFromJSON(pendingPayload, mode);
      playCoinSound();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      setImportSummary(null);
      setPendingPayload(null);
      setSuccessMsg('Vault successfully hydrated! Reloading UI...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Hydration failed.');
    } finally {
      setIsHydrating(false);
    }
  };

  // One-click Master Seed Hydration
  const handleHydrateMasterSeed = async () => {
    setIsHydrating(true);
    playClickSound();
    try {
      await jsonVaultService.hydrateFromJSON(masterSeedData as any, 'wipe_and_restore');
      playCoinSound();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      setSuccessMsg('Master JSON seed ingested! Refreshing system...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Master seed ingestion failed.');
    } finally {
      setIsHydrating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl rounded-3xl bg-aura-card border border-aura-border-bright p-6 shadow-2xl backdrop-blur-2xl text-aura-text relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-aura-border relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <FileJson size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-aura-text tracking-tight">
                JSON Vault Backup, Seeding & Hydration
              </h3>
              <p className="text-xs text-aura-text-muted">
                100% deterministic JSON export, AES-GCM encryption & pre-flight schema audit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-aura-text-muted hover:text-aura-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ─── QUICK COMPULSORY MASTER SEED BUTTON ─── */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-aura-card to-cyan-950/20 border border-aura-accent/30 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-aura-accent" />
              <span className="text-xs font-bold text-aura-text">Compulsory Master JSON Seeder</span>
            </div>
            <p className="text-[11px] text-aura-text-muted mt-0.5">
              Instantly hydrate the entire system with realistic accounts, balanced general ledger, bullion, and cash flows.
            </p>
          </div>
          <button
            onClick={handleHydrateMasterSeed}
            disabled={isHydrating}
            className="px-3.5 py-2 rounded-xl bg-aura-accent hover:bg-aura-accent-bright text-white text-xs font-bold shadow-lg shadow-aura-accent/25 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            {isHydrating ? 'Hydrating...' : 'Hydrate Master Seed'}
          </button>
        </div>

        {/* ─── EXPORT SECTION ─── */}
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-aura-text-secondary">
            1. Export Live Vault to JSON
          </h4>

          <label className="flex items-center gap-2 text-xs text-aura-text cursor-pointer">
            <input
              type="checkbox"
              checked={encryptToggle}
              onChange={(e) => setEncryptToggle(e.target.checked)}
              className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
            />
            <ShieldCheck className="text-emerald-400" size={15} />
            <span>Encrypt with AES-GCM 256-bit Password (PBKDF2 100k rounds)</span>
          </label>

          {encryptToggle && (
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 text-aura-text-muted" size={14} />
              <input
                type="password"
                placeholder="Set vault decryption password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ps-9 pe-3 py-2 rounded-xl bg-white/[0.04] border border-aura-border text-xs text-aura-text placeholder:text-aura-text-muted outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>{isExporting ? 'Exporting...' : 'Download Master JSON Vault'}</span>
          </button>
        </div>

        {/* ─── IMPORT / HYDRATION SECTION ─── */}
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-aura-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-aura-text-secondary">
            2. Restore or Hydrate from JSON File
          </h4>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-aura-border hover:border-cyan-400/50 rounded-2xl cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all text-center">
            <UploadCloud className="text-cyan-400 mb-2" size={32} />
            <span className="text-xs font-semibold text-aura-text">
              Click to select or drag and drop .json vault file
            </span>
            <span className="text-[10px] text-aura-text-muted mt-0.5">
              Supports raw .json and password-encrypted AES-GCM (.encrypted.json) files
            </span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Password prompt for encrypted file */}
          {needsDecryptPassword && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Lock size={14} />
                <span>AES-GCM Encrypted Vault Detected</span>
              </div>
              <p className="text-[11px] text-aura-text-muted">
                This backup is encrypted with 256-bit AES-GCM. Please enter the password to decrypt and verify.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter vault password..."
                  value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-aura-border text-xs text-aura-text outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleDecryptAttempt}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
                >
                  Decrypt
                </button>
              </div>
            </div>
          )}

          {/* Pre-flight Audit Summary */}
          {importSummary && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-2.5">
              <div className="font-bold text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>Pre-Flight Integrity Audit Passed</span>
                </div>
                <span className="font-mono text-[11px]">Base: {importSummary.currency}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-aura-border text-center">
                  <div className="text-aura-text-muted text-[10px]">Accounts</div>
                  <div className="text-aura-text font-bold">{importSummary.accountsCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-aura-border text-center">
                  <div className="text-aura-text-muted text-[10px]">Journal Entries</div>
                  <div className="text-emerald-400 font-bold">
                    {importSummary.balancedEntries} balanced
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-aura-border text-center">
                  <div className="text-aura-text-muted text-[10px]">Cash Flow</div>
                  <div className="text-aura-text font-bold">{importSummary.cashFlowCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-aura-border text-center">
                  <div className="text-aura-text-muted text-[10px]">IOU Debts</div>
                  <div className="text-aura-text font-bold">{importSummary.iousCount}</div>
                </div>
              </div>

              {importSummary.unbalancedEntries > 0 && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  Warning: {importSummary.unbalancedEntries} unbalanced journal entries detected.
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleConfirmRestore('wipe_and_restore')}
                  disabled={isHydrating}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Wipe & Full Restore
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmRestore('merge')}
                  disabled={isHydrating}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-aura-text font-semibold text-xs transition-colors cursor-pointer"
                >
                  Non-Destructive Merge
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default JsonBackupRestoreModal;
