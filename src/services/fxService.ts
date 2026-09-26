// AuraFinance OS — FX Rate Service
import type { CurrencyCode } from '../store/useAppStore';
export type { CurrencyCode };

const FX_CACHE_KEY = 'aura_fx_cache';
const FX_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

interface FXCache {
  rates: Record<string, number>;
  timestamp: number;
}

export async function fetchFXRates(): Promise<{ rates: Record<string, number>; timestamp: string }> {
  // Check local cache first
  try {
    const cached = localStorage.getItem(FX_CACHE_KEY);
    if (cached) {
      const parsed: FXCache = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < FX_CACHE_DURATION) {
        return { rates: parsed.rates, timestamp: new Date(parsed.timestamp).toISOString() };
      }
    }
  } catch { /* ignore cache errors */ }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('FX API failed');
    const data = await res.json();
    
    const rates: Record<string, number> = data.rates;
    const cache: FXCache = { rates, timestamp: Date.now() };
    localStorage.setItem(FX_CACHE_KEY, JSON.stringify(cache));
    
    return { rates, timestamp: new Date().toISOString() };
  } catch {
    // Fallback rates
    const fallback: Record<string, number> = {
      USD: 1, EUR: 0.92, GBP: 0.79, PKR: 278.5, INR: 83.1,
      AED: 3.67, CAD: 1.36, JPY: 149.5
    };
    return { rates: fallback, timestamp: new Date().toISOString() };
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  if (!rates[from] || !rates[to]) return amount;
  const inUSD = amount / rates[from];
  return inUSD * rates[to];
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹',
    AED: 'د.إ', CAD: 'C$', JPY: '¥'
  };
  const symbol = symbols[currency] || currency;
  const decimals = currency === 'JPY' ? 0 : 2;
  
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toFixed(decimals)}`;
}

export function formatCurrencyFull(amount: number, currency: CurrencyCode): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹',
    AED: 'د.إ', CAD: 'C$', JPY: '¥'
  };
  const symbol = symbols[currency] || currency;
  const decimals = currency === 'JPY' ? 0 : 2;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export interface DeconstructedCurrency {
  symbol: string;
  integerPart: string;
  fractionPart: string;
  isNegative: boolean;
  rawString: string;
}

export function getCurrencySymbol(currency: CurrencyCode | string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹',
    AED: 'د.إ', CAD: 'C$', JPY: '¥'
  };
  return symbols[currency] || currency;
}

export function deconstructCurrency(
  amount: number,
  currency: CurrencyCode | string,
  decimals?: number
): DeconstructedCurrency {
  const symbol = getCurrencySymbol(currency);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const defaultDecimals = currency === 'PKR' || currency === 'JPY' ? 0 : 2;
  const targetDecimals = decimals !== undefined ? decimals : defaultDecimals;

  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: targetDecimals,
    maximumFractionDigits: targetDecimals,
  });

  const parts = formatted.split('.');
  const integerPart = parts[0];
  const fractionPart = parts[1] !== undefined ? `.${parts[1]}` : '';

  return {
    symbol,
    integerPart,
    fractionPart,
    isNegative,
    rawString: `${isNegative ? '-' : ''}${symbol}${formatted}`,
  };
}

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; name: string; flag: string }[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
];
