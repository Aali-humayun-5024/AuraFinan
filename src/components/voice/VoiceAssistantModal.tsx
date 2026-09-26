// AuraFinance OS — "Hey Aura" Autonomous Voice Assistant HUD & Wealth Advisor
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';
import { speechSynthesizer } from '../../services/speechSynthesizer';
import { voiceIntentParser } from '../../services/voiceIntentParser';
import { AudioOrbVisualizer } from './AudioOrbVisualizer';
import { postJournalEntry } from '../../services/doubleEntryEngine';
import type { VoiceAssistantState, ParsedVoiceCommand } from '../../types/voice';
import { useAppStore } from '../../store/useAppStore';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTranscript?: string;
}

const QUICK_PROMPTS = [
  'Log an inflow of $500',
  'Bought groceries for $45 cash',
  'What is my trial balance?',
  'Can I afford dinner tonight?',
];

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  initialTranscript = '',
}) => {
  const { baseCurrency } = useAppStore();
  const [state, setState] = useState<VoiceAssistantState>('active_listening');
  const [transcript, setTranscript] = useState(initialTranscript);
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPosted, setIsPosted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const recognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const autoCloseTimerRef = useRef<any>(null);

  // Initialize SpeechRecognition & AudioContext when opened
  useEffect(() => {
    if (!isOpen) {
      cleanupResources();
      return;
    }

    setState('active_listening');
    setTranscript(initialTranscript);
    setParsedCommand(null);
    setCountdown(null);
    setIsPosted(false);
    setTextInput('');

    // Attempt to capture mic stream for organic frequency orb
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => setMicStream(stream))
        .catch(() => {
          // Microphones might be muted or blocked; synthetic orb will pulse smoothly
        });
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState('error_state');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(current);
      };

      recognition.onend = async () => {
        if (transcript.trim().length > 0) {
          processCommand(transcript);
        } else {
          // If no speech captured yet, keep waiting
          setState('active_listening');
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Voice modal recognition error:', e);
          setState('error_state');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not start recognition in modal:', e);
    }

    return () => {
      cleanupResources();
    };
  }, [isOpen]);

  // Keyboard shortcut: Esc to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanupResources = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }
    clearInterval(countdownTimerRef.current);
    clearTimeout(autoCloseTimerRef.current);
    speechSynthesizer.stop();
  };

  const processCommand = async (text: string) => {
    if (!text.trim()) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setState('processing_ai');
    try {
      const result = await voiceIntentParser.parseCommand(text);
      setParsedCommand(result);
      setState('speaking_response');

      // Speak response back
      speechSynthesizer.speak(result.spokenResponse);

      // Handle Entry Dispatch with 4-second Countdown
      if (
        (result.intent === 'LOG_INFLOW' || result.intent === 'LOG_OUTFLOW') &&
        result.extractedData?.amount
      ) {
        startAutoPostCountdown(result);
      } else {
        // Query command auto-close after speaking
        autoCloseTimerRef.current = setTimeout(() => {
          onClose();
        }, 5000);
      }
    } catch (err) {
      console.warn('Error processing voice command:', err);
      setState('error_state');
      soundEffects.playErrorChime();
      speechSynthesizer.speak('Sorry, I encountered an issue processing your request.');
    }
  };

  const startAutoPostCountdown = (cmd: ParsedVoiceCommand) => {
    setCountdown(4);
    clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current);
          confirmJournalPost(cmd);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAutoPost = () => {
    clearInterval(countdownTimerRef.current);
    setCountdown(null);
    speechSynthesizer.speak('Transaction cancelled.');
  };

  const confirmJournalPost = async (cmd?: ParsedVoiceCommand) => {
    clearInterval(countdownTimerRef.current);
    setCountdown(null);

    const targetCmd = cmd || parsedCommand;
    if (!targetCmd || !targetCmd.extractedData?.amount || isPosted) return;

    const { amount, narration, accountCodeDebit, accountCodeCredit, accountNameDebit, accountNameCredit } =
      targetCmd.extractedData;

    try {
      const postResult = await postJournalEntry({
        entryNumber: `JE-VOICE-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        narration: narration || `Voice Entry: ${targetCmd.rawTranscript}`,
        lines: [
          {
            accountId: accountCodeDebit || '1010',
            accountName: accountNameDebit || 'Cash on Hand',
            debit: amount,
            credit: 0,
          },
          {
            accountId: accountCodeCredit || '4010',
            accountName: accountNameCredit || 'Sales / Operating',
            debit: 0,
            credit: amount,
          },
        ],
        source: 'voice_assistant',
        createdAt: new Date().toISOString(),
      });

      if (postResult.success) {
        setIsPosted(true);
        soundEffects.playSuccessChime();
        autoCloseTimerRef.current = setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.warn('Journal post failed:', err);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setTranscript(textInput);
      processCommand(textInput);
      setTextInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/65 backdrop-blur-md">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Card / Native Mobile Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl lg:rounded-3xl bg-[#080C14]/95 border border-white/[0.12] p-5 sm:p-6 shadow-2xl backdrop-blur-3xl text-slate-100 max-h-[90vh] flex flex-col"
          >
            {/* iOS Mobile Bottom Sheet Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3 lg:hidden" />

            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    Hey Aura Assistant
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">AUTONOMOUS WEALTH COPILOT</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  ESC to close
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                  aria-label="Close Assistant"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Central 3D Canvas Orb */}
            <div className="flex flex-col items-center justify-center py-4">
              <AudioOrbVisualizer
                state={state}
                isListening={state === 'active_listening'}
                audioStream={micStream}
                size={190}
              />

              {/* Dynamic State Indicator */}
              <p className="mt-3 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                {state === 'active_listening' && (
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Mic size={14} className="animate-pulse" />
                    Listening for your command...
                  </span>
                )}
                {state === 'processing_ai' && (
                  <span className="text-violet-400 flex items-center gap-1">
                    <Sparkles size={14} className="animate-spin" />
                    Analyzing ledger & intent...
                  </span>
                )}
                {state === 'speaking_response' && (
                  <span className="text-fuchsia-400 flex items-center gap-1">
                    <Volume2 size={14} className="animate-bounce" />
                    Advising & executing...
                  </span>
                )}
                {state === 'error_state' && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Microphone unavailable — type below
                  </span>
                )}
              </p>
            </div>

            {/* Live Streaming Speech Bubble */}
            <div className="min-h-[50px] px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-center mb-3">
              <p className="text-xs sm:text-sm font-medium text-slate-200 italic leading-relaxed">
                {transcript ? (
                  <span>
                    "{transcript}"<span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse" />
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">
                    Say "Log an inflow of $500" or "What is my trial balance?"
                  </span>
                )}
              </p>
            </div>

            {/* Staged Double-Entry Execution Feedback Card */}
            {parsedCommand && parsedCommand.extractedData?.amount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 font-mono mb-3"
              >
                <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-emerald-500/20 pb-1.5">
                  <span className="flex items-center gap-1 font-sans">
                    <CheckCircle2 size={14} />
                    {isPosted ? 'Balanced Journal Entry Posted' : 'Double-Entry Staged'}
                  </span>
                  <span className="tabular-nums">
                    ${parsedCommand.extractedData.amount.toFixed(2)}
                  </span>
                </div>

                <div className="text-slate-300 flex justify-between">
                  <span>Dr. [{parsedCommand.extractedData.accountCodeDebit || '1010'}] {parsedCommand.extractedData.accountNameDebit || 'Cash on Hand'}</span>
                  <span className="tabular-nums font-semibold">${parsedCommand.extractedData.amount.toFixed(2)}</span>
                </div>
                <div className="text-slate-300 flex justify-between pl-4">
                  <span>Cr. [{parsedCommand.extractedData.accountCodeCredit || '4010'}] {parsedCommand.extractedData.accountNameCredit || 'Sales / Consulting'}</span>
                  <span className="tabular-nums font-semibold">${parsedCommand.extractedData.amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-emerald-400/90 pt-1 border-t border-emerald-500/15">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Balanced: $0.00 Variance
                  </span>
                  <span>Source: voice_assistant</span>
                </div>

                {/* 4-Second Auto-Post Countdown Bar */}
                {countdown !== null && !isPosted && (
                  <div className="pt-2 space-y-1.5 font-sans">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Clock size={12} className="animate-spin" />
                        Auto-posting in <strong>{countdown}s</strong>...
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={cancelAutoPost}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => confirmJournalPost()}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} />
                          Confirm Now
                        </button>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-400"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(countdown / 4) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Advisor Feedback Response Text */}
            {parsedCommand && (
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-xs text-slate-200 leading-relaxed mb-3">
                {parsedCommand.spokenResponse}
              </div>
            )}

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(prompt);
                    processCommand(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium whitespace-nowrap border border-white/[0.06] transition cursor-pointer hover:border-aura-accent"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Fallback Text Input */}
            <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type a command (e.g. Spent $30 on dining)..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-aura-accent"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 rounded-xl bg-aura-accent text-white disabled:opacity-40 hover:bg-aura-accent/90 transition cursor-pointer"
                title="Send Command"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VoiceAssistantModal;
