// AuraFinance OS — Master Specification Standard Metric Bento Card
import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  label: string;
  integerAmount: string;
  decimalAmount?: string;
  currencySymbol: string;
  percentageChange?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  comparisonText: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StandardMetricBentoCard: React.FC<MetricCardProps> = ({
  label,
  integerAmount,
  decimalAmount = '00',
  currencySymbol,
  percentageChange = '+0.0%',
  trendDirection = 'up',
  comparisonText,
  icon,
  onClick,
  className = '',
}) => {
  const isPositive = trendDirection === 'up';

  return (
    <div
      onClick={onClick}
      className={`group relative p-6 rounded-3xl transition-all duration-300 ease-out cursor-default
      /* Surface & Transparency */
      bg-white dark:bg-[#0D121E]/70 backdrop-blur-2xl
      /* Sub-pixel Crystalline Borders */
      border border-slate-200/90 dark:border-white/[0.08]
      /* Multi-layered Soft Shadows */
      shadow-[0_1px_3px_rgba(15,23,42,0.03),0_10px_30px_-5px_rgba(15,23,42,0.04)]
      dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.40)]
      /* Interactive Elevation Hover */
      hover:border-slate-300 dark:hover:border-white/[0.18]
      hover:shadow-[0_12px_40px_-6px_rgba(15,23,42,0.08)]
      dark:hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.60)]
      hover:-translate-y-[1px] ${className}`}
    >
      {/* Top Header: Label (Left) and Trend Badge / Icon (Right) */}
      <div className="h-6 flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
          {label}
        </span>

        {/* Trend Indicator Pill or Custom Icon */}
        <div className="flex items-center gap-2">
          {percentageChange && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                isPositive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
              ) : (
                <ArrowDownRight className="w-3 h-3 flex-shrink-0" />
              )}
              <span>{percentageChange}</span>
            </div>
          )}
          {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
        </div>
      </div>

      {/* Hero Financial Value with Optical Sub-Unit Alignment */}
      <div className="flex items-baseline gap-1 my-1">
        {/* 1. Currency Marker: 45% Opacity, medium weight */}
        <span className="text-sm font-semibold tracking-tight text-slate-500 dark:text-slate-400 select-none">
          {currencySymbol}
        </span>

        {/* 2. Primary Integer Head: Bold, dominant, tracking-tight */}
        <span className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {integerAmount}
        </span>

        {/* 3. Fractional Cents: Smaller, sharing exact typographic baseline */}
        {decimalAmount && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            .{decimalAmount}
          </span>
        )}
      </div>

      {/* Subtext Footnote */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="truncate">{comparisonText}</span>
      </div>
    </div>
  );
};

export default StandardMetricBentoCard;
