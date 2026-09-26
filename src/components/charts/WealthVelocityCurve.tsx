// AuraFinance OS — "Wealth Velocity" Compound Area Curve
// Compares: (1) Cash In Bank (eroded by inflation), (2) Index Fund/Kameti, (3) Optimized Strategy
// Includes interactive laser prediction timeline
import { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useHardwareProfile } from '../../context/HardwareProfileContext';
import { downsampleLTTB } from '../../utils/lttb';
import { formatCurrency } from '../../services/fxService';
import { TrendingUp, Sparkles, AlertCircle, Compass } from 'lucide-react';
import { playClickSound } from '../../services/soundService';

export default function WealthVelocityCurve() {
  const { baseCurrency, theme } = useAppStore();
  const [horizonYears, setHorizonYears] = useState<number>(10);
  const [activePoint, setActivePoint] = useState<any>(null);

  // Generate projections based on horizon
  const projectionData = useMemo(() => {
    const data = [];
    const currentYear = new Date().getFullYear();
    const monthlyDeposit = 35000; // Monthly savings in PKR
    let cash = 100000;
    let safeIndex = 100000;
    let optimizedBachat = 100000;

    for (let yr = 0; yr <= horizonYears; yr++) {
      const yearLabel = (currentYear + yr).toString();

      if (yr > 0) {
        // Cash in bank eroded by inflation (-6% real purchasing power)
        cash = (cash + monthlyDeposit * 12) * 0.94;

        // Safe Index Fund / Kameti (compounded at +12% annual)
        safeIndex = (safeIndex + monthlyDeposit * 12) * 1.12;

        // Optimized AI Strategy with Rashan & Wholesale Bachat (+ ₨ 6,500/mo extra saved & invested at +15%)
        optimizedBachat = (optimizedBachat + (monthlyDeposit + 6500) * 12) * 1.15;
      }

      data.push({
        year: yearLabel,
        cash: Math.round(cash),
        safeGrowth: Math.round(safeIndex),
        optimized: Math.round(optimizedBachat),
        crossoverPassed: yr >= 5,
      });
    }
    return data;
  }, [horizonYears]);

  const { profile } = useHardwareProfile();

  // Downsample projection points to profile.maxChartPoints via LTTB to eliminate SVG node bloat
  const displayData = useMemo(() => {
    if (projectionData.length <= profile.maxChartPoints) {
      return projectionData;
    }
    return downsampleLTTB(projectionData, profile.maxChartPoints, 'year', 'optimized');
  }, [projectionData, profile.maxChartPoints]);

  return (
    <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-aura-text flex items-center gap-2">
            <Compass size={16} className="text-emerald-400" />
            "Wealth Velocity" Compound Projections
          </h3>
          <p className="text-xs text-aura-text-muted">
            Inflation erosion vs Safe compounding vs AI Bachat Strategy
          </p>
        </div>

        {/* Horizon Slider */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[5, 10, 20].map((yrs) => (
            <button
              key={yrs}
              onClick={() => {
                playClickSound();
                setHorizonYears(yrs);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                horizonYears === yrs
                  ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/30'
                  : 'bg-white/5 text-aura-text-muted hover:text-aura-text'
              }`}
            >
              {yrs} Years
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload) {
                setActivePoint(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setActivePoint(null)}
          >
            <defs>
              <linearGradient id="optimizedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
            <XAxis dataKey="year" stroke={theme === 'dark' ? '#5a5a72' : '#94A3B8'} fontSize={11} tickLine={false} />
            <YAxis stroke={theme === 'dark' ? '#5a5a72' : '#94A3B8'} fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className={`p-3 rounded-2xl shadow-xl backdrop-blur-xl text-xs space-y-1.5 min-w-[200px] border ${
                      theme === 'dark'
                        ? 'bg-aura-card/95 border-white/10 text-white'
                        : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
                    }`}>
                      <p className="font-bold text-aura-text">Year {pt.year}</p>
                      <div className="flex items-center justify-between text-aura-accent">
                        <span>AI Bachat Strategy:</span>
                        <span className="font-bold">{formatCurrency(pt.optimized, baseCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Index / Kameti Fund:</span>
                        <span className="font-bold">{formatCurrency(pt.safeGrowth, baseCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                        <span>Idle Cash (Eroded):</span>
                        <span className="font-bold">{formatCurrency(pt.cash, baseCurrency)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* 3 Area Curves */}
            <Area type="monotone" dataKey="optimized" stroke="#7c5cfc" strokeWidth={2.5} fill="url(#optimizedGrad)" />
            <Area type="monotone" dataKey="safeGrowth" stroke="#10b981" strokeWidth={2} fill="url(#safeGrad)" />
            <Area type="monotone" dataKey="cash" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#cashGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Laser Prediction Callout */}
      <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/30 via-aura-card to-emerald-950/20 border border-aura-accent/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <p className="text-xs text-aura-text font-medium">
            <strong>Laser Horizon Prediction:</strong> By year{' '}
            <span className="text-emerald-400 font-bold">
              {activePoint ? activePoint.year : new Date().getFullYear() + 5}
            </span>
            , your monthly compounding gains surpass your active monthly household labor!
          </p>
        </div>
        <span className="text-[10px] uppercase font-bold text-aura-accent px-2 py-1 rounded-lg bg-aura-accent/15 shrink-0">
          Crossover Point
        </span>
      </div>
    </div>
  );
}
