// AuraFinance OS — Rolling Number Spring Counter
import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface RollingNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function RollingNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: RollingNumberProps) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const [displayValue, setDisplayValue] = useState<string>('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      const formatted = latest.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      setDisplayValue(formatted);
    });
    return () => unsubscribe();
  }, [spring, decimals]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
