// AuraFinance OS — Feature 8: Voice-Activated "Audio Walkthrough" for Elders & Low-Literacy Users
// Zero-latency vernacular text-to-speech using native Web Speech Synthesis API
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import {
  COMMODITIES_DATABASE,
  getItemPriceForCity,
} from '../../services/commodityService';
import AudioWaveformCanvas from './AudioWaveformCanvas';
import {
  Volume2, VolumeX, Play, Pause, Square, RotateCcw,
  Sparkles, Headphones, ChevronUp, ChevronDown, Check,
  X, MessageSquare, Gauge, Users, ShoppingCart, LayoutDashboard
} from 'lucide-react';

export default function AudioWalkthroughWidget() {
  const { userCity, familySize, baseCurrency } = useAppStore();
  const { country, locale, isRTL } = useTranslation();
  const { convertToBase } = useCurrency();

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const ious = useLiveQuery(() => db.ious.toArray()) || [];

  // Speech State
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85); // Elder-friendly default slow
  const [activeTopic, setActiveTopic] = useState<'dashboard' | 'bazaar' | 'bachat' | 'ious'>('dashboard');
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [supportedVoices, setSupportedVoices] = useState<SpeechSynthesisVoice[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis & Load Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        if (synthRef.current) {
          const voices = synthRef.current.getVoices();
          setSupportedVoices(voices);
        }
      };

      updateVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Compute live data for scripts
  const now = new Date();
  const thisMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const income = thisMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = Math.max(0, income - expenses);

  // Commodities
  const eggsPrice = useMemo(() => {
    const item = COMMODITIES_DATABASE.find((c) => c.id === 'eggs');
    return item ? Math.round(getItemPriceForCity(item, userCity) / 12) : 30;
  }, [userCity]);

  const chickenPrice = useMemo(() => {
    const item = COMMODITIES_DATABASE.find((c) => c.id === 'chicken_meat');
    return item ? getItemPriceForCity(item, userCity) : 620;
  }, [userCity]);

  const milkPrice = useMemo(() => {
    const item = COMMODITIES_DATABASE.find((c) => c.id === 'milk_fresh');
    return item ? getItemPriceForCity(item, userCity) : 210;
  }, [userCity]);

  const attaPrice = useMemo(() => {
    const item = COMMODITIES_DATABASE.find((c) => c.id === 'atta_flour');
    return item ? getItemPriceForCity(item, userCity) : 1350;
  }, [userCity]);

  // IOUs
  const totalTheyOweMe = useMemo(() => {
    return ious
      .filter((i) => i.status === 'pending' && i.direction === 'they_owe_me')
      .reduce((s, i) => s + i.friendShare, 0);
  }, [ious]);

  const totalIOweThem = useMemo(() => {
    return ious
      .filter((i) => i.status === 'pending' && i.direction === 'i_owe_them')
      .reduce((s, i) => s + i.friendShare, 0);
  }, [ious]);

  // Script Generators tailored to language & elder clarity
  const scripts = useMemo(() => {
    const isUrdu = locale.code === 'ur';
    const isArabic = locale.code === 'ar';

    if (isUrdu) {
      return {
        dashboard: `خوش آمدید! آپ کے اورا فائنانس کا خلاصہ یہ ہے: اس مہینے آپ کی کل آمدنی تقریباً ${income.toLocaleString()} روپے اور کل اخراجات ${expenses.toLocaleString()} روپے رہے ہیں۔ تمام ضروری بل ادا کرنے کے بعد آپ کی بچت ${netSavings.toLocaleString()} روپے ہے۔ ماشاء اللہ آپ کا مالی نظم بہتر ہے۔`,
        bazaar: `آج ${userCity} کے سرکاری ہول سیل ریٹ یہ ہیں: ایک عدد انڈا تقریباً ${eggsPrice} روپے، زندہ مرغی کا گوشت ${chickenPrice} روپے کلو، دس کلو چکی آٹا ${attaPrice} روپے، اور تازہ دودھ ${milkPrice} روپے فی لیٹر ہے۔ منڈی کے سرکاری نرخ پر سودا لیں تاکہ بچت ممکن ہو۔`,
        bachat: `آپ کے ${familySize} افراد کے گھرانے کے لیے ماہانہ بچت کا مشورہ: راشن بازار سے دالیں اور آٹا مہینے کے شروع میں اکٹھا لیں، اور مرغی کٹوانے کے بجائے پوری مرغی خریدیں۔ اس سے آپ ماہانہ پندرہ سے بیس فیصد خرچ کم کر سکتے ہیں۔`,
        ious: `آپ کے شیئر اور ادھار کھاتے کی صورتحال: دوستوں کی طرف آپ کی کل رقم ${totalTheyOweMe.toLocaleString()} روپے بنتی ہے، جبکہ آپ نے دوسروں کو ${totalIOweThem.toLocaleString()} روپے دینے ہیں۔ آپ اپنے دوستوں کو واٹس ایپ پر ایک کلک سے یاددہانی بھیج سکتے ہیں۔`,
      };
    }

    if (isArabic) {
      return {
        dashboard: `مرحباً بك في أورا فاينانس. إليك ملخصك المالي: بلغ إجمالي دخلك هذا الشهر ${income.toLocaleString()} ${baseCurrency}، والمصروفات ${expenses.toLocaleString()} ${baseCurrency}. صافي مدخراتك المتبقية هي ${netSavings.toLocaleString()} ${baseCurrency}. ميزانيتك تسير بشكل متزن.`,
        bazaar: `إليك أسعار المواد الغذائية الأساسية لليوم في ${userCity}: بيض المائدة، الدجاج الطازج، الحليب، والأرز. تأكد من الشراء بأسعار الجملة لتقليل تكلفة المعيشة.`,
        bachat: `نصيحة توفير للعائلة المكونة من ${familySize} أفراد: احرص على شراء المواد التموينية الأساسية شهرياً من الجمعيات التعاونية أو الأسواق المركزية للاستفادة من خصم يصل إلى عشرين بالمائة.`,
        ious: `دفتر الديون والمصاريف المشتركة: المستحقات لك لدى الأصدقاء تبلغ ${totalTheyOweMe.toLocaleString()} ${baseCurrency}، بينما المبالغ المستحقة عليك هي ${totalIOweThem.toLocaleString()} ${baseCurrency}.`,
      };
    }

    return {
      dashboard: `Welcome to AuraFinance OS. Here is your audio wealth overview: This month, your total income is ${baseCurrency} ${income.toLocaleString()}, and total expenses are ${baseCurrency} ${expenses.toLocaleString()}. Your safe-to-spend surplus is ${baseCurrency} ${netSavings.toLocaleString()}. Your cash flow is in healthy standing.`,
      bazaar: `Today's official commodity prices for ${userCity}: 1 farm fresh egg is around ${eggsPrice} rupees, 1 kilogram chicken is ${chickenPrice} rupees, a 10 kilogram bag of wheat flour is ${attaPrice} rupees, and fresh milk is ${milkPrice} rupees per litre. Sourcing from wholesale mandis protects your food budget.`,
      bachat: `Smart grocery saving tip for your household of ${familySize} persons: Buy non-perishable pantry staples in bulk at wholesale clubs or farmers markets at the start of the month to shave 15 to 20 percent off your living expenses.`,
      ious: `Your peer debt summary: Friends currently owe you ${baseCurrency} ${totalTheyOweMe.toLocaleString()} in shared bills, while you owe friends ${baseCurrency} ${totalIOweThem.toLocaleString()}. You can tap the WhatsApp button to settle anytime.`,
    };
  }, [locale.code, userCity, familySize, income, expenses, netSavings, eggsPrice, chickenPrice, milkPrice, attaPrice, totalTheyOweMe, totalIOweThem, baseCurrency]);

  // Voice Selection matching active locale
  const activeVoice = useMemo(() => {
    if (!supportedVoices || supportedVoices.length === 0) return null;

    const langPrefix = locale.code; // 'ur', 'ar', 'en', 'es', 'ja', etc.

    // Exact or prefix match
    const matched = supportedVoices.find(
      (v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()) || v.lang.toLowerCase().includes(langPrefix.toLowerCase())
    );

    if (matched) return matched;

    // Fallback to English or default voice
    return supportedVoices.find((v) => v.lang.startsWith('en')) || supportedVoices[0];
  }, [supportedVoices, locale.code]);

  // Handle Play
  const handlePlay = (topicId?: 'dashboard' | 'bazaar' | 'bachat' | 'ious') => {
    if (!synthRef.current) return;

    const targetTopic = topicId || activeTopic;
    if (topicId) setActiveTopic(topicId);

    // Cancel current speaking
    synthRef.current.cancel();

    const textToSpeak = scripts[targetTopic];
    setCurrentSubtitle(textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    if (activeVoice) {
      utterance.voice = activeVoice;
      utterance.lang = activeVoice.lang;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Handle Pause / Resume
  const handlePauseResume = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    } else if (isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    } else {
      handlePlay();
    }
  };

  // Handle Stop
  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          FLOATING AUDIO ACCESSIBILITY BUTTON (DESKTOP & MOBILE)
          ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 lg:bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && !isSpeaking) {
              handlePlay('dashboard');
            }
          }}
          className={`flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold text-xs shadow-2xl transition-all border ${
            isSpeaking
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-300 animate-pulse'
              : 'bg-gradient-to-r from-aura-accent to-purple-600 border-white/20 hover:brightness-110'
          }`}
          style={{
            boxShadow: isSpeaking
              ? '0 0 25px rgba(34, 197, 94, 0.6)'
              : '0 0 20px rgba(124, 92, 252, 0.5)',
          }}
          title="Voice Walkthrough for Elders & Low-Literacy"
        >
          {isSpeaking ? (
            <Volume2 size={18} className="animate-bounce text-white" />
          ) : (
            <Headphones size={18} />
          )}
          <span className="font-semibold tracking-wide">
            {isSpeaking ? 'Listening...' : 'Voice Walkthrough (بول کر سنیں)'}
          </span>
        </motion.button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ELDER-FRIENDLY AUDIO DASHBOARD MODAL / DRAWER
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-5 sm:p-6 bg-aura-card border border-aura-accent/30 rounded-t-3xl sm:rounded-3xl shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  handleStop();
                  setIsOpen(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full text-aura-text-muted hover:text-aura-text hover:bg-white/10"
              >
                <X size={20} />
              </button>

              {/* Title & Badge */}
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 rounded-xl bg-aura-accent/20 text-aura-accent">
                  <Headphones size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-aura-text flex items-center gap-2">
                    <span>Voice-Activated Audio Walkthrough</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Zero-Latency
                    </span>
                  </h2>
                  <p className="text-xs text-aura-text-muted">
                    Designed for elders and low-literacy users. Speaks financial summaries in native speech.
                  </p>
                </div>
              </div>

              {/* Live Waveform Canvas */}
              <div className="my-3 p-3 rounded-2xl bg-white/[0.02] border border-aura-border flex flex-col items-center">
                <AudioWaveformCanvas isListening={isSpeaking} width={340} height={48} />
                <span className="text-[11px] text-aura-text-muted font-medium mt-1">
                  {isSpeaking
                    ? '🔊 Speaking in ' + (activeVoice ? activeVoice.name : 'Native Synthesizer')
                    : 'Audio resting — Choose a topic below'}
                </span>
              </div>

              {/* Teleprompter Subtitles Box */}
              {currentSubtitle && (
                <div className="my-3 p-4 rounded-2xl bg-black/40 border border-white/10 text-left">
                  <div className="flex items-center justify-between text-[10px] uppercase text-aura-accent font-bold tracking-wider mb-1.5">
                    <span>Live Spoken Subtitles (تحریر):</span>
                    {speechRate === 0.85 && <span className="text-emerald-400">Elder Pace (0.8x)</span>}
                  </div>
                  <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                    "{currentSubtitle}"
                  </p>
                </div>
              )}

              {/* Topic Selection Chips */}
              <div className="my-4">
                <label className="block text-xs font-semibold text-aura-text mb-2">
                  Choose Walkthrough Topic:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'dashboard',
                      title: 'Dashboard & Wealth',
                      urdu: 'مجموعی دولت و آمدنی',
                      icon: LayoutDashboard,
                    },
                    {
                      id: 'bazaar',
                      title: 'Daily Bazaar Rates',
                      urdu: 'روزمرہ بازار کی قیمتیں',
                      icon: ShoppingCart,
                    },
                    {
                      id: 'bachat',
                      title: 'Bachat & Saving Hacks',
                      urdu: 'راشن بچت کے طریقے',
                      icon: Sparkles,
                    },
                    {
                      id: 'ious',
                      title: 'Peer Debts & IOUs',
                      urdu: 'ادھار و کمیٹی کھاتہ',
                      icon: Users,
                    },
                  ].map((topic) => {
                    const Icon = topic.icon;
                    const isActive = activeTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => handlePlay(topic.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-aura-accent/25 border-aura-accent text-white shadow-md shadow-aura-accent/20 font-bold'
                            : 'bg-white/5 border-aura-border text-aura-text-muted hover:text-aura-text hover:bg-white/10'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-aura-accent mt-0.5' : 'mt-0.5'} />
                        <div className="truncate">
                          <p className="text-xs truncate">{topic.title}</p>
                          <span className="text-[10px] text-aura-text-muted block">{topic.urdu}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speech Controls & Speed */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-aura-border">
                {/* Play/Pause/Stop Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePauseResume}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-aura-accent to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    {isSpeaking ? <Pause size={15} /> : <Play size={15} />}
                    <span>{isSpeaking ? 'Pause' : isPaused ? 'Resume' : 'Play Audio'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStop}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-aura-text-muted hover:text-white border border-aura-border text-xs"
                    title="Stop Audio"
                  >
                    <Square size={15} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlay()}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-aura-text-muted hover:text-white border border-aura-border text-xs"
                    title="Restart Audio"
                  >
                    <RotateCcw size={15} />
                  </motion.button>
                </div>

                {/* Speech Speed Pill */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-aura-border">
                  <span className="text-[10px] text-aura-text-muted px-2 font-medium">Speed:</span>
                  {[
                    { rate: 0.8, label: '0.8x (Elder)' },
                    { rate: 1.0, label: '1.0x' },
                    { rate: 1.2, label: '1.2x' },
                  ].map((s) => (
                    <button
                      key={s.rate}
                      onClick={() => {
                        setSpeechRate(s.rate);
                        if (isSpeaking) {
                          handlePlay();
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        speechRate === s.rate
                          ? 'bg-aura-accent text-white shadow-sm'
                          : 'text-aura-text-muted hover:text-aura-text'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
