import React from 'react';
import { PrecisionMath } from '../../utils/financialMath';

interface AccurateDisplayProps {
  value: number;
  currency: string;
  decimals?: number;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReconciledValueDisplay: React.FC<AccurateDisplayProps> = ({
  value,
  currency,
  decimals = 2,
  label,
  unit,
  size = 'md',
  className = '',
}) => {
  const safeValue = isNaN(value) ? 0 : PrecisionMath.round(value, decimals);
  const parts = safeValue.toFixed(decimals).split('.');
  const integerPart = Number(parts[0]).toLocaleString();
  const decimalPart = parts[1];

  const sizeClasses = {
    sm: {
      curr: 'text-xs',
      int: 'text-lg sm:text-xl font-bold',
      dec: 'text-[11px]',
    },
    md: {
      curr: 'text-sm font-semibold',
      int: 'text-2xl sm:text-3xl font-bold',
      dec: 'text-xs sm:text-sm font-medium',
    },
    lg: {
      curr: 'text-base font-semibold',
      int: 'text-3xl sm:text-4xl font-extrabold',
      dec: 'text-sm sm:text-base font-semibold',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col text-start ${className}`}>
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-aura-text-muted select-none">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className={`${currentSize.curr} text-aura-text-secondary select-none`}>
          {currency}
        </span>
        <span className={`${currentSize.int} tracking-tight text-aura-text tabular-nums`}>
          {integerPart}
        </span>
        {decimals > 0 && (
          <span className={`${currentSize.dec} text-aura-text-muted tabular-nums`}>
            .{decimalPart}
          </span>
        )}
        {unit && (
          <span className="text-xs font-mono font-medium text-amber-500 dark:text-amber-400 ms-1 uppercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReconciledValueDisplay;
