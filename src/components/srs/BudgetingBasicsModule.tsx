// BudgetBasics — Budgeting Basics Module & Interactive Knowledge Check
// Complies with TechWiz 7 SRS Section 1.6.1:
// - Display info on income, fixed expenses, variable expenses, requirements, wants, savings
// - Uses cards, examples, tables, and visual illustrations
// - Displays a sample student monthly budget with clearly labeled sample currency values
// - Provides a short knowledge check / interactive quiz

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which of the following is considered a FIXED expense for a student?',
    options: [
      'Hostel monthly dormitory rent',
      'Weekend cafeteria dining with friends',
      'Cinema tickets and streaming game passes',
      'New shoes and clothing',
    ],
    correctIndex: 0,
    explanation: 'Fixed expenses occur consistently with predictable due dates and fixed costs, like monthly room rent, tuition fees, or fixed internet bills.',
  },
  {
    id: 2,
    question: 'According to the 50/30/20 rule, what percentage of your income should go to SAVINGS?',
    options: ['50%', '30%', '20%', '10%'],
    correctIndex: 2,
    explanation: 'The 50/30/20 rule allocates 50% for Needs, 30% for Wants, and 20% for Savings and debt repayment.',
  },
  {
    id: 3,
    question: 'What is the primary difference between a REQUIREMENT (Need) and a WANT?',
    options: [
      'Requirements cost more money than wants',
      'Requirements are essential for basic survival, study, and health; wants are discretionary preferences',
      'Wants must always be eliminated completely',
      'Requirements only apply to adults with full-time jobs',
    ],
    correctIndex: 1,
    explanation: 'Needs are essentials for survival and education (e.g. food, rent, textbooks). Wants elevate lifestyle comfort but can be delayed.',
  },
  {
    id: 4,
    question: 'What should a student build FIRST before making discretionary investments?',
    options: [
      'An emergency cash cushion ($300 - $500)',
      'A luxury wardrobe',
      'High-risk cryptocurrency holdings',
      'Multiple recurring subscription services',
    ],
    correctIndex: 0,
    explanation: 'An emergency fund buffers unexpected expenses (e.g. laptop repairs, medical clinic visits) without forcing you into debt.',
  },
  {
    id: 5,
    question: 'Why are variable expenses more dangerous for budget overruns?',
    options: [
      'They never change from month to month',
      'They fluctuate based on daily impulse spending, making them easy to underestimate',
      'They are strictly legally mandated',
      'They are always paid by university scholarships',
    ],
    correctIndex: 1,
    explanation: 'Variable expenses like snacks, coffee, and casual shopping accumulate quietly throughout the month if unmonitored.',
  },
];

export default function BudgetingBasicsModule() {
  const { baseCurrency } = useAppStore();
  const symbol = baseCurrency === 'PKR' ? '₨' : baseCurrency === 'EUR' ? '€' : baseCurrency === 'GBP' ? '£' : '$';

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    if (score >= 4) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Module Header */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
          <BookOpen size={14} /> Budgeting Foundations
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Budgeting Basics 101
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Mastering money is simpler than it seems. Personal budgeting is the practice of tracking where your income comes from, separating essential commitments from discretionary lifestyle desires, and preserving a monthly surplus for the future.
        </p>
      </div>

      {/* Core Concepts Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Income */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Student Income</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The total cash inflows you receive each month. For students, this commonly includes family pocket allowances, university merit scholarships, paid internships, or freelance projects.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Rule: Always budget based on NET money in hand, not promises.
          </div>
        </div>

        {/* Card 2: Fixed vs Variable Expenses */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">2. Fixed vs. Variable</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Fixed:</strong> Predictable recurring costs (Hostel room rent, monthly transport pass).<br />
            <strong>Variable:</strong> Fluctuating daily outlays (Snacks, printouts, weekend coffee, dining out).
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
            Rule: Variable expenses are where student budgets leak fastest.
          </div>
        </div>

        {/* Card 3: Requirements vs Savings */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Needs vs. Savings</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Protect your essential living needs first. What remains is divided between enjoying your student life (wants) and funding your emergency cash reserve (savings).
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-amber-600 dark:text-amber-400">
            Rule: "Pay Yourself First" before spending on entertainment.
          </div>
        </div>
      </div>

      {/* Sample Student Monthly Budget Demonstration Table (SRS requirement) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Sample Student Monthly Budget Model
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A real-world balanced monthly breakdown based on a sample {symbol}1,000 allowance.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Total Inflow: {symbol}1,000.00
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.04] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Sample Amount</th>
                <th className="py-3 px-4 text-right">% of Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Hostel / Dormitory</td>
                <td className="py-3 px-4">Shared university room accommodation</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium">Fixed Need</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}300.00</td>
                <td className="py-3 px-4 text-right font-mono">30.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Campus Mess & Groceries</td>
                <td className="py-3 px-4">Daily meals, breakfast, and fruit</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium">Variable Need</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}150.00</td>
                <td className="py-3 px-4 text-right font-mono">15.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Bus Transit & Metro Pass</td>
                <td className="py-3 px-4">Monthly student travel pass</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium">Fixed Need</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}50.00</td>
                <td className="py-3 px-4 text-right font-mono">5.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Social Outings & Cafeteria</td>
                <td className="py-3 px-4">Fast food, coffee runs with classmates</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">Variable Want</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}180.00</td>
                <td className="py-3 px-4 text-right font-mono">18.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Digital Entertainment</td>
                <td className="py-3 px-4">Spotify student discount, video game pass</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">Fixed Want</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}40.00</td>
                <td className="py-3 px-4 text-right font-mono">4.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Shopping & Personal Care</td>
                <td className="py-3 px-4">Haircuts, stationery, casual apparel</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">Variable Want</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}80.00</td>
                <td className="py-3 px-4 text-right font-mono">8.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Emergency Cash Reserve</td>
                <td className="py-3 px-4">Stashed in high-yield savings vault</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Savings Goal</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}120.00</td>
                <td className="py-3 px-4 text-right font-mono">12.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Coding Laptop Upgrade Fund</td>
                <td className="py-3 px-4">Targeting new laptop for next semester</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Savings Goal</span></td>
                <td className="py-3 px-4 font-mono font-bold text-right">{symbol}80.00</td>
                <td className="py-3 px-4 text-right font-mono">8.0%</td>
              </tr>
            </tbody>
            <tfoot className="border-t-2 border-slate-200 dark:border-white/10 font-bold bg-slate-50 dark:bg-white/[0.03]">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-slate-900 dark:text-white">TOTAL BALANCED BUDGET</td>
                <td className="py-3 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400">{symbol}1,000.00</td>
                <td className="py-3 px-4 font-mono text-right">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Interactive Knowledge Check Quiz (SRS Requirement 1.6.1) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Interactive Knowledge Check: 5 Quick Questions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test your understanding of basic financial concepts before continuing.
              </p>
            </div>
          </div>

          {isSubmitted && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold font-mono px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Score: {calculateScore()} / {QUIZ_QUESTIONS.length}
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Try Again
              </button>
            </div>
          )}
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIndex) => {
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = isSubmitted && chosen === q.correctIndex;
            const isWrong = isSubmitted && chosen !== q.correctIndex;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-xl border transition-all ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                      : 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Q{qIndex + 1}. {q.question}
                  </h4>
                  {isSubmitted && (
                    <span>
                      {isCorrect ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle size={18} className="text-rose-500 shrink-0" />
                      )}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`text-left text-xs p-3 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? isSubmitted
                              ? optIdx === q.correctIndex
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 font-bold'
                              : 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold'
                            : isSubmitted && optIdx === q.correctIndex
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submit */}
                {isSubmitted && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
                    <strong className={isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      Explanation:
                    </strong>{' '}
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
                Object.keys(selectedAnswers).length === QUIZ_QUESTIONS.length
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Submit Knowledge Check</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
