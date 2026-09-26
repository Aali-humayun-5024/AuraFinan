// AuraFinance OS — Debounced Reactive Stream Hook for Dexie.js
// Eliminates high-frequency main-thread stuttering by debouncing IndexedDB updates by >=150ms

import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect, useRef } from 'react';

/**
 * Debounced live query hook for Dexie.js
 * Batches rapid reactive updates (e.g. rapid keypresses, batch imports)
 * to prevent layout recalculation churn and GC spikes.
 */
export function useDebouncedLiveQuery<T>(
  querier: () => Promise<T> | T,
  deps: any[] = [],
  defaultValue?: T,
  delayMs: number = 150
): T | undefined {
  const rawValue = useLiveQuery(querier, deps, defaultValue);
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(rawValue ?? defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Immediate return on initial render to prevent layout flash
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDebouncedValue(rawValue);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(rawValue);
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [rawValue, delayMs]);

  return debouncedValue;
}
