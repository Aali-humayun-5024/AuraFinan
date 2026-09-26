// BudgetBasics — 50/30/20 Budget Module & Interactive Calculator
// Complies with TechWiz 7 SRS Section 1.6.3:
// - Explains 50% needs, 30% wants, 20% savings
// - Display Calculator outputs for the formula used
// - Validates blank or invalid inputs with clear alerts
// - Clear labels, placeholders, presets, progress bars & charts
// - Mandatory educational note explaining result is an estimate

import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  ShieldCheck,
  ShoppingBag,
  PiggyBank,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import FinancialMetric from '../common/FinancialMetric';

export default function FiftyThirtyTwentyModule() {
  const { baseCurrency } = useAppStore();
  const incomeInputId = useId();

  // State
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<string>('1200');
  const [customNeedsPct, setCustomNeedsPct] = useState<number>(50);
  const [customWantsPct, setCustomWantsPct] = useState<number>(30);
  const [customSavingsPct, setCustomSavingsPct] = useState<number>(20);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Validation
  const numericIncome = parseFloat(monthlyIncomeInput.replace(/,/g, ''));
  const isInvalid = isNaN(numericIncome) || numericIncome <= 0;
  const isBlank = monthlyIncomeInput.trim() === '';

  // Currency symbol
  const symbol = baseCurrency === 'PKR' ? '₨' : baseCurrency === 'EUR' ? '€' : baseCurrency === 'GBP' ? '£' : '$';

  // Preset allowance triggers
  const setPreset = (amount: number) => {
    setMonthlyIncomeInput(amount.toString());
  };

  // Calculations
  const income = isInvalid ? 0 : numericIncome;
  const needsPct = isCustomMode ? customNeedsPct : 50;
  const wantsPct = isCustomMode ? customWantsPct : 30;
  const savingsPct = isCustomMode ? customSavingsPct : 20;

  const needsAmount = (income * needsPct) / 100;
  const wantsAmount = (income * wantsPct) / 100;
  const savingsAmount = (income * savingsPct) / 100;

  // Handle custom sliders
  const handleNeedsChange = (val: number) => {
    setCustomNeedsPct(val);
    const remaining = 100 - val;
    setCustomWantsPct(Math.round(remaining * 0.6));
    setCustomSavingsPct(Math.round(remaining * 0.4));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Module Header & Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
          <Sparkles size={14} /> 50/30/20 Budgeting Framework
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>The 50/30/20 Budgeting Rule</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono font-bold">
            Gold Standard
          </span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          The 50/30/20 rule is an intuitive and proven framework for students and young adults to divide their monthly allowance or paycheck into three balanced buckets: <strong>50% for Needs</strong>, <strong>30% for Wants</strong>, and <strong>20% for Savings</strong>.
        </p>
      </div>

      {/* Interactive Calculator Section */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={20} className="text-amber-500" />
              Interactive Student Budget Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your monthly allowance or earnings to see your exact category breakdown.
            </p>
          </div>

          {/* Ratio Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !isCustomMode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Standard (50/30/20)
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isCustomMode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Custom Sliders
            </button>
          </div>
        </div>

        {/* Input & Presets */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label
              htmlFor={incomeInputId}
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
            >
              <span>Monthly Allowance / Total Income</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <span className="text-xs text-slate-400">Currency: {baseCurrency}</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
              {symbol}
            </div>
            <input
              id={incomeInputId}
              type="number"
              min="1"
              step="10"
              value={monthlyIncomeInput}
              onChange={(e) => setMonthlyIncomeInput(e.target.value)}
              placeholder={`e.g. 1200 or ${baseCurrency === 'PKR' ? '35000' : '800'}`}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-lg font-bold font-mono transition-all ${
                isInvalid && !isBlank
                  ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 focus:ring-rose-500'
                  : isBlank
                  ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10 focus:ring-amber-500'
                  : 'border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              } outline-hidden`}
            />
          </div>

          {/* Validation Alert */}
          {isInvalid && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertTriangle size={15} className="shrink-0" />
              <span>
                {isBlank
                  ? 'Please enter a valid monthly allowance or income amount to view calculations.'
                  : 'Income must be a positive number greater than 0.'}
              </span>
            </div>
          )}

          {/* Student Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quick Student Presets:</span>
            <button
              onClick={() => setPreset(baseCurrency === 'PKR' ? 15000 : 300)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200 dark:border-white/10"
            >
              {symbol}{baseCurrency === 'PKR' ? '15,000' : '300'} Pocket Money
            </button>
            <button
              onClick={() => setPreset(baseCurrency === 'PKR' ? 35000 : 750)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200 dark:border-white/10"
            >
              {symbol}{baseCurrency === 'PKR' ? '35,000' : '750'} Internship Stipend
            </button>
            <button
              onClick={() => setPreset(baseCurrency === 'PKR' ? 60000 : 1200)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200 dark:border-white/10"
            >
              {symbol}{baseCurrency === 'PKR' ? '60,000' : '1,200'} Part-Time Job
            </button>
            <button
              onClick={() => setPreset(baseCurrency === 'PKR' ? 120000 : 2500)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200 dark:border-white/10"
            >
              {symbol}{baseCurrency === 'PKR' ? '120,000' : '2,500'} Graduate Role
            </button>
          </div>
        </div>

        {/* Custom Mode Sliders */}
        {isCustomMode && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Adjust Custom Ratios (Must Sum to 100%):</span>
              <button
                onClick={() => {
                  setCustomNeedsPct(50);
                  setCustomWantsPct(30);
                  setCustomSavingsPct(20);
                }}
                className="text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={12} /> Reset to 50/30/20
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">Needs ({customNeedsPct}%)</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Wants ({customWantsPct}%)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Savings ({customSavingsPct}%)</span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                value={customNeedsPct}
                onChange={(e) => handleNeedsChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        )}

        {/* Visual Allocation Proportion Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Visual Budget Split:</span>
            <span>Total: 100%</span>
          </div>
          <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div
              style={{ width: `${needsPct}%` }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-[11px] font-bold transition-all duration-500"
            >
              {needsPct}% Needs
            </div>
            <div
              style={{ width: `${wantsPct}%` }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold transition-all duration-500"
            >
              {wantsPct}% Wants
            </div>
            <div
              style={{ width: `${savingsPct}%` }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold transition-all duration-500"
            >
              {savingsPct}% Savings
            </div>
          </div>
        </div>

        {/* The 3 Core Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* 1. Needs Card (50%) */}
          <div className="rounded-2xl p-5 border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-950/20 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">50% Needs</h3>
                  <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold">Essential Living</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono font-bold">
                {needsPct}%
              </span>
            </div>

            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-300">
                {symbol}{needsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Suggested maximum for necessities</p>
            </div>

            <div className="border-t border-cyan-500/20 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Includes:</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Hostel Rent or Dormitory Fee</li>
                <li>Monthly Grocery & Mess Food</li>
                <li>Public Transport / Bus Passes</li>
                <li>Mandatory Textbooks & Tuition</li>
                <li>Utility Bills & Basic Mobile Plan</li>
              </ul>
            </div>
          </div>

          {/* 2. Wants Card (30%) */}
          <div className="rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">30% Wants</h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">Lifestyle & Enjoyment</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">
                {wantsPct}%
              </span>
            </div>

            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
                {symbol}{wantsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cap for lifestyle choices & fun</p>
            </div>

            <div className="border-t border-amber-500/20 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Includes:</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Dining Out & Fast Food Deliveries</li>
                <li>Netflix, Spotify & Game Passes</li>
                <li>New Fashion, Shoes & Merch</li>
                <li>Weekend Cinema & Social Hangouts</li>
                <li>Upgrades & Gadget Accessories</li>
              </ul>
            </div>
          </div>

          {/* 3. Savings Card (20%) */}
          <div className="rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <PiggyBank size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">20% Savings</h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Future Wealth Building</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                {savingsPct}%
              </span>
            </div>

            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                {symbol}{savingsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct to savings or debt freedom</p>
            </div>

            <div className="border-t border-emerald-500/20 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Includes:</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Emergency Cushion ($500-$1,000)</li>
                <li>Laptop or Equipment Savings Goal</li>
                <li>Student Loan Pre-Payments</li>
                <li>Micro-Investing & Bullion Vault</li>
                <li>Semester Break Travel Fund</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Annualized Projection */}
        {!isInvalid && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Annual Savings Projection</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By saving 20% ({symbol}{savingsAmount.toFixed(0)}/mo) for 12 months:
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {symbol}{(savingsAmount * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-slate-400">Accumulated capital in 1 year</p>
            </div>
          </div>
        )}

        {/* Mandatory SRS Educational Note */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-amber-800 dark:text-amber-300">
              Educational Guideline:
            </strong>
            <p className="leading-relaxed">
              This 50/30/20 calculation is provided as an interactive estimate and educational guideline for learning purposes only. Individual student financial circumstances vary based on location, hostel costs, and tuition obligations. The split may be tailored as needed.
            </p>
          </div>
        </div>
      </div>

      {/* Practical Student FAQ / Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            What if my Needs exceed 50%?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            In high-rent college cities, hostel or tuition might take 60% of your income. In that case, adopt a <strong>60/25/15</strong> or <strong>60/30/10</strong> rule temporarily. The primary habit is maintaining a non-zero savings rate every single month.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            How do I stop Wants from consuming my budget?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Enforce a <strong>48-hour cool-off rule</strong> on any non-essential purchase over $25 (or ₨ 2,000). Use the Needs vs Wants decision tree before placing online delivery or gaming orders.
          </p>
        </div>
      </div>
    </div>
  );
}
