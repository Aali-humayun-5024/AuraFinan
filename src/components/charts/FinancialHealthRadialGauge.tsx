// AuraFinance OS — Glowing Radial Progress Gauge for Financial Health (0 - 1000)
import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import type { HealthScoreBreakdown } from '../../services/healthScoreService';
import RollingNumber from '../common/RollingNumber';

interface FinancialHealthRadialGaugeProps {
  breakdown: HealthScoreBreakdown;
  size?: number;
  showBreakdown?: boolean;
}

export default function FinancialHealthRadialGauge({
  breakdown,
  size = 140,
  showBreakdown = true,
}: FinancialHealthRadialGaugeProps) {
  const { score, savingsRateContrib, budgetAdherenceContrib, runwayContrib, badge, badgeColor, glowColor } = breakdown;

  // SVG Radial Geometry
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(Math.max(score / 1000, 0), 1);
  const strokeDashoffset = circumference * (1 - progressRatio);

  const getBadgeIcon = () => {
    switch (badge) {
      case 'Financial Sovereign':
        return Crown;
      case 'Wealth Builder':
        return ShieldCheck;
      case 'Balanced':
        return TrendingUp;
      case 'Vulnerable':
      default:
        return AlertTriangle;
    }
  };

  const BadgeIcon = getBadgeIcon();

  // Gradient ID
  const gradId = `health-grad-${score}`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* Glowing Radial SVG Ring */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Ambient Blur Glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700"
          style={{
            background: glowColor,
            opacity: 0.45,
          }}
        />

        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              {badge === 'Financial Sovereign' ? (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </>
              ) : badge === 'Wealth Builder' ? (
                <>
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </>
              ) : badge === 'Balanced' ? (
                <>
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb7185" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/[0.06]"
          />

          {/* Glowing Animated Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <span className="text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm">
            <RollingNumber value={score} />
          </span>
          <span className="text-[10px] uppercase font-bold text-aura-text-muted tracking-wider">
            / 1000
          </span>
        </div>
      </div>

      {/* Dynamic Status Badge and Pillar Breakdown */}
      <div className="flex-1 space-y-2.5 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm transition-colors ${badgeColor}`}>
            <BadgeIcon size={14} className="shrink-0" />
            <span>{badge}</span>
          </span>
          <span className="text-[11px] text-aura-text-muted font-medium">Karma & Health</span>
        </div>

        <p className="text-xs text-aura-text-secondary leading-relaxed max-w-sm">
          {breakdown.description}
        </p>

        {showBreakdown && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-aura-text-muted">Savings (400)</p>
              <p className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                +{savingsRateContrib}
              </p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-aura-text-muted">Budget (350)</p>
              <p className="text-xs font-bold text-cyan-400 font-mono tabular-nums">
                +{budgetAdherenceContrib}
              </p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-aura-text-muted">Runway (250)</p>
              <p className="text-xs font-bold text-violet-400 font-mono tabular-nums">
                +{runwayContrib}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
