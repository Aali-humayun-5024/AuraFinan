// AuraFinance OS — Global Real-Time Currency Engine Hook
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore, type CurrencyCode } from '../store/useAppStore';
import {
  fetchFXRates,
  convertCurrency,
  formatCurrency,
  formatCurrencyFull,
  getCurrencySymbol,
  deconstructCurrency,
} from '../services/fxService';

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string; flag: string }[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
];

export function useCurrency() {
  const { baseCurrency, setBaseCurrency, fxRates, setFxRates, fxLastUpdated } = useAppStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If rates are empty or older than 4 hours, fetch latest rates
    if (Object.keys(fxRates).length === 0) {
      setIsLoading(true);
      fetchFXRates()
        .then(({ rates, timestamp }) => {
          setFxRates(rates, timestamp);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to fetch FX rates');
          setIsLoading(false);
        });
    }
  }, [fxRates, setFxRates]);

  const convert = useCallback(
    (amount: number, from: string, to: string = baseCurrency): number => {
      return convertCurrency(amount, from, to, fxRates);
    },
    [baseCurrency, fxRates]
  );

  const convertToBase = useCallback(
    (amount: number, fromCurrency: string): number => {
      return convertCurrency(amount, fromCurrency, baseCurrency, fxRates);
    },
    [baseCurrency, fxRates]
  );

  const format = useCallback(
    (amount: number, currency: CurrencyCode = baseCurrency): string => {
      return formatCurrency(amount, currency);
    },
    [baseCurrency]
  );

  const formatFull = useCallback(
    (amount: number, currency: CurrencyCode = baseCurrency): string => {
      return formatCurrencyFull(amount, currency);
    },
    [baseCurrency]
  );

  const symbol = useMemo(() => getCurrencySymbol(baseCurrency), [baseCurrency]);

  return {
    baseCurrency,
    setBaseCurrency,
    rates: fxRates,
    lastUpdated: fxLastUpdated,
    isLoading,
    error,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    symbol,
    convert,
    convertToBase,
    format,
    formatFull,
    deconstructCurrency: (amount: number, currency: CurrencyCode = baseCurrency) =>
      deconstructCurrency(amount, currency),
  };
}

export default useCurrency;
