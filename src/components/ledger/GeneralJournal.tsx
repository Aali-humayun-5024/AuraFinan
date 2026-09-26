// AuraFinance OS — CPA-Grade Double-Entry General Journal
import { useState, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { ledgerDb } from '../../db/ledgerSchema';
import type { JournalLineItem, GeneralJournalEntry } from '../../types/accounting';
import { validateJournalEntry, postJournalEntry } from '../../services/doubleEntryEngine';
import { parseReceiptWithVision, resolveCurrencyConversion, type ExtractedReceiptData } from '../../services/visionOcrService';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import { playClickSound, playSuccessSound, playCoinSound } from '../../services/soundService';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  ArrowRight,
  Globe,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../i18n/useTranslation';
import { useDebouncedLiveQuery } from '../../hooks/useDebouncedLiveQuery';

export default function GeneralJournal() {
  const { t } = useTranslation();
  const { baseCurrency, geminiApiKey } = useAppStore();
  const accounts = useDebouncedLiveQuery(() => ledgerDb.accounts.toArray()) || [];
  const entries = useDebouncedLiveQuery(() => ledgerDb.journalEntries.orderBy('date').reverse().limit(25).toArray()) || [];

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState<JournalLineItem[]>([
    { accountId: '1020', accountName: 'Bank Operating Account', debit: 1500, credit: 0 },
    { accountId: '4010', accountName: 'Sales / Consulting Revenue', debit: 0, credit: 1500 },
  ]);

  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OCR Modal State
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDragOver, setOcrDragOver] = useState(false);
  const [ocrPreviewResult, setOcrPreviewResult] = useState<ExtractedReceiptData | null>(null);
  const [overrideCurrency, setOverrideCurrency] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Balance Check
  const validation = useMemo(() => {
    return validateJournalEntry(lines);
  }, [lines]);

  const handleAccountChange = (index: number, accountId: string) => {
    const acc = accounts.find((a) => a.code === accountId);
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        accountId,
        accountName: acc ? acc.name : '',
      };
      return updated;
    });
  };

  const handleAmountChange = (index: number, field: 'debit' | 'credit', val: string) => {
    const num = parseFloat(val) || 0;
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: num,
        // When setting debit > 0, zero out credit and vice versa
        [field === 'debit' ? 'credit' : 'debit']: num > 0 ? 0 : updated[index][field === 'debit' ? 'credit' : 'debit'],
      };
      return updated;
    });
  };

  const handleAddLine = () => {
    playClickSound();
    const defaultAcc = accounts[0] || { code: '1010', name: 'Cash on Hand' };
    setLines((prev) => [
      ...prev,
      { accountId: defaultAcc.code, accountName: defaultAcc.name, debit: 0, credit: 0 },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    playClickSound();
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) {
      setErrorMsg(`Posting blocked: Debits and Credits must balance. Variance: $${validation.difference.toFixed(2)}.`);
      return;
    }
    if (!narration.trim()) {
      setErrorMsg('Narration cannot be empty.');
      return;
    }

    setPosting(true);
    setErrorMsg(null);
    playCoinSound();

    try {
      const res = await postJournalEntry({
        entryNumber: '',
        date,
        narration: narration.trim(),
        source: 'manual',
        createdAt: new Date().toISOString(),
        lines,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to post journal entry.');
      } else {
        playSuccessSound();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#059669', '#6D28D9', '#0284C7'],
        });

        setSuccessMsg(`Entry posted successfully as Entry #${res.entryId}! Ledger accounts updated.`);
        setNarration('');
        // Reset to fresh balanced template
        setLines([
          { accountId: '1010', accountName: 'Cash on Hand', debit: 0, credit: 0 },
          { accountId: '5020', accountName: 'Food & Dining Expense', debit: 0, credit: 0 },
        ]);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while saving entry.');
    } finally {
      setPosting(false);
    }
  };

  // OCR Receipt Scan Handler
  const handleReceiptFile = async (file: File) => {
    setOcrLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const result = await parseReceiptWithVision(base64, file.name);
        setOcrPreviewResult(result);
        setOverrideCurrency(result.sourceDetectedCurrency);
        playSuccessSound();
      } catch (err) {
        console.error('OCR processing error:', err);
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleReceipt = async (type: 'dining' | 'cloud' | 'supplies') => {
    setOcrLoading(true);
    playClickSound();

    const today = new Date().toISOString().split('T')[0];
    let sourceCurrency = 'EUR';
    let originalTotal = 45.0;
    let originalSubtotal = 41.67;
    let originalTax = 3.33;
    let vendor = 'Artisan Roastery & Cafe (Berlin)';
    let categoryAccount = { id: '5020', name: 'Food & Dining Expense' };
    let confidence: ExtractedReceiptData['confidenceCurrencyDetection'] = 'explicit';

    if (type === 'dining') {
      sourceCurrency = 'AED';
      originalTotal = 150.0;
      originalSubtotal = 142.86;
      originalTax = 7.14;
      vendor = 'Monal Sky Restaurant (Dubai Marina)';
      categoryAccount = { id: '5020', name: 'Food & Dining Expense' };
      confidence = 'inferred_address';
    } else if (type === 'cloud') {
      sourceCurrency = 'EUR';
      originalTotal = 45.0;
      originalSubtotal = 37.82;
      originalTax = 7.18;
      vendor = 'Hetzner & AWS Cloud Infrastructure (Frankfurt)';
      categoryAccount = { id: '5030', name: 'Office Supplies & SaaS' };
      confidence = 'explicit';
    } else {
      sourceCurrency = 'PKR';
      originalTotal = 28500.0;
      originalSubtotal = 24358.97;
      originalTax = 4141.03;
      vendor = 'Al-Madina Trading Mandi & Commodities';
      categoryAccount = { id: '1040', name: 'Inventory / Stock' };
      confidence = 'inferred_tax_id';
    }

    const { convertedTotal, rate } = resolveCurrencyConversion(originalTotal, sourceCurrency, baseCurrency);
    const convertedSubtotal = Math.round(originalSubtotal * rate * 100) / 100;
    const convertedTax = Math.round((convertedTotal - convertedSubtotal) * 100) / 100;

    const sampleResult: ExtractedReceiptData = {
      vendor,
      date: today,
      sourceDetectedCurrency: sourceCurrency,
      confidenceCurrencyDetection: confidence,
      originalSubtotal,
      originalTax,
      originalTotal,
      targetBaseCurrency: baseCurrency,
      exchangeRateApplied: Math.round(rate * 10000) / 10000,
      convertedTotal,
      convertedTax,
      convertedSubtotal,
      lineItems: [
        {
          description: `Commercial Procurement at ${vendor}`,
          quantity: 1,
          originalPrice: originalSubtotal,
          convertedPrice: convertedSubtotal,
        },
      ],
      suggestedJournalEntry: {
        narration: `Expense at ${vendor} (${sourceCurrency} ${originalTotal.toFixed(2)} -> ${baseCurrency} ${convertedTotal.toFixed(2)})`,
        debitAccountCode: categoryAccount.id,
        creditAccountCode: '1010',
        amountInBaseCurrency: convertedTotal,
        lines: [
          {
            accountId: categoryAccount.id,
            accountName: categoryAccount.name,
            debit: convertedSubtotal,
            credit: 0,
          },
          {
            accountId: '2030',
            accountName: 'Sales Tax / VAT Payable',
            debit: convertedTax,
            credit: 0,
          },
          {
            accountId: '1010',
            accountName: 'Cash on Hand',
            debit: 0,
            credit: convertedTotal,
          },
        ],
      },
      isAiParsed: true,
    };

    setOcrPreviewResult(sampleResult);
    setOverrideCurrency(sourceCurrency);
    setOcrLoading(false);
    playSuccessSound();
  };

  const handleCurrencyOverride = (newIso: string) => {
    if (!ocrPreviewResult) return;
    setOverrideCurrency(newIso);
    const { convertedTotal, rate } = resolveCurrencyConversion(ocrPreviewResult.originalTotal, newIso, baseCurrency);
    const convertedSubtotal = Math.round(ocrPreviewResult.originalSubtotal * rate * 100) / 100;
    const convertedTax = Math.round((convertedTotal - convertedSubtotal) * 100) / 100;

    const updatedLines = ocrPreviewResult.suggestedJournalEntry.lines.map((l) => {
      if (l.debit > 0) {
        return { ...l, debit: l.accountId === '2030' ? convertedTax : convertedSubtotal };
      }
      return { ...l, credit: convertedTotal };
    });

    setOcrPreviewResult({
      ...ocrPreviewResult,
      sourceDetectedCurrency: newIso,
      exchangeRateApplied: Math.round(rate * 10000) / 10000,
      convertedTotal,
      convertedTax,
      convertedSubtotal,
      suggestedJournalEntry: {
        ...ocrPreviewResult.suggestedJournalEntry,
        narration: `Expense at ${ocrPreviewResult.vendor} (${newIso} ${ocrPreviewResult.originalTotal.toFixed(2)} -> ${baseCurrency} ${convertedTotal.toFixed(2)})`,
        amountInBaseCurrency: convertedTotal,
        lines: updatedLines,
      },
    });
  };

  const applyOcrToDesk = () => {
    if (!ocrPreviewResult) return;
    setDate(ocrPreviewResult.date);
    setNarration(ocrPreviewResult.suggestedJournalEntry.narration);
    setLines(ocrPreviewResult.suggestedJournalEntry.lines);
    playSuccessSound();
    setOcrModalOpen(false);
    setOcrPreviewResult(null);
    setSuccessMsg(
      `Receipt from "${ocrPreviewResult.vendor}" applied to entry desk (${baseCurrency} ${ocrPreviewResult.convertedTotal.toFixed(2)})!`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* ─── 1. JOURNAL ENTRY CREATION DESK (Master Spec 5.4) ─── */}
      <div className="p-6 rounded-3xl bg-white/85 dark:bg-[#0D121E]/70 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.03),0_10px_30px_-5px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.40)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText size={17} className="text-cyan-500" />
                <span>{t.generalLedger.journalTitle}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CPA-Grade Double-Entry Validation Engine. Automatic atomic posting to Chart of Accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setOcrModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 text-cyan-700 dark:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Camera size={14} />
              <span>Multimodal OCR Receipt Scan</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handlePost} className="space-y-4">
          {/* Date & Narration (Master Spec 5.6 Inputs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.generalLedger.dateColumn}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3.5 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.generalLedger.narrationColumn} *</label>
              <input
                type="text"
                required
                placeholder={t.generalLedger.narrationPlaceholder}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="w-full h-10 px-3.5 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
              />
            </div>
          </div>

          {/* Line Items Table (Master Spec 5.4) */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-white/[0.08]">
            <table className="w-full text-start text-xs min-w-[550px]">
              <thead className="bg-slate-50/80 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-3 w-10 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">#</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">{t.generalLedger.accountHeadingColumn}</th>
                  <th className="px-4 py-3 w-36 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">{t.generalLedger.debitColumn}</th>
                  <th className="px-4 py-3 w-36 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">{t.generalLedger.creditColumn}</th>
                  <th className="px-4 py-3 w-10 border-b border-slate-200 dark:border-white/[0.08]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors duration-100">
                    <td className="px-4 py-3.5 font-mono text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/[0.04]">{idx + 1}</td>
                    <td className="px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.04]">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleAccountChange(idx, e.target.value)}
                        className="w-full h-10 px-3.5 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 cursor-pointer"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.code} value={acc.code}>
                            {acc.code} — {acc.name} ({acc.category.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.04]">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={line.debit || ''}
                        onChange={(e) => handleAmountChange(idx, 'debit', e.target.value)}
                        className="w-full h-10 px-3.5 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.1] text-xs text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                      />
                    </td>
                    <td className="px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.04]">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={line.credit || ''}
                        onChange={(e) => handleAmountChange(idx, 'credit', e.target.value)}
                        className="w-full h-10 px-3.5 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.1] text-xs text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center border-b border-slate-100 dark:border-white/[0.04]">
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Row & Live Balance Checker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleAddLine}
              className="px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.18] hover:border-cyan-500 text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 self-start cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>{t.generalLedger.addLineItemButton}</span>
            </button>

            {/* Live Balance Checker Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-end text-xs">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">{t.generalLedger.totalDebits}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  ${validation.totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-end text-xs">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">{t.generalLedger.totalCredits}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  ${validation.totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-xs ${
                  validation.isValid
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-400'
                }`}
              >
                {validation.isValid ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{t.generalLedger.balancedBadge}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} />
                    <span>{t.generalLedger.unbalancedBadge} ({t.generalLedger.varianceNotice} ${validation.difference.toFixed(2)})</span>
                  </>
                )}
              </div>

              {/* Post Button (Master Spec 5.6 Primary Action Button) */}
              <button
                type="submit"
                disabled={!validation.isValid || posting}
                className="h-10 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {posting ? 'Posting to Ledger...' : t.generalLedger.postEntryButton}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ─── 2. RECENT POSTED JOURNAL ENTRIES (Master Spec 5.4) ─── */}
      <div className="p-6 rounded-3xl bg-white/85 dark:bg-[#0D121E]/70 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.03),0_10px_30px_-5px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.40)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-aura-accent" />
            <h3 className="text-sm font-bold text-aura-text">Posted General Journal Entries ({sortedEntries.length})</h3>
          </div>
          <span className="text-[10px] font-mono text-aura-text-muted">IndexedDB Real-Time</span>
        </div>

        <div className="space-y-3">
          {sortedEntries.length === 0 ? (
            <p className="text-center py-8 text-xs text-aura-text-muted">No journal entries recorded yet.</p>
          ) : (
            sortedEntries.map((entry) => {
              const entryTotal = (entry.lines || []).reduce((sum: number, l: JournalLineItem) => sum + (Number(l.debit) || 0), 0);
              return (
                <div
                  key={entry.id || entry.entryNumber}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-aura-border hover:border-aura-accent/30 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-aura-accent px-2 py-0.5 rounded-md bg-aura-accent/15 border border-aura-accent/20">
                        {entry.entryNumber}
                      </span>
                      <span className="text-xs font-mono text-aura-text-muted">{entry.date}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-aura-text-muted">
                        {entry.source.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${entryTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                        Balanced
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{entry.narration}</p>

                  {/* Lines Breakdown (Master Spec 5.4) */}
                  <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-xl p-2 text-[11px] overflow-x-auto border border-slate-100 dark:border-white/[0.04]">
                    <table className="w-full text-left font-mono">
                      <tbody>
                        {(entry.lines || []).map((l: JournalLineItem, lIdx: number) => (
                          <tr key={lIdx} className="border-b border-slate-100 dark:border-white/[0.04] last:border-none">
                            <td className="py-1.5 px-3 text-slate-400 dark:text-slate-500 w-16">{l.accountId}</td>
                            <td className={`py-1.5 px-3 font-sans ${Number(l.credit) > 0 ? 'ps-6 text-slate-500 dark:text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                              {l.accountName}
                            </td>
                            <td className="py-1.5 px-3 text-right text-slate-800 dark:text-slate-200 w-28 tabular-nums">
                              {Number(l.debit) > 0 ? `$${Number(l.debit).toFixed(2)}` : '—'}
                            </td>
                            <td className="py-1.5 px-3 text-right text-slate-800 dark:text-slate-200 w-28 tabular-nums">
                              {Number(l.credit) > 0 ? `$${Number(l.credit).toFixed(2)}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── 3. MODAL: MULTIMODAL OCR RECEIPT SCANNER (Master Spec 5.7) ─── */}
      <AnimatePresence>
        {ocrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg p-6 lg:p-8 rounded-3xl bg-white/95 dark:bg-[#080C14]/95 border border-slate-200 dark:border-white/[0.12] backdrop-blur-3xl shadow-2xl relative"
            >
              <button
                onClick={() => setOcrModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="pb-5 mb-6 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={18} className="text-cyan-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Multimodal OCR Receipt Parser</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Powered by Gemini 2.0 Flash Vision with zero-latency deterministic CPA regex fallback.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              {!ocrPreviewResult ? (
                <>
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOcrDragOver(true);
                    }}
                    onDragLeave={() => setOcrDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setOcrDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleReceiptFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                      ocrDragOver
                        ? 'border-aura-accent bg-aura-accent/15'
                        : 'border-aura-border hover:border-aura-accent/50 bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleReceiptFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload size={32} className="mx-auto text-aura-accent mb-2" />
                    <p className="text-xs font-bold text-aura-text">Drop commercial receipt or invoice image here</p>
                    <p className="text-[11px] text-aura-text-muted mt-0.5">Supports multi-currency receipts with auto-detection</p>
                  </div>

                  {ocrLoading && (
                    <div className="py-4 text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-aura-accent border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-aura-accent font-semibold">
                        Gemini Vision analyzing currency & line items...
                      </p>
                    </div>
                  )}

                  {/* Quick Sample Injections with Foreign Currencies */}
                  <div className="mt-4 pt-3 border-t border-aura-border">
                    <p className="text-[10px] uppercase font-bold text-aura-text-muted mb-2 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500" />
                      <span>Test Multi-Currency Inference & Conversion:</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSampleReceipt('dining')}
                        className="p-2.5 rounded-xl bg-white/5 border border-aura-border text-xs text-left hover:border-aura-accent transition-all cursor-pointer"
                      >
                        <p className="font-bold text-aura-text">🇦🇪 Dubai Marina</p>
                        <p className="text-[10px] text-cyan-400 font-mono">150.00 AED Dining</p>
                        <p className="text-[9px] text-aura-text-muted">Inferred Address</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleReceipt('cloud')}
                        className="p-2.5 rounded-xl bg-white/5 border border-aura-border text-xs text-left hover:border-aura-accent transition-all cursor-pointer"
                      >
                        <p className="font-bold text-aura-text">🇪🇺 Berlin Cloud</p>
                        <p className="text-[10px] text-emerald-400 font-mono">€45.00 EUR SaaS</p>
                        <p className="text-[9px] text-aura-text-muted">Explicit Symbol</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleReceipt('supplies')}
                        className="p-2.5 rounded-xl bg-white/5 border border-aura-border text-xs text-left hover:border-aura-accent transition-all cursor-pointer"
                      >
                        <p className="font-bold text-aura-text">🇵🇰 Karachi Mandi</p>
                        <p className="text-[10px] text-amber-400 font-mono">₨ 28,500 Trade</p>
                        <p className="text-[9px] text-aura-text-muted">Inferred NTN/Tax</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* UI Verification Preview Modal with Split Badge & Currency Override */
                <div className="space-y-4">
                  {/* Split Currency Conversion Hero Badge */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-aura-accent/15 via-cyan-500/10 to-emerald-500/15 border border-aura-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-1 rounded-lg bg-black/30 border border-white/10 font-bold text-slate-200">
                        Detected: {ocrPreviewResult.sourceDetectedCurrency} {ocrPreviewResult.originalTotal.toFixed(2)}
                      </span>
                      <ArrowRight size={14} className="text-cyan-400 shrink-0" />
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-bold text-emerald-400">
                        Converted: {baseCurrency} {ocrPreviewResult.convertedTotal.toFixed(2)}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      Rate: 1 {ocrPreviewResult.sourceDetectedCurrency} = {ocrPreviewResult.exchangeRateApplied.toFixed(4)} {baseCurrency}
                    </span>
                  </div>

                  {/* Contextual Inference Confidence Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-aura-text-muted uppercase font-bold">Detection Source:</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                        {ocrPreviewResult.confidenceCurrencyDetection === 'explicit' && '✓ Explicit Symbol'}
                        {ocrPreviewResult.confidenceCurrencyDetection === 'inferred_address' && '📍 Inferred Address / Phone'}
                        {ocrPreviewResult.confidenceCurrencyDetection === 'inferred_tax_id' && '🏛️ Inferred Tax / VAT Code'}
                        {ocrPreviewResult.confidenceCurrencyDetection === 'fallback_home' && '⚙️ Default Base Currency'}
                      </span>
                    </div>

                    {/* Manual Currency Override Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-aura-text-muted font-bold">Override Currency:</span>
                      <select
                        value={overrideCurrency}
                        onChange={(e) => handleCurrencyOverride(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-aura-surface border border-aura-border text-aura-text text-xs font-mono font-bold outline-none"
                      >
                        {['USD', 'EUR', 'GBP', 'PKR', 'AED', 'INR', 'CAD', 'JPY'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Scanned Details */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-aura-border space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-aura-text-muted">Vendor / Merchant:</span>
                      <span className="font-bold text-aura-text">{ocrPreviewResult.vendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-aura-text-muted">Receipt Date:</span>
                      <span className="font-mono text-aura-text">{ocrPreviewResult.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-aura-text-muted">Original Subtotal & Tax:</span>
                      <span className="font-mono text-aura-text">
                        {ocrPreviewResult.sourceDetectedCurrency} {ocrPreviewResult.originalSubtotal.toFixed(2)} + Tax: {ocrPreviewResult.sourceDetectedCurrency} {ocrPreviewResult.originalTax.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Double-Entry Preview Lines in Home Currency */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-aura-text-muted">
                      Generated Double-Entry Ledger Lines ({baseCurrency}):
                    </p>
                    <div className="bg-white/[0.02] rounded-xl p-2.5 text-xs font-mono space-y-1.5 border border-aura-border/40">
                      {ocrPreviewResult.suggestedJournalEntry.lines.map((line, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className={line.debit > 0 ? 'text-emerald-400 font-bold' : 'pl-4 text-rose-400'}>
                            {line.debit > 0 ? 'Dr.' : 'Cr.'} [{line.accountId}] {line.accountName}
                          </span>
                          <span className="font-bold tabular-nums">
                            {baseCurrency} {(line.debit || line.credit).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons (Master Spec 5.6 & 5.7) */}
                  <div className="gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setOcrPreviewResult(null)}
                      className="h-10 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      ← Scan Another
                    </button>

                    <button
                      type="button"
                      onClick={applyOcrToDesk}
                      className="h-10 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Apply to Entry Desk ({baseCurrency})</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
