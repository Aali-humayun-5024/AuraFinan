// AuraFinance OS — Wealth Time Machine (Compound Interest Simulator)
// Interactive Sliders for Monthly Contribution, Expected Return Rate (3% to 15%), Time Horizon (1 to 30 yrs),
// Inflation Adjustment Toggle, and Dual-Area Chart ("Cash in Bank (Inflation Eroded)" vs "Compounded Market Growth")
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useHardwareProfile } from '../context/HardwareProfileContext';
import { downsampleLTTB } from '../utils/lttb';
import { formatCurrency } from '../services/fxService';
import FinancialMetric from '../components/common/FinancialMetric';
import { Sparkles, TrendingUp, Award, Banknote, Flame, Percent, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TimeMachineView() {
  const { baseCurrency } = useAppStore();

  const defaultMonthly = baseCurrency === 'PKR' ? 15000 : 250;
  const [monthly, setMonthly] = useState<number>(defaultMonthly);
  const [returnRate, setReturnRate] = useState<number>(9.0); // 3% to 15%
  const [years, setYears] = useState<number>(15); // 1 to 30 years
  const [inflationOn, setInflationOn] = useState<boolean>(true);

  const inflationRate = 3.5;

  const chartData = useMemo(() => {
    const data: {
      year: number;
      mattress: number;
      compoundedGrowth: number;
      cashInflationEroded: number;
      milestone?: string;
    }[] = [];

    const r = returnRate / 100;
    const inf = inflationRate / 100;

    for (let y = 0; y <= years; y++) {
      const nominalContributed = monthly * 12 * y;
      let investedTotal = 0;

      if (y === 0) {
        investedTotal = 0;
      } else {
        investedTotal = monthly * 12 * ((Math.pow(1 + r, y) - 1) / r);
      }

      // Cash in bank eroded by inflation
      const cashEroded = inflationOn ? nominalContributed / Math.pow(1 + inf, y) : nominalContributed;

      let milestone: string | undefined;
      const milestoneTargetMultiplier = baseCurrency === 'PKR' ? 280 : 1;
      if (
        investedTotal >= 10000 * milestoneTargetMultiplier &&
        (y === 0 || monthly * 12 * ((Math.pow(1 + r, y - 1) - 1) / r) < 10000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Emergency Fund 🛡️';
      }
      if (
        investedTotal >= 100000 * milestoneTargetMultiplier &&
        (y === 0 || monthly * 12 * ((Math.pow(1 + r, y - 1) - 1) / r) < 100000 * milestoneTargetMultiplier)
      ) {
        milestone = 'College / Real Estate 🎓';
      }
      if (
        investedTotal >= 500000 * milestoneTargetMultiplier &&
        (y === 0 || monthly * 12 * ((Math.pow(1 + r, y - 1) - 1) / r) < 500000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Financial Freedom 🏝️';
      }
      if (
        investedTotal >= 1000000 * milestoneTargetMultiplier &&
        (y === 0 || monthly * 12 * ((Math.pow(1 + r, y - 1) - 1) / r) < 1000000 * milestoneTargetMultiplier)
      ) {
        milestone = 'Millionaire Sovereign 💎';
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
  }, [monthly, returnRate, years, inflationOn, baseCurrency]);

  const { profile } = useHardwareProfile();

  // Downsample to maxChartPoints using LTTB to eliminate SVG node bloat
  const displayChartData = useMemo(() => {
    if (chartData.length <= profile.maxChartPoints) {
      return chartData;
    }
    return downsampleLTTB(chartData, profile.maxChartPoints, 'year', 'compoundedGrowth');
  }, [chartData, profile.maxChartPoints]);

  const finalData = chartData[chartData.length - 1];
  const totalContributed = monthly * 12 * years;
  const interestEarned = finalData.compoundedGrowth - totalContributed;
  const gainMultiple = totalContributed > 0 ? (finalData.compoundedGrowth / totalContributed).toFixed(1) : '0';

  const milestones = chartData.filter((d) => d.milestone);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-aura-text flex items-center gap-2">
          <Sparkles size={24} className="text-aura-amber" /> Wealth Time Machine
        </h1>
        <p className="text-sm text-aura-text-muted mt-1">
          Compound simulator comparing "Cash in Bank (Inflation Eroded)" vs. "Compounded Market Growth"
        </p>
      </div>

      {/* Controls: Sliders for Monthly, Return Rate (3-15%), Horizon (1-30 yrs), & Inflation Toggle */}
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Monthly Contribution Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider flex items-center gap-1">
                <Banknote size={13} className="text-aura-accent" /> Monthly Contribution
              </label>
              <span className="text-xs font-mono font-bold text-aura-accent">
                {formatCurrency(monthly, baseCurrency)}/mo
              </span>
            </div>
            <input
              type="range"
              min={baseCurrency === 'PKR' ? 1000 : 25}
              max={baseCurrency === 'PKR' ? 300000 : 5000}
              step={baseCurrency === 'PKR' ? 1000 : 25}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="w-full accent-aura-accent cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-[11px] text-aura-text-muted font-mono">
              <span>{formatCurrency(baseCurrency === 'PKR' ? 1000 : 25, baseCurrency)}</span>
              <span>{formatCurrency(monthly * 12, baseCurrency)}/yr</span>
            </div>
          </div>

          {/* 2. Expected Return Rate Slider (3% to 15%) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider flex items-center gap-1">
                <Percent size={13} className="text-emerald-400" /> Return Rate (3% - 15%)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{returnRate.toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min={3.0}
              max={15.0}
              step={0.5}
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex gap-1.5 mt-2">
              {[
                { label: 'Safe 5%', rate: 5.0 },
                { label: 'Index 9%', rate: 9.0 },
                { label: 'Aggressive 14%', rate: 14.0 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setReturnRate(p.rate)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    returnRate === p.rate
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/[0.04] text-aura-text-muted border border-white/[0.06] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Time Horizon Slider (1 to 30 years) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider flex items-center gap-1">
                <Clock size={13} className="text-aura-cyan" /> Time Horizon (1 - 30 yrs)
              </label>
              <span className="text-xs font-mono font-bold text-aura-cyan">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-aura-cyan cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-[11px] text-aura-text-muted font-mono">
              <span>1 yr</span>
              <span>15 yrs</span>
              <span>30 yrs</span>
            </div>
          </div>

          {/* 4. Inflation Adjustment Toggle */}
          <div>
            <label className="text-xs font-semibold text-aura-text-muted uppercase tracking-wider mb-2 block">
              📉 Inflation Adjustment
            </label>
            <button
              onClick={() => setInflationOn(!inflationOn)}
              className={`w-full py-3 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                inflationOn
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-white/[0.04] text-aura-text-muted border border-aura-border'
              }`}
            >
              {inflationOn ? '📉 Inflation Erosion ON (3.5%)' : '📈 Inflation OFF (Nominal)'}
            </button>
            <p className="text-[10px] text-aura-text-muted mt-2 text-center">
              {inflationOn ? 'Adjusting for purchasing power decay' : 'Showing raw unadjusted sums'}
            </p>
          </div>
        </div>
      </div>

      {/* Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 text-left border-rose-500/20">
          <span className="text-2xl mb-2 block select-none">🛏️</span>
          <p className="text-xs text-aura-text-muted uppercase font-semibold tracking-wider">
            {inflationOn ? 'Cash in Bank (Inflation Eroded)' : 'Cash in Bank (Nominal)'}
          </p>
          <div className="mt-1 flex items-baseline justify-start">
            <FinancialMetric
              value={inflationOn ? finalData.cashInflationEroded : finalData.mattress}
              currency={baseCurrency}
              size="lg"
              color="text-rose-400 font-bold"
              align="left"
            />
          </div>
          <p className="text-xs text-aura-text-muted mt-1.5">
            {inflationOn ? `Lost ${formatCurrency(finalData.mattress - finalData.cashInflationEroded, baseCurrency)} to 3.5% inflation` : 'Zero investment yield'}
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 text-left border-aura-accent/30">
          <span className="text-2xl mb-2 block select-none">🚀</span>
          <p className="text-xs text-aura-text-muted uppercase font-semibold tracking-wider">Compounded Market Growth</p>
          <div className="mt-1 flex items-baseline justify-start">
            <FinancialMetric
              value={finalData.compoundedGrowth}
              currency={baseCurrency}
              size="lg"
              color="text-aura-accent font-bold"
              align="left"
            />
          </div>
          <p className="text-xs text-aura-green mt-1.5 font-mono tabular-nums">
            +{formatCurrency(interestEarned, baseCurrency)} pure yield ({gainMultiple}x multiple)
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 text-left border-emerald-500/20">
          <span className="text-2xl mb-2 block select-none">💡</span>
          <p className="text-xs text-aura-text-muted uppercase font-semibold tracking-wider">Compound Arbitrage Advantage</p>
          <div className="mt-1 flex items-baseline justify-start">
            <FinancialMetric
              value={finalData.compoundedGrowth - (inflationOn ? finalData.cashInflationEroded : finalData.mattress)}
              currency={baseCurrency}
              size="lg"
              color="text-emerald-400 font-bold"
              align="left"
            />
          </div>
          <p className="text-xs text-aura-text-muted mt-1.5">Net wealth created above static bank storage</p>
        </motion.div>
      </div>

      {/* Dual-Area Chart: "Cash in Bank (Inflation Eroded)" vs. "Compounded Market Growth" */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-aura-text">
            Trajectory: Compounded Market Growth vs. Cash in Bank (Inflation Eroded)
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-aura-accent">
              <span className="w-3 h-3 rounded-full bg-[#7c5cfc]" /> Compounded Market Growth
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]" /> Cash in Bank (Inflation Eroded)
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
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
