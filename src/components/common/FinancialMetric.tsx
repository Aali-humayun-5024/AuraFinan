// AuraFinance OS — Financial Baseline Metric Display
// Standardized FinTech Typographic Cadence:
// - Optical Baseline flex alignment (items-baseline gap-1)
// - Sub-unit fraction & currency symbol isolation
// - Strict tabular-nums to prevent rolling jitter
// - Left-aligned hero scalars, Right-aligned list/table amounts, Centered badges

import React, { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';
import { deconstructCurrency, type CurrencyCode } from '../../services/fxService';

export interface FinancialMetricProps {
  value: number;
  currency?: CurrencyCode | string;
  align?: 'left' | 'right' | 'center';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  color?: string;
  symbolColor?: string;
  fractionColor?: string;
  decimals?: number;
  prefixSign?: '+' | '-' | '';
  suffix?: React.ReactNode;
  isAnimated?: boolean;
  className?: string;
}

export default function FinancialMetric({
  value,
  currency = 'PKR',
  align = 'left',
  size = 'md',
  color = 'text-aura-text',
  symbolColor = 'text-aura-text-muted',
  fractionColor = 'text-aura-text-muted',
  decimals,
  prefixSign,
  suffix,
  isAnimated = false,
  className = '',
}: FinancialMetricProps) {
  // Direct deconstruction for non-animated or initial render
  const initial = deconstructCurrency(value, currency, decimals);
  const [animatedInteger, setAnimatedInteger] = useState(initial.integerPart);
  const [animatedFraction, setAnimatedFraction] = useState(initial.fractionPart);

  const spring = useSpring(Math.abs(value), { stiffness: 95, damping: 22 });

  useEffect(() => {
    if (isAnimated) {
      spring.set(Math.abs(value));
    }
  }, [value, spring, isAnimated]);

  useEffect(() => {
    if (!isAnimated) return;

    const unsubscribe = spring.on('change', (latest) => {
      const deconstructed = deconstructCurrency(latest, currency, decimals);
      setAnimatedInteger(deconstructed.integerPart);
      setAnimatedFraction(deconstructed.fractionPart);
    });

    return () => unsubscribe();
  }, [spring, isAnimated, currency, decimals]);

  const displayInteger = isAnimated ? animatedInteger : initial.integerPart;
  const displayFraction = isAnimated ? animatedFraction : initial.fractionPart;
  const showNegative = initial.isNegative || prefixSign === '-';
  const showPositive = prefixSign === '+';

  // Size definitions for typographic cadence
  const sizeStyles = {
    xs: {
      gap: 'gap-0.5',
      symbol: 'text-[10px] font-medium',
      integer: 'text-xs font-bold',
      fraction: 'text-[9px] font-medium',
    },
    sm: {
      gap: 'gap-0.5',
      symbol: 'text-xs font-semibold',
      integer: 'text-sm font-bold',
      fraction: 'text-[10px] font-medium',
    },
    md: {
      gap: 'gap-1',
      symbol: 'text-xs sm:text-sm font-semibold',
      integer: 'text-base sm:text-lg font-bold',
      fraction: 'text-[11px] sm:text-xs font-medium',
    },
    lg: {
      gap: 'gap-1',
      symbol: 'text-sm font-semibold',
      integer: 'text-xl sm:text-2xl font-black',
      fraction: 'text-xs sm:text-sm font-medium',
    },
    xl: {
      gap: 'gap-1',
      symbol: 'text-sm font-semibold',
      integer: 'text-2xl sm:text-3xl font-black tracking-tight',
      fraction: 'text-xs sm:text-sm font-medium',
    },
    hero: {
      gap: 'gap-1.5',
      symbol: 'text-base sm:text-lg font-semibold',
      integer: 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight',
      fraction: 'text-sm sm:text-base font-medium',
    },
  }[size];

  const justifyClass = {
    left: 'justify-start text-left',
    right: 'justify-end text-right',
    center: 'justify-center text-center',
  }[align];

  return (
    <div
      className={`inline-flex items-baseline ${sizeStyles.gap} ${justifyClass} ${className}`}
    >
      {/* Sign */}
      {showNegative && (
        <span className={`${sizeStyles.symbol} ${color} select-none mr-0.5`}>-</span>
      )}
      {showPositive && (
        <span className={`${sizeStyles.symbol} ${color} select-none mr-0.5`}>+</span>
      )}

      {/* Currency Symbol */}
      <span
        className={`${sizeStyles.symbol} ${symbolColor} select-none tabular-nums`}
        aria-hidden="true"
      >
        {initial.symbol}
      </span>

      {/* Integer Head */}
      <span
        className={`${sizeStyles.integer} ${color} tabular-nums font-mono leading-none`}
      >
        {displayInteger}
      </span>

      {/* Fractional Cents */}
      {displayFraction ? (
        <span
          className={`${sizeStyles.fraction} ${fractionColor} tabular-nums font-mono leading-none select-none`}
        >
          {displayFraction}
        </span>
      ) : null}

      {/* Optional Suffix (e.g. /mo, /yr, /kg) */}
      {suffix && (
        <span className={`${sizeStyles.fraction} ${symbolColor} ml-1 select-none`}>
          {suffix}
        </span>
      )}
    </div>
  );
}
