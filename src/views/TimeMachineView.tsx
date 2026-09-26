// AuraFinance OS — Wealth Time Machine (Compound Interest Simulator)
// Fully reactive compound wealth simulator bound to live GAAP liquid cash and monthly savings
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useHardwareProfile } from '../context/HardwareProfileContext';
import { useCoherentFinancialState } from '../context/FinancialStateContext';
import { downsampleLTTB } from '../utils/lttb';
import { formatCurrency } from '../services/fxService';
import FinancialMetric from '../components/common/FinancialMetric';
import { Sparkles, TrendingUp, Award, Banknote, Flame, Percent, Clock, RefreshCw, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { playClickSound } from '../services/soundService';

export default function TimeMachineView() {
  const { baseCurrency } = useAppStore();
  const { state: coherentState } = useCoherentFinancialState();

  // Dynamic state baselines bound strictly to live financial state
  const livePrincipal = coherentState.liquidity.liquidCash;
  const liveMonthlyYield = coherentState.sliderBaselines.timeMachineDefaultMonthlyYield;

  const [startingPrincipal, setStartingPrincipal] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [returnRate, setReturnRate] = useState<number>(9.0); // 3% to 15%
  const [years, setYears] = useState<number>(15); // 1 to 30 years
  const [inflationOn, setInflationOn] = useState<boolean>(true);

  // Active calibrated slider values
  const activePrincipal = startingPrincipal !== null ? startingPrincipal : livePrincipal;
  const activeMonthly = monthly !== null ? monthly : liveMonthlyYield;

  const maxPrincipal = Math.max(100000, Math.round(livePrincipal * 4) || 100000);
  const maxMonthly = Math.max(5000, Math.round(coherentState.liquidity.totalInflows) || 10000);

  const inflationRate = 3.5;

  // Discrete Monthly Compounding Formula:
  // A = P*(1 + r/12)^(12*y) + PMT * [((1 + r/12)^(12*y) - 1) / (r/12)]
  const chartData = useMemo(() => {
    const data: {
      year: number;
      mattress: number;
      compoundedGrowth: number;
      cashInflationEroded: number;
      milestone?: string;
    }[] = [];

    const r = returnRate / 100;
    const rMonthly = r / 12;
    const inf = inflationRate / 100;

    for (let y = 0; y <= years; y++) {
      const nominalContributed = activePrincipal + activeMonthly * 12 * y;
      let investedTotal = 0;

      if (y === 0) {
        investedTotal = activePrincipal;
      } else {
        const principalGrowth = activePrincipal * Math.pow(1 + rMonthly, 12 * y);
        const pmtGrowth = activeMonthly * ((Math.pow(1 + rMonthly, 12 * y) - 1) / rMonthly);
        investedTotal = principalGrowth + pmtGrowth;
      }

      // Cash in bank eroded by inflation
      const cashEroded = inflationOn ? nominalContributed / Math.pow(1 + inf, y) : nominalContributed;

      let milestone: string | undefined;
      const milestoneTargetMultiplier = baseCurrency === 'PKR' ? 280 : 1;
      if (
        investedTotal >= 10000 * milestoneTargetMultiplier &&
        (y === 0 || (activePrincipal * Math.pow(1 + rMonthly, 12 * (y - 1)) + activeMonthly * ((Math.pow(1 + rMonthly, 12 * (y - 1)) - 1) / rMonthly)) < 10000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Emergency Runway 🛡️';
      }
      if (
        investedTotal >= 100000 * milestoneTargetMultiplier &&
        (y === 0 || (activePrincipal * Math.pow(1 + rMonthly, 12 * (y - 1)) + activeMonthly * ((Math.pow(1 + rMonthly, 12 * (y - 1)) - 1) / rMonthly)) < 100000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Real Estate / Portfolio 🎓';
      }
      if (
        investedTotal >= 500000 * milestoneTargetMultiplier &&
        (y === 0 || (activePrincipal * Math.pow(1 + rMonthly, 12 * (y - 1)) + activeMonthly * ((Math.pow(1 + rMonthly, 12 * (y - 1)) - 1) / rMonthly)) < 500000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Financial Independence 🏝️';
      }
      if (
        investedTotal >= 1000000 * milestoneTargetMultiplier &&
        (y === 0 || (activePrincipal * Math.pow(1 + rMonthly, 12 * (y - 1)) + activeMonthly * ((Math.pow(1 + rMonthly, 12 * (y - 1)) - 1) / rMonthly)) < 1000000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Sovereign Wealth 💎';
      }

      data.push({
        year: y,
        mattress: Math.round(nominalContributed),
        compoundedGrowth: Math.round(investedTotal),
        cashInflationEroded: Math.round(cashEroded),
        milestone,
      });
    }

    return data;
  }, [activePrincipal, activeMonthly, returnRate, years, inflationOn, baseCurrency]);

  const { profile } = useHardwareProfile();

  // Downsample to maxChartPoints using LTTB to eliminate SVG node bloat
  const displayChartData = useMemo(() => {
    if (chartData.length <= profile.maxChartPoints) {
      return chartData;
    }
    return downsampleLTTB(chartData, profile.maxChartPoints, 'year', 'compoundedGrowth');
  }, [chartData, profile.maxChartPoints]);

  const finalData = chartData[chartData.length - 1];
  const totalContributed = activePrincipal + activeMonthly * 12 * years;
  const interestEarned = finalData.compoundedGrowth - totalContributed;
  const gainMultiple = totalContributed > 0 ? (finalData.compoundedGrowth / totalContributed).toFixed(1) : '0';

  const milestones = chartData.filter((d) => d.milestone);

  const resetToRealBaseline = () => {
    playClickSound();
    setStartingPrincipal(null);
    setMonthly(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={24} className="text-amber-500" /> Wealth Time Machine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic compound simulator calibrated strictly to your live liquid net cash and average monthly savings rate.
          </p>
        </div>

        <button
          onClick={resetToRealBaseline}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer self-start sm:self-auto"
          title="Reset Sliders to Live SSOT Database Balances"
        >
          <RefreshCw size={13} />
          <span>Sync to Live Ledger</span>
        </button>
      </div>

      {/* Controls: Sliders for Principal, Monthly, Return Rate (3-15%), Horizon (1-30 yrs), & Inflation Toggle */}
      <div className="glass-card p-5 md:p-6 mb-6 bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Slider 1: Initial Starting Balance (P) — Bound to liquidCash */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Wallet size={13} className="text-cyan-500" /> Starting Cash ($P$)
              </label>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {formatCurrency(activePrincipal, baseCurrency)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPrincipal}
              step={baseCurrency === 'PKR' ? 1000 : 50}
              value={activePrincipal}
              onChange={(e) => setStartingPrincipal(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-[11px] text-slate-400 font-mono">
              <span>{formatCurrency(0, baseCurrency)}</span>
              <span>Live: {formatCurrency(livePrincipal, baseCurrency)}</span>
            </div>
          </div>

          {/* Slider 2: Monthly Contribution (PMT) — Bound to real monthly savings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Banknote size={13} className="text-purple-500" /> Monthly Save ($PMT$)
              </label>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                {formatCurrency(activeMonthly, baseCurrency)}/mo
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxMonthly}
              step={baseCurrency === 'PKR' ? 500 : 25}
              value={activeMonthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-[11px] text-slate-400 font-mono">
              <span>{formatCurrency(0, baseCurrency)}</span>
              <span>{formatCurrency(activeMonthly * 12, baseCurrency)}/yr</span>
            </div>
          </div>

          {/* Slider 3: Expected Return Rate Slider (3% to 15%) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Percent size={13} className="text-emerald-500" /> Return Rate
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{returnRate.toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min={3.0}
              max={15.0}
              step={0.5}
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex gap-1.5 mt-2">
              {[
                { label: 'Safe 5%', rate: 5.0 },
                { label: 'Index 9%', rate: 9.0 },
                { label: 'Alpha 14%', rate: 14.0 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setReturnRate(p.rate)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    returnRate === p.rate
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slider 4: Time Horizon Slider (1 to 30 years) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Clock size={13} className="text-cyan-500" /> Horizon
              </label>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-[11px] text-slate-400 font-mono">
              <span>1 yr</span>
              <span>15 yrs</span>
              <span>30 yrs</span>
            </div>
          </div>

          {/* 5. Inflation Adjustment Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
              Purchasing Power
            </label>
            <button
              onClick={() => setInflationOn(!inflationOn)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                inflationOn
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-aura-border'
              }`}
            >
              {inflationOn ? '📉 Inflation ON (3.5%)' : '📈 Nominal (Unadjusted)'}
            </button>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              {inflationOn ? 'Discounted for purchasing power' : 'Raw numerical compounding'}
            </p>
          </div>
        </div>
      </div>

      {/* Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 text-left border-rose-500/20 bg-white dark:bg-aura-card shadow-xs dark:shadow-none">
          <span className="text-2xl mb-2 block select-none">🛏️</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
            {inflationOn ? 'Cash in Bank (Inflation Eroded)' : 'Cash in Bank (Nominal)'}
          </p>
          <div className="mt-1 flex items-baseline justify-start">
            <FinancialMetric
              value={inflationOn ? finalData.cashInflationEroded : finalData.mattress}
              currency={baseCurrency}
              size="lg"
              color="text-rose-500 dark:text-rose-400 font-bold"
              align="left"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {inflationOn ? `Lost ${formatCurrency(finalData.mattress - finalData.cashInflationEroded, baseCurrency)} to 3.5% inflation` : 'Zero investment yield'}
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 text-left border-purple-500/20 bg-white dark:bg-aura-card shadow-xs dark:shadow-none">
          <span className="text-2xl mb-2 block select-none">🚀</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Compounded Market Growth</p>
          <div className="mt-1 flex items-baseline justify-start">
            <FinancialMetric
              value={finalData.compoundedGrowth}
              currency={baseCurrency}
              size="lg"
              color="text-purple-600 dark:text-purple-400 font-bold"
              align="left"
            />
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono tabular-nums">
            +{formatCurrency(interestEarned, baseCurrency)} pure yield ({gainMultiple}x multiple)
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 text-left border-emerald-500/20 bg-white dark:bg-aura-card shadow-xs dark:shadow-none">
          <span className="text-2xl mb-2 block select-none">💡</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Compound Arbitrage Advantage</p>
          <div className="mt-1 flex items-baseline justify-start">
            <FinancialMetric
              value={finalData.compoundedGrowth - (inflationOn ? finalData.cashInflationEroded : finalData.mattress)}
              currency={baseCurrency}
              size="lg"
              color="text-emerald-600 dark:text-emerald-400 font-bold"
              align="left"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Net wealth created above static bank storage</p>
        </motion.div>
      </div>

      {/* Dual-Area Chart: "Cash in Bank (Inflation Eroded)" vs. "Compounded Market Growth" */}
      <div className="glass-card p-5 mb-6 bg-white dark:bg-aura-card border border-slate-200/90 dark:border-aura-border shadow-xs dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">
            Trajectory: Compounded Market Growth vs. Inflation Erosion
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-purple-500" /> Compounded Market
            </span>
            <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Bank (Inflation Eroded)
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={displayChartData}>
            <defs>
              <linearGradient id="gradCompounded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEroded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Timeline (Years)',
                position: 'insideBottomRight',
                offset: -5,
                style: { fontSize: 11, fill: '#64748b' },
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                  ? `${(v / 1000).toFixed(0)}K`
                  : `${v}`
              }
            />
            <Tooltip
              contentStyle={{
                background: '#0c1222',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={((value: any, name: any) => [formatCurrency(Number(value), baseCurrency), name]) as any}
            />
            <Area
              type="monotone"
              dataKey="compoundedGrowth"
              stroke="#7c5cfc"
              fill="url(#gradCompounded)"
              strokeWidth={2.5}
              name="Compounded Market Growth"
            />
            <Area
              type="monotone"
              dataKey={inflationOn ? 'cashInflationEroded' : 'mattress'}
              stroke="#ef4444"
              fill="url(#gradEroded)"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Cash in Bank (Inflation Eroded)"
            />
            {milestones.map((m, i) => (
              <ReferenceLine
                key={i}
                x={m.year}
                stroke="rgba(124,92,252,0.4)"
                strokeDasharray="3 3"
                label={{ value: m.milestone || '', position: 'top', style: { fontSize: 10, fill: '#c084fc' } }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
