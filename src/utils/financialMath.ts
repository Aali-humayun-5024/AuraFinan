// AuraFinance OS — Centralized Financial Math & Commodity Conversion Utility
// Eliminates IEEE 754 binary floating-point drift with integer-cents & basis-point precision

import type { PreciousMetalType, WeightUnit, WeightBreakdown } from '../types/commodities';

// Constants for precision conversions
export const TROY_OUNCE_IN_GRAMS = 31.1034768;
export const TOLA_IN_GRAMS = 11.6638;
export const MASHA_PER_TOLA = 12;
export const RATTI_PER_TOLA = 96;
export const MASHA_IN_GRAMS = TOLA_IN_GRAMS / MASHA_PER_TOLA; // ~0.971983 g
export const RATTI_IN_GRAMS = TOLA_IN_GRAMS / RATTI_PER_TOLA; // ~0.121498 g

export const PrecisionMath = {
  // Round to exact decimal places without floating-point artifacts
  round: (num: number, decimals = 2): number => {
    if (isNaN(num) || !isFinite(num)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  },

  // Integer-cents safe addition
  add: (a: number, b: number, decimals = 2): number => {
    const factor = Math.pow(10, decimals);
    return (Math.round((a || 0) * factor) + Math.round((b || 0) * factor)) / factor;
  },

  // Integer-cents safe subtraction
  sub: (a: number, b: number, decimals = 2): number => {
    const factor = Math.pow(10, decimals);
    return (Math.round((a || 0) * factor) - Math.round((b || 0) * factor)) / factor;
  },

  // Safe multiplication rounded to target decimals
  mul: (a: number, b: number, decimals = 2): number => {
    if (!a || !b || isNaN(a) || isNaN(b)) return 0;
    return PrecisionMath.round(a * b, decimals);
  },

  // Safe division avoiding zero divide and NaN
  div: (a: number, b: number, decimals = 2): number => {
    if (!b || isNaN(a) || isNaN(b) || b === 0) return 0;
    return PrecisionMath.round(a / b, decimals);
  },

  // Calculate percentage variance strictly clamped and rounded
  variance: (actual: number, benchmark: number): { diff: number; pct: number } => {
    const safeActual = isNaN(actual) ? 0 : actual;
    const safeBenchmark = isNaN(benchmark) ? 0 : benchmark;
    const diff = safeActual - safeBenchmark;
    const pct = safeBenchmark !== 0 ? (diff / safeBenchmark) * 100 : 0;
    return {
      diff: PrecisionMath.round(diff, 2),
      pct: PrecisionMath.round(pct, 2),
    };
  },

  // Weight Unit Converter to Standard Grams
  toGrams: (weight: number, unit: WeightUnit): number => {
    const safeW = isNaN(weight) || weight < 0 ? 0 : weight;
    switch (unit) {
      case 'grams':
        return safeW;
      case 'troy_ounce':
        return PrecisionMath.round(safeW * TROY_OUNCE_IN_GRAMS, 6);
      case 'tola':
        return PrecisionMath.round(safeW * TOLA_IN_GRAMS, 6);
      case 'kilograms':
        return PrecisionMath.round(safeW * 1000, 6);
      default:
        return safeW;
    }
  },

  // Convert Grams to any target unit
  fromGrams: (grams: number, unit: WeightUnit): number => {
    const safeG = isNaN(grams) || grams < 0 ? 0 : grams;
    switch (unit) {
      case 'grams':
        return PrecisionMath.round(safeG, 4);
      case 'troy_ounce':
        return PrecisionMath.round(safeG / TROY_OUNCE_IN_GRAMS, 4);
      case 'tola':
        return PrecisionMath.round(safeG / TOLA_IN_GRAMS, 4);
      case 'kilograms':
        return PrecisionMath.round(safeG / 1000, 5);
      default:
        return safeG;
    }
  },

  // Dynamic Purity Multiplier
  getPurityMultiplier: (metal: PreciousMetalType, purity: string): number => {
    if (metal === 'gold') {
      const p = purity.toLowerCase();
      switch (p) {
        case '24k':
          return 1.0;
        case '22k':
          return 0.9167;
        case '21k':
          return 0.875;
        case '18k':
          return 0.75;
        default:
          return 1.0;
      }
    }
    if (metal === 'silver') {
      return purity === '925' ? 0.925 : 1.0;
    }
    // Platinum default Pt 950
    return 0.95;
  },

  // Detailed sub-unit breakdown (Grams, Tolas, Masha, Ratti, Troy Oz)
  decomposeWeight: (weightInGrams: number): WeightBreakdown => {
    const safeG = Math.max(0, isNaN(weightInGrams) ? 0 : weightInGrams);
    const tolasTotal = safeG / TOLA_IN_GRAMS;
    const tolas = Math.floor(tolasTotal);
    const remainderGrams = safeG - tolas * TOLA_IN_GRAMS;
    const mashaTotal = remainderGrams / MASHA_IN_GRAMS;
    const masha = Math.floor(mashaTotal);
    const rattiRemainderG = remainderGrams - masha * MASHA_IN_GRAMS;
    const ratti = PrecisionMath.round(rattiRemainderG / RATTI_IN_GRAMS, 1);

    return {
      grams: PrecisionMath.round(safeG, 3),
      troyOunces: PrecisionMath.round(safeG / TROY_OUNCE_IN_GRAMS, 4),
      tolas: PrecisionMath.round(tolasTotal, 3),
      kilograms: PrecisionMath.round(safeG / 1000, 4),
      masha,
      ratti,
    };
  },

  // Mathematical Valuation for a commodity holding
  // Quantity in unit -> Grams -> Purity Adjustment -> Multiplied by Spot Price per Gram
  calculateValuation: (
    quantity: number,
    unit: WeightUnit,
    metal: PreciousMetalType,
    purity: string,
    spotPricePerGram: number
  ): {
    weightInGrams: number;
    effectiveFineGrams: number;
    valuation: number;
  } => {
    const weightInGrams = PrecisionMath.toGrams(quantity, unit);
    const purityMultiplier = PrecisionMath.getPurityMultiplier(metal, purity);
    const effectiveFineGrams = PrecisionMath.round(weightInGrams * purityMultiplier, 4);
    const valuation = PrecisionMath.round(effectiveFineGrams * spotPricePerGram, 2);

    return {
      weightInGrams: PrecisionMath.round(weightInGrams, 4),
      effectiveFineGrams,
      valuation,
    };
  },
};
