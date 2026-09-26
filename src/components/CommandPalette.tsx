// AuraFinance OS — Omnimodal Command Palette (Ctrl+K)
// Voice-to-Ledger, Receipt Scanner, Natural Text Parser
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/database';
import { parseTransactionInput, parseReceiptInput } from '../services/aiService';
import { convertCurrency } from '../services/fxService';
import AudioWaveformCanvas from './voice/AudioWaveformCanvas';
import { Mic, MicOff, Image, Type, X, Loader2, CheckCircle, Sparkles, Upload } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

type InputMode = 'text' | 'voice' | 'receipt';

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setPersonaStudioOpen,
    setCopilotDrawerOpen,
    setSiteMapModalOpen,
    fxRates,
    baseCurrency,
    geminiApiKey,
    activeProfileId,
  } = useAppStore();
  const [mode, setMode] = useState<InputMode>('text');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen && mode === 'text') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [commandPaletteOpen, mode]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSubmitText = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const parsed = await parseTransactionInput(input.trim());
      
      const amountInUSD = parsed.currency === 'USD'
        ? parsed.amount
        : convertCurrency(parsed.amount, parsed.currency, 'USD', fxRates);

      await db.transactions.add({
        title: parsed.title,
        amount: parsed.amount,
        originalCurrency: parsed.currency,
        amountInUSD,
        type: parsed.type,
        bucket: parsed.bucket,
        category: parsed.category,
        merchant: parsed.merchant,
        date: parsed.date,
        isRecurring: false,
        tags: parsed.tags,
        profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
      });

      await db.auditLogs.add({
        timestamp: new Date().toISOString(),
        action: 'TRANSACTION_ADDED',
        details: `"${input}" → ${parsed.type} ${parsed.amount} ${parsed.currency} (${parsed.category}) [confidence: ${(parsed.confidence * 100).toFixed(0)}%]`,
        aiGenerated: !!geminiApiKey,
      });

      setSuccess(true);
      setInput('');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.3 }, colors: ['#7c5cfc', '#22c55e'] });
      
      setTimeout(() => {
        setSuccess(false);
        setCommandPaletteOpen(false);
      }, 1500);
    } catch (e) {
      setError('Failed to parse. Try a clearer description.');
    }
    setLoading(false);
  };

  // Voice recognition
  const startVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setError('Voice recognition failed. Try again.');
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Receipt handling
  const handleReceiptDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    await processReceiptFile(file);
  }, []);

  const handleReceiptSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processReceiptFile(file);
  }, []);

  const processReceiptFile = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const parsed = await parseReceiptInput(base64, file.name);
          
          if (!parsed || parsed.length === 0) {
            setError('Could not extract transactions from receipt.');
            setLoading(false);
            return;
          }

          for (const item of parsed) {
            const amountInUSD = item.currency === 'USD'
              ? item.amount
              : convertCurrency(item.amount, item.currency, 'USD', fxRates);

            await db.transactions.add({
              title: item.title,
              amount: item.amount,
              originalCurrency: item.currency,
              amountInUSD,
              type: item.type,
              bucket: item.bucket,
              category: item.category,
              merchant: item.merchant,
              date: item.date,
              isRecurring: false,
              tags: item.tags,
              receiptImage: base64.length < 50000 ? base64 : undefined,
              profileId: activeProfileId === 'all' ? 'household' : activeProfileId,
            });
          }

          setSuccess(true);
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.3 } });
          setTimeout(() => {
            setSuccess(false);
            setCommandPaletteOpen(false);
          }, 1500);
        } catch {
          setError('Failed to process receipt content.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to load receipt file.');
      setLoading(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="command-palette-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) setCommandPaletteOpen(false); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 90 || info.velocity.y > 400) {
              setCommandPaletteOpen(false);
            }
          }}
          className="command-palette"
        >
          {/* iOS Bottom Sheet Drag Handle (< 1024px only) */}
          <div className="w-12 h-1.5 rounded-full bg-slate-500/50 mx-auto mt-2.5 mb-1 lg:hidden cursor-grab active:cursor-grabbing" />
          {/* Mode Tabs */}
          <div className="flex items-center border-b border-aura-border">
            {([
              { id: 'text' as InputMode, icon: Type, label: 'Text' },
              { id: 'voice' as InputMode, icon: Mic, label: 'Voice' },
              { id: 'receipt' as InputMode, icon: Image, label: 'Receipt' },
            ]).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setError(''); }}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                    mode === tab.id
                      ? 'text-aura-accent border-aura-accent'
                      : 'text-aura-text-muted border-transparent hover:text-aura-text'
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="ml-auto mr-3 w-7 h-7 rounded-lg flex items-center justify-center text-aura-text-muted hover:text-aura-text hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Success State */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6"
              >
                <CheckCircle size={48} className="text-aura-green mb-3" />
                <p className="text-sm font-semibold text-aura-green">Transaction Added!</p>
              </motion.div>
            )}

            {/* Text Mode */}
            {mode === 'text' && !success && (
              <div>
                <div className="relative">
                  <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-accent" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder='e.g. "Bought books for $35 on Amazon" or "1200 PKR Biryani with friends"'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
                    className="w-full pl-11 pr-4 py-4 bg-transparent text-aura-text text-base placeholder:text-aura-text-muted focus:outline-none"
                    autoFocus
                  />
                  {loading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-aura-accent animate-spin" />}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini 2.0 Flash Core Active</span>
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitText}
                    disabled={!input.trim() || loading}
                    className="px-4 py-2 rounded-lg bg-aura-accent text-white text-sm font-semibold disabled:opacity-40"
                  >
                    Add Transaction
                  </motion.button>
                </div>

                {/* Quick Action Navigation Strip */}
                <div className="mt-4 pt-3 border-t border-aura-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        setCopilotDrawerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition-colors cursor-pointer"
                    >
                      <span>🤖</span>
                      <span>AI Copilot</span>
                      <kbd className="text-[10px] font-mono opacity-60">⌘J</kbd>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        setSiteMapModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-colors cursor-pointer"
                    >
                      <span>🧭</span>
                      <span>Site Map</span>
                      <kbd className="text-[10px] font-mono opacity-60">⌘M</kbd>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        setPersonaStudioOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-aura-accent/10 border border-aura-accent/25 text-aura-accent text-xs font-semibold hover:bg-aura-accent/20 transition-colors cursor-pointer"
                    >
                      <span>🎭</span>
                      <span>Persona Studio</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-aura-text-muted font-mono">100% Local</span>
                </div>
              </div>
            )}

            {/* Voice Mode */}
            {mode === 'voice' && !success && (
              <div className="text-center py-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isListening ? stopVoice : startVoice}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
                    isListening
                      ? 'bg-aura-red glow-red'
                      : 'bg-aura-accent/20 border-2 border-aura-accent/40 hover:bg-aura-accent/30'
                  }`}
                >
                  {isListening ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-aura-accent" />}
                </motion.button>
                
                {/* Animated Audio Waveform Canvas */}
                <AudioWaveformCanvas isListening={isListening} width={280} height={52} />

                <p className="text-sm text-aura-text-secondary mb-2">
                  {isListening ? 'Listening... speak clearly now' : 'Tap microphone to start speaking'}
                </p>

                {input && (
                  <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-aura-border text-sm text-aura-text text-left">
                    "{input}"
                  </div>
                )}

                {input && !isListening && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitText}
                    disabled={loading}
                    className="mt-3 px-6 py-2.5 rounded-xl bg-aura-accent text-white text-sm font-semibold"
                  >
                    {loading ? 'Processing...' : 'Add Transaction'}
                  </motion.button>
                )}
              </div>
            )}

            {/* Receipt Mode */}
            {mode === 'receipt' && !success && (
              <div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleReceiptDrop}
                  className={`drop-zone ${dragOver ? 'dragging' : ''}`}
                >
                  <Upload size={32} className="mx-auto text-aura-text-muted mb-3" />
                  <p className="text-sm text-aura-text-secondary mb-1">Drag & drop a receipt or invoice image</p>
                  <p className="text-xs text-aura-text-muted mb-3">or click to select a file</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptSelect}
                    className="hidden"
                    id="receipt-input"
                  />
                  <label
                    htmlFor="receipt-input"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-aura-accent/15 text-aura-accent text-sm font-semibold cursor-pointer hover:bg-aura-accent/25 transition-colors"
                  >
                    <Image size={14} /> Choose Image
                  </label>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 text-center flex items-center justify-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini 2.0 Flash Vision Multimodal OCR Active</span>
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-aura-red mt-3"
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
