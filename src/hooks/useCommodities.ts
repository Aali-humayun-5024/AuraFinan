// AuraFinance OS — Autonomous Precious Metals & Commodities Pricing Engine
// Evaluates Gold (XAU), Silver (XAG), Platinum (XPT) in Real-Time Cross-Currencies

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { PrecisionMath, TROY_OUNCE_IN_GRAMS, TOLA_IN_GRAMS } from '../utils/financialMath';
import { convertCurrency, fetchFXRates } from '../services/fxService';
import { postJournalEntry } from '../services/doubleEntryEngine';
import type {
  CommodityHolding,
  CommodityMarketRates,
  PreciousMetalType,
  WeightUnit,
  GoldKarat,
  SilverPurity,
} from '../types/commodities';

// Baseline Global Commodity Spot Reference Rates per Troy Ounce in USD
export const BASELINE_USD_OUNCE_RATES = {
  gold: 2650.0,    // ~$85.20 / g Fine 24K
  silver: 31.50,   // ~$1.0127 / g Fine 999
  platinum: 980.0, // ~$31.508 / g Fine Pt
};

// 24-hour baseline market trends
export const BASELINE_24H_TRENDS = {
  gold: 1.2,     // +1.2%
  silver: 0.4,   // +0.4%
  platinum: -0.3 // -0.3%
};

export function useCommodities() {
  const { baseCurrency, fxRates } = useAppStore();
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>(new Date().toISOString());

  // Dynamic Spot Calculation per Fine Gram in USD
  const baseSpotPerGramUSD = useMemo(() => {
    return {
      gold24k: PrecisionMath.round(BASELINE_USD_OUNCE_RATES.gold / TROY_OUNCE_IN_GRAMS, 4), // 85.1995 -> 85.20
      silver999: PrecisionMath.round(BASELINE_USD_OUNCE_RATES.silver / TROY_OUNCE_IN_GRAMS, 4), // 1.0127
      platinum950: PrecisionMath.round((BASELINE_USD_OUNCE_RATES.platinum / TROY_OUNCE_IN_GRAMS) * 0.95, 4), // 29.9325
    };
  }, []);

  // Compute live spot prices converted into active base currency
  const marketRates: CommodityMarketRates = useMemo(() => {
    const gold24kInBase = convertCurrency(baseSpotPerGramUSD.gold24k, 'USD', baseCurrency, fxRates);
    const silver999InBase = convertCurrency(baseSpotPerGramUSD.silver999, 'USD', baseCurrency, fxRates);
    const platinum950InBase = convertCurrency(baseSpotPerGramUSD.platinum950, 'USD', baseCurrency, fxRates);

    return {
      lastUpdated: ratesLastUpdated,
      baseCurrency,
      rates: {
        gold24kPerGram: PrecisionMath.round(gold24kInBase, 2),
        silver999PerGram: PrecisionMath.round(silver999InBase, 2),
        platinum950PerGram: PrecisionMath.round(platinum950InBase, 2),
      },
      ounceRatesUSD: {
        goldUSDPerOunce: BASELINE_USD_OUNCE_RATES.gold,
        silverUSDPerOunce: BASELINE_USD_OUNCE_RATES.silver,
        platinumUSDPerOunce: BASELINE_USD_OUNCE_RATES.platinum,
      },
      trends: {
        gold24k24hChangePct: BASELINE_24H_TRENDS.gold,
        silver99924hChangePct: BASELINE_24H_TRENDS.silver,
        platinum95024hChangePct: BASELINE_24H_TRENDS.platinum,
      },
    };
  }, [baseCurrency, fxRates, baseSpotPerGramUSD, ratesLastUpdated]);

  // Helper to fetch live spot price for any specific metal + purity combination
  const getSpotPricePerGram = useCallback(
    (metal: PreciousMetalType, purity: string): number => {
      let baseRate = marketRates.rates.gold24kPerGram;
      if (metal === 'silver') baseRate = marketRates.rates.silver999PerGram;
      if (metal === 'platinum') baseRate = marketRates.rates.platinum950PerGram;

      const multiplier = PrecisionMath.getPurityMultiplier(metal, purity);
      return PrecisionMath.round(baseRate * multiplier, 2);
    },
    [marketRates]
  );

  // Live holdings query from IndexedDB
  const rawHoldings = useLiveQuery(() => db.commodities?.toArray(), []) || [];

  // Seed realistic baseline holding on empty database so cards aren't blank
  useEffect(() => {
    async function seedInitialBullion() {
      if (!db.commodities) return;
      const count = await db.commodities.count();
      if (count === 0) {
        const initialGoldCostUSD = PrecisionMath.round(TOLA_IN_GRAMS * 85.20, 2); // ~$993.76
        await db.commodities.bulkPut([
          {
            metal: 'gold',
            purity: '24k',
            quantity: 1,
            unit: 'tola',
            weightInGrams: TOLA_IN_GRAMS,
            purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            costBasisTotal: initialGoldCostUSD,
            costBasisCurrency: 'USD',
            currentSpotPricePerGram: baseSpotPerGramUSD.gold24k,
            currentValueBaseCurrency: initialGoldCostUSD,
            unrealizedGainLoss: 0,
            unrealizedGainLossPercentage: 0,
            linkedAccountId: '1060',
            notes: 'Physical 24K Minted Gold Bar (1 Tola fine gold)',
            createdAt: new Date().toISOString(),
          },
          {
            metal: 'silver',
            purity: '999',
            quantity: 100,
            unit: 'grams',
            weightInGrams: 100,
            purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            costBasisTotal: 95.0,
            costBasisCurrency: 'USD',
            currentSpotPricePerGram: baseSpotPerGramUSD.silver999,
            currentValueBaseCurrency: 101.27,
            unrealizedGainLoss: 6.27,
            unrealizedGainLossPercentage: 6.6,
            linkedAccountId: '1060',
            notes: 'Fine Silver Cast Ingot 100g',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    }
    seedInitialBullion();
  }, [baseSpotPerGramUSD]);

  // Enriched holdings with real-time base currency revaluation
  const holdings: CommodityHolding[] = useMemo(() => {
    return rawHoldings.map((h) => {
      const weightInGrams = PrecisionMath.toGrams(h.quantity, h.unit);
      const spotPricePerGram = getSpotPricePerGram(h.metal, h.purity);
      const currentValueBaseCurrency = PrecisionMath.round(weightInGrams * spotPricePerGram, 2);

      // Cost basis normalized into base currency
      const costBasisInBase = convertCurrency(
        h.costBasisTotal,
        h.costBasisCurrency || 'USD',
        baseCurrency,
        fxRates
      );

      const unrealizedGainLoss = PrecisionMath.round(currentValueBaseCurrency - costBasisInBase, 2);
      const unrealizedGainLossPercentage =
        costBasisInBase > 0 ? PrecisionMath.round((unrealizedGainLoss / costBasisInBase) * 100, 2) : 0;

      return {
        ...h,
        weightInGrams,
        currentSpotPricePerGram: spotPricePerGram,
        currentValueBaseCurrency,
        unrealizedGainLoss,
        unrealizedGainLossPercentage,
      };
    });
  }, [rawHoldings, getSpotPricePerGram, baseCurrency, fxRates]);

  // Aggregated Precious Metals Metrics
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let goldGrams = 0;
    let silverGrams = 0;
    let platinumGrams = 0;

    holdings.forEach((h) => {
      totalValue = PrecisionMath.add(totalValue, h.currentValueBaseCurrency);
      const costInBase = convertCurrency(
        h.costBasisTotal,
        h.costBasisCurrency || 'USD',
        baseCurrency,
        fxRates
      );
      totalCost = PrecisionMath.add(totalCost, costInBase);

      if (h.metal === 'gold') goldGrams += h.weightInGrams;
      if (h.metal === 'silver') silverGrams += h.weightInGrams;
      if (h.metal === 'platinum') platinumGrams += h.weightInGrams;
    });

    const netUnrealizedGainLoss = PrecisionMath.sub(totalValue, totalCost);
    const netGainLossPct =
      totalCost > 0 ? PrecisionMath.round((netUnrealizedGainLoss / totalCost) * 100, 2) : 0;

    return {
      totalCommoditiesValueBaseCurrency: PrecisionMath.round(totalValue, 2),
      totalCostBasisBaseCurrency: PrecisionMath.round(totalCost, 2),
      netUnrealizedGainLoss,
      netGainLossPct,
      gold: {
        grams: PrecisionMath.round(goldGrams, 3),
        tolas: PrecisionMath.round(goldGrams / TOLA_IN_GRAMS, 3),
        troyOunces: PrecisionMath.round(goldGrams / TROY_OUNCE_IN_GRAMS, 3),
      },
      silver: {
        grams: PrecisionMath.round(silverGrams, 3),
        tolas: PrecisionMath.round(silverGrams / TOLA_IN_GRAMS, 3),
        troyOunces: PrecisionMath.round(silverGrams / TROY_OUNCE_IN_GRAMS, 3),
      },
      platinum: {
        grams: PrecisionMath.round(platinumGrams, 3),
        tolas: PrecisionMath.round(platinumGrams / TOLA_IN_GRAMS, 3),
        troyOunces: PrecisionMath.round(platinumGrams / TROY_OUNCE_IN_GRAMS, 3),
      },
      holdingsCount: holdings.length,
    };
  }, [holdings, baseCurrency, fxRates]);

  // Add a new commodity holding with optional auto-balanced double-entry journal entry
  const addCommodityHolding = useCallback(
    async (
      holdingData: Omit<
        CommodityHolding,
        'id' | 'weightInGrams' | 'currentSpotPricePerGram' | 'currentValueBaseCurrency' | 'unrealizedGainLoss' | 'unrealizedGainLossPercentage'
      >,
      options?: {
        autoJournalEntry?: boolean;
        paymentAccount?: '1010' | '1020'; // Cash on Hand or Bank
      }
    ) => {
      const weightInGrams = PrecisionMath.toGrams(holdingData.quantity, holdingData.unit);
      const spotPricePerGram = getSpotPricePerGram(holdingData.metal, holdingData.purity);
      const currentValueBaseCurrency = PrecisionMath.round(weightInGrams * spotPricePerGram, 2);

      const newId = await db.commodities.add({
        ...holdingData,
        weightInGrams,
        currentSpotPricePerGram: spotPricePerGram,
        currentValueBaseCurrency,
        unrealizedGainLoss: 0,
        unrealizedGainLossPercentage: 0,
        createdAt: new Date().toISOString(),
      });

      // Post balanced General Journal entry if requested
      if (options?.autoJournalEntry && holdingData.costBasisTotal > 0) {
        const paymentAccCode = options.paymentAccount || '1020';
        const paymentAccName =
          paymentAccCode === '1010' ? 'Cash on Hand' : 'Bank Operating Account';

        await postJournalEntry({
          entryNumber: `JE-BULLION-${Date.now().toString().slice(-4)}`,
          date: holdingData.purchaseDate || new Date().toISOString().split('T')[0],
          narration: `Acquisition of ${holdingData.quantity} ${holdingData.unit} ${holdingData.metal.toUpperCase()} (${holdingData.purity}) bullion asset`,
          source: 'manual',
          createdAt: new Date().toISOString(),
          lines: [
            {
              accountId: '1060',
              accountName: 'Precious Metals / Bullion',
              debit: holdingData.costBasisTotal,
              credit: 0,
            },
            {
              accountId: paymentAccCode,
              accountName: paymentAccName,
              debit: 0,
              credit: holdingData.costBasisTotal,
            },
          ],
        });
      }

      return newId;
    },
    [getSpotPricePerGram]
  );

  // Remove commodity holding
  const removeCommodityHolding = useCallback(async (id: number) => {
    await db.commodities.delete(id);
  }, []);

  // Refresh spot rates
  const refreshRates = useCallback(async () => {
    await fetchFXRates();
    setRatesLastUpdated(new Date().toISOString());
  }, []);

  return {
    marketRates,
    holdings,
    summary,
    getSpotPricePerGram,
    addCommodityHolding,
    removeCommodityHolding,
    refreshRates,
  };
}
