// AuraFinance OS — Strict Commodities & Precious Metals Type Definitions
export type PreciousMetalType = 'gold' | 'silver' | 'platinum';
export type WeightUnit = 'grams' | 'troy_ounce' | 'tola' | 'kilograms';
export type GoldKarat = '24k' | '22k' | '21k' | '18k';
export type SilverPurity = '999' | '925';
export type PlatinumPurity = '950';

export interface CommodityHolding {
  id?: number;
  metal: PreciousMetalType;
  purity: GoldKarat | SilverPurity | PlatinumPurity;
  quantity: number;               // Raw numeric quantity in selected unit
  unit: WeightUnit;
  weightInGrams: number;          // Normalized baseline weight
  purchaseDate: string;           // ISO 8601
  costBasisTotal: number;         // Original purchase cost in original currency
  costBasisCurrency: string;
  currentSpotPricePerGram: number;// Live calculated spot price in base currency
  currentValueBaseCurrency: number; // Evaluated value in current base currency
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
  linkedAccountId: string;        // e.g. "1060" Bullion Asset Account
  notes?: string;
  createdAt?: string;
}

export interface CommodityMarketRates {
  lastUpdated: string;
  baseCurrency: string;
  rates: {
    gold24kPerGram: number;
    silver999PerGram: number;
    platinum950PerGram: number;
  };
  ounceRatesUSD: {
    goldUSDPerOunce: number;
    silverUSDPerOunce: number;
    platinumUSDPerOunce: number;
  };
  trends: {
    gold24k24hChangePct: number;
    silver99924hChangePct: number;
    platinum95024hChangePct: number;
  };
}

export interface WeightBreakdown {
  grams: number;
  troyOunces: number;
  tolas: number;
  kilograms: number;
  masha: number;
  ratti: number;
}
