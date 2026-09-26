// AuraFinance OS — Multi-Dimensional Dynamic Bar Chart ("Impulse vs. Intent")
// Visualizes deliberate planned spending vs impulsive leakages
// Morph toggle between Daily Pulse, Weekly Velocity, and Monthly Cadence
import { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import { BarChart3, Sparkles, Filter } from 'lucide-react';
import { playClickSound } from '../../services/soundService';

type CadenceMode = 'daily' | 'weekly' | 'monthly';

export default function ImpulseIntentBarChart() {
  const { baseCurrency, theme } = useAppStore();
  const [cadence, setCadence] = useState<CadenceMode>('weekly');

  const chartData = useMemo(() => {
    if (cadence === 'daily') {
      return [
        { label: 'Mon', intent: 2400, impulse: 450, tag: 'Planned Grocery' },
        { label: 'Tue', intent: 1800, impulse: 300, tag: 'Disciplined' },
        { label: 'Wed', intent: 2100, impulse: 650, tag: 'Snack/Coffee' },
        { label: 'Thu', intent: 1900, impulse: 400, tag: 'On Target' },
        { label: 'Fri', intent: 3500, impulse: 1200, tag: 'Weekend Dining' },
        { label: 'Sat', intent: 5200, impulse: 2100, tag: 'Mandi & Outing' },
        { label: 'Sun', intent: 4100, impulse: 1800, tag: 'Family Dinner' },
      ];
    } else if (cadence === 'weekly') {
      return [
        { label: 'W1 (Rashan Restock)', intent: 38000, impulse: 4500, tag: 'Bulk Staples' },
        { label: 'W2 (Bills & Utilities)', intent: 28000, impulse: 3200, tag: 'Fixed Overheads' },
        { label: 'W3 (Mid-Month Midpoint)', intent: 16500, impulse: 2800, tag: 'Low Impulse Week' },
        { label: 'W4 (End Month Buffer)', intent: 19000, impulse: 3900, tag: 'Bachat Reserved' },
      ];
    } else {
      return [
        { label: 'Jun', intent: 88000, impulse: 14500, tag: 'Eid Festivities' },
        { label: 'Jul', intent: 76000, impulse: 9800, tag: 'Monsoon Saver' },
        { label: 'Aug', intent: 81000, impulse: 11200, tag: 'Independence Sale' },
        { label: 'Sep (Current)', intent: 84000, impulse: 8900, tag: '18% Impulse Reduction' },
      ];
    }
  }, [cadence]);

  const handleCadenceSwitch = (mode: CadenceMode) => {
    playClickSound();
    setCadence(mode);
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-aura-text flex items-center gap-2">
            <BarChart3 size={16} className="text-aura-accent" />
            Impulse vs. Intent Momentum
          </h3>
          <p className="text-xs text-aura-text-muted">
            Intentional budgeting (Blue) vs Impulse leakages (Pink)
          </p>
        </div>

        {/* Cadence Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-aura-border self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as CadenceMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleCadenceSwitch(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                cadence === mode
                  ? 'bg-aura-accent text-white shadow-md shadow-aura-accent/30'
                  : 'text-aura-text-muted hover:text-aura-text'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Glass Pillar Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="intentBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="impulseBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#be185d" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
            <XAxis dataKey="label" stroke={theme === 'dark' ? '#5a5a72' : '#94A3B8'} fontSize={11} tickLine={false} />
            <YAxis stroke={theme === 'dark' ? '#5a5a72' : '#94A3B8'} fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className={`p-3 rounded-2xl shadow-xl backdrop-blur-xl text-xs space-y-1.5 min-w-[180px] border ${
                      theme === 'dark'
                        ? 'bg-aura-card/95 border-white/10 text-white'
                        : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
                    }`}>
                      <p className="font-bold text-aura-text">{label}</p>
                      <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                        <span>Intentional:</span>
                        <span className="font-bold">{formatCurrency(dataPoint.intent, baseCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-pink-600 dark:text-pink-400">
                        <span>Impulse:</span>
                        <span className="font-bold">{formatCurrency(dataPoint.impulse, baseCurrency)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-aura-border flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Sparkles size={11} /> {dataPoint.tag}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="intent"
              name="Planned Intent"
              fill="url(#intentBarGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
            />
            <Bar
              dataKey="impulse"
              name="Impulse Leakage"
              fill="url(#impulseBarGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between pt-3 border-t border-aura-border text-xs text-aura-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          Planned Intent: <strong>86% of Outflows</strong>
        </span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <Sparkles size={12} /> Impulse leakage down 14% this period
        </span>
      </div>
    </div>
  );
}
