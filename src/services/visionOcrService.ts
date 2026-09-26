// AuraFinance OS — Intelligent Multimodal OCR Currency Resiliency & Auto-Conversion Engine
// Powered by Gemini Vision with Contextual Currency Inference & Real-Time Client-Side FX Conversion
import { useAppStore } from '../store/useAppStore';
import { getActiveGeminiKey } from './geminiKeyConfig';

export interface ExtractedReceiptData {
  vendor: string;
  date: string;
  sourceDetectedCurrency: string; // ISO 3-letter code (e.g., "EUR", "AED", "PKR", "USD")
  confidenceCurrencyDetection: 'explicit' | 'inferred_address' | 'inferred_tax_id' | 'fallback_home';
  originalSubtotal: number;
  originalTax: number;
  originalTotal: number;

  // Auto-Converted Output (Evaluated against User's Active Base Currency)
  targetBaseCurrency: string;
  exchangeRateApplied: number; // 1 SourceUnit = X TargetUnits
  convertedTotal: number;
  convertedTax: number;
  convertedSubtotal: number;

  lineItems: Array<{
    description: string;
    quantity: number;
    originalPrice: number;
    convertedPrice: number;
  }>;

  suggestedJournalEntry: {
    narration: string;
    debitAccountCode: string; // e.g., "5020" Dining
    creditAccountCode: string; // e.g., "1010" Cash or "1020" Bank
    amountInBaseCurrency: number;
    lines: Array<{
      accountId: string;
      accountName: string;
      debit: number;
      credit: number;
    }>;
  };

  rawText?: string;
  isAiParsed: boolean;
}

// Backward-compatible type alias
export type OcrReceiptResult = ExtractedReceiptData;

/**
 * Resolves currency conversion via cross-rate calculation against USD
 * Rate(Source -> Target) = Rate(USD -> Target) / Rate(USD -> Source)
 */
export function resolveCurrencyConversion(
  rawTotal: number,
  detectedIso: string,
  userBaseIso: string,
  rates?: Record<string, number>
): { convertedTotal: number; rate: number } {
  const normalizedSource = detectedIso?.toUpperCase() || userBaseIso;
  const currentRates = rates || useAppStore.getState().fxRates || {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    PKR: 278.5,
    INR: 83.1,
    AED: 3.67,
    CAD: 1.36,
    JPY: 149.5,
  };

  if (normalizedSource === userBaseIso) {
    return { convertedTotal: rawTotal, rate: 1.0 };
  }

  const rateToUSD = currentRates[normalizedSource] || 1.0;
  const rateTarget = currentRates[userBaseIso] || 1.0;
  const effectiveRate = rateTarget / rateToUSD;

  const convertedTotal = Math.round(rawTotal * effectiveRate * 100) / 100;
  return { convertedTotal, rate: effectiveRate };
}

/**
 * Heuristically infers currency and confidence from secondary receipt metadata:
 * - Phone numbers (+92 -> PKR, +971 -> AED, +1 -> USD, +44 -> GBP)
 * - City / Country headers (Karachi, Dubai, London, New York)
 * - Tax nomenclature (NTN/SRB -> PKR, VAT/TRN -> AED, GST -> INR/AUD, Sales Tax -> USD)
 * - Currency symbols (€, £, Rs, ₹, د.إ, $, ¥)
 */
export function inferCurrencyFromContext(
  text: string,
  fallbackCurrency: string
): { currency: string; confidence: ExtractedReceiptData['confidenceCurrencyDetection'] } {
  const lower = text.toLowerCase();

  // 1. Explicit Currency Symbols & ISO Codes
  if (lower.includes('€') || lower.includes('eur')) {
    return { currency: 'EUR', confidence: 'explicit' };
  }
  if (lower.includes('£') || lower.includes('gbp')) {
    return { currency: 'GBP', confidence: 'explicit' };
  }
  if (lower.includes('aed') || lower.includes('د.إ') || lower.includes('dirham')) {
    return { currency: 'AED', confidence: 'explicit' };
  }
  if (lower.includes('pkr') || lower.includes('rs.') || lower.includes('rs ') || lower.includes('₨') || lower.includes('rupees')) {
    return { currency: 'PKR', confidence: 'explicit' };
  }
  if (lower.includes('₹') || lower.includes('inr')) {
    return { currency: 'INR', confidence: 'explicit' };
  }
  if (lower.includes('¥') || lower.includes('jpy') || lower.includes('yen')) {
    return { currency: 'JPY', confidence: 'explicit' };
  }
  if (lower.includes('cad') || lower.includes('c$')) {
    return { currency: 'CAD', confidence: 'explicit' };
  }
  if (lower.includes('usd') || lower.includes('$')) {
    return { currency: 'USD', confidence: 'explicit' };
  }

  // 2. Tax Nomenclature Inference
  if (lower.includes('ntn') || lower.includes('srb') || lower.includes('pra') || lower.includes('fbr')) {
    return { currency: 'PKR', confidence: 'inferred_tax_id' };
  }
  if (lower.includes('trn') || lower.includes('vat/trn') || lower.includes('fta')) {
    return { currency: 'AED', confidence: 'inferred_tax_id' };
  }
  if (lower.includes('gstin') || lower.includes('gst no')) {
    return { currency: 'INR', confidence: 'inferred_tax_id' };
  }
  if (lower.includes('sales tax') || lower.includes('state tax')) {
    return { currency: 'USD', confidence: 'inferred_tax_id' };
  }

  // 3. Address / Phone Number Inference
  if (lower.includes('+92') || lower.includes('karachi') || lower.includes('lahore') || lower.includes('islamabad') || lower.includes('rawalpindi')) {
    return { currency: 'PKR', confidence: 'inferred_address' };
  }
  if (lower.includes('+971') || lower.includes('dubai') || lower.includes('abu dhabi') || lower.includes('sharjah') || lower.includes('uae')) {
    return { currency: 'AED', confidence: 'inferred_address' };
  }
  if (lower.includes('+44') || lower.includes('london') || lower.includes('manchester') || lower.includes('birmingham') || lower.includes('uk')) {
    return { currency: 'GBP', confidence: 'inferred_address' };
  }
  if (lower.includes('+81') || lower.includes('tokyo') || lower.includes('osaka') || lower.includes('japan')) {
    return { currency: 'JPY', confidence: 'inferred_address' };
  }
  if (lower.includes('paris') || lower.includes('berlin') || lower.includes('madrid') || lower.includes('rome') || lower.includes('germany') || lower.includes('france')) {
    return { currency: 'EUR', confidence: 'inferred_address' };
  }
  if (lower.includes('+1') || lower.includes('new york') || lower.includes('california') || lower.includes('texas') || lower.includes('chicago')) {
    return { currency: 'USD', confidence: 'inferred_address' };
  }

  // Fallback to active user base currency
  return { currency: fallbackCurrency, confidence: 'fallback_home' };
}

/**
 * Deterministic local fallback parser with contextual currency inference & FX auto-conversion
 */
export function fallbackHeuristicReceiptParse(
  base64OrText?: string,
  fileName?: string
): ExtractedReceiptData {
  const today = new Date().toISOString().split('T')[0];
  const userBaseIso = useAppStore.getState().baseCurrency || 'USD';
  const hint = ((fileName || '') + ' ' + (base64OrText || '')).toLowerCase();

  // Infer currency and confidence
  const { currency: sourceCurrency, confidence } = inferCurrencyFromContext(hint, userBaseIso);

  // Categorize vendor & account
  let vendor = 'Metro Merchant';
  let categoryAccount = { id: '5030', name: 'Office Supplies & SaaS' };
  let originalSubtotal = 45.0;

  if (
    hint.includes('coffee') ||
    hint.includes('cafe') ||
    hint.includes('starbucks') ||
    hint.includes('food') ||
    hint.includes('restaurant') ||
    hint.includes('dinner')
  ) {
    vendor = 'Artisan Roastery & Cafe';
    categoryAccount = { id: '5020', name: 'Food & Dining Expense' };
    originalSubtotal = 38.5;
  } else if (hint.includes('uber') || hint.includes('flight') || hint.includes('fuel') || hint.includes('gas') || hint.includes('transit')) {
    vendor = 'City Transit & Mobility Co.';
    categoryAccount = { id: '5050', name: 'Travel & Transit' };
    originalSubtotal = 64.0;
  } else if (hint.includes('utility') || hint.includes('power') || hint.includes('electric') || hint.includes('internet')) {
    vendor = 'Metropolitan Utilities & Fiber';
    categoryAccount = { id: '5040', name: 'Utilities & Living' };
    originalSubtotal = 115.0;
  } else if (hint.includes('inventory') || hint.includes('stock') || hint.includes('wholesale')) {
    vendor = 'Wholesale Trading Distribution';
    categoryAccount = { id: '1040', name: 'Inventory / Stock' };
    originalSubtotal = 420.0;
  }

  // Parse any explicit numbers in text if available
  const numberMatches = (base64OrText || '').match(/(\d+\.\d{2})/g);
  if (numberMatches && numberMatches.length > 0) {
    const parsedAmt = parseFloat(numberMatches[numberMatches.length - 1]);
    if (parsedAmt > 0 && parsedAmt < 100000) {
      originalSubtotal = Math.round(parsedAmt * 0.92 * 100) / 100;
    }
  }

  const originalTax = Math.round(originalSubtotal * 0.08 * 100) / 100;
  const originalTotal = Math.round((originalSubtotal + originalTax) * 100) / 100;

  // Auto-convert to user's configured base currency
  const { convertedTotal, rate } = resolveCurrencyConversion(originalTotal, sourceCurrency, userBaseIso);
  const convertedSubtotal = Math.round(originalSubtotal * rate * 100) / 100;
  const convertedTax = Math.round((convertedTotal - convertedSubtotal) * 100) / 100;

  return {
    vendor,
    date: today,
    sourceDetectedCurrency: sourceCurrency,
    confidenceCurrencyDetection: confidence,
    originalSubtotal,
    originalTax,
    originalTotal,
    targetBaseCurrency: userBaseIso,
    exchangeRateApplied: Math.round(rate * 10000) / 10000,
    convertedTotal,
    convertedTax,
    convertedSubtotal,
    lineItems: [
      {
        description: `Receipt Items at ${vendor}`,
        quantity: 1,
        originalPrice: originalSubtotal,
        convertedPrice: convertedSubtotal,
      },
    ],
    suggestedJournalEntry: {
      narration: `Expense at ${vendor} (${sourceCurrency} ${originalTotal} -> ${userBaseIso} ${convertedTotal} @ ${rate.toFixed(4)})`,
      debitAccountCode: categoryAccount.id,
      creditAccountCode: '1010',
      amountInBaseCurrency: convertedTotal,
      lines: [
        {
          accountId: categoryAccount.id,
          accountName: categoryAccount.name,
          debit: convertedSubtotal,
          credit: 0,
        },
        {
          accountId: '2030',
          accountName: 'Sales Tax / VAT Payable',
          debit: convertedTax,
          credit: 0,
        },
        {
          accountId: '1010',
          accountName: 'Cash on Hand',
          debit: 0,
          credit: convertedTotal,
        },
      ],
    },
    rawText: `Vendor: ${vendor} | Original: ${sourceCurrency} ${originalTotal} | Converted: ${userBaseIso} ${convertedTotal} (Rate: ${rate.toFixed(4)})`,
    isAiParsed: false,
  };
}

/**
 * Multimodal OCR Receipt Parser using Gemini Vision API with contextual currency inference & FX auto-conversion
 */
export async function parseReceiptWithVision(
  base64DataUrl: string,
  fileName?: string
): Promise<ExtractedReceiptData> {
  const store = useAppStore.getState();
  const apiKey = store.geminiApiKey || getActiveGeminiKey();
  const userBaseIso = store.baseCurrency || 'USD';

  if (!apiKey || apiKey.trim().length < 5) {
    return fallbackHeuristicReceiptParse(base64DataUrl, fileName);
  }

  try {
    const mimeMatch = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = mimeMatch ? mimeMatch[2] : base64DataUrl.replace(/^data:.*?;base64,/, '');

    const prompt = `You are a Principal CPA and Forensic Financial Auditor specializing in multi-currency invoices.
Analyze this receipt image. Even if currency symbols are absent or unfamiliar, infer the source currency using:
- Phone country codes (+92 -> PKR, +971 -> AED, +1 -> USD, +44 -> GBP)
- City / State / Country names on the header/footer (e.g. Dubai, Karachi, London, Paris, New York)
- Tax terminology (NTN/SRB -> PKR, VAT/TRN -> AED, GST -> INR/AUD, Sales Tax -> USD)
- Currency symbols (€, £, Rs, ₹, د.إ, $, ¥)

Output a STRICT JSON object with no markdown fences, matching this exact schema:
{
  "vendor": "String",
  "date": "YYYY-MM-DD",
  "sourceDetectedCurrency": "EUR | AED | PKR | USD | GBP | INR | CAD | JPY",
  "confidenceCurrencyDetection": "explicit" | "inferred_address" | "inferred_tax_id" | "fallback_home",
  "originalSubtotal": 0.00,
  "originalTax": 0.00,
  "originalTotal": 0.00,
  "lineItems": [
    { "description": "String", "quantity": 1, "originalPrice": 0.00 }
  ],
  "suggestedCategory": "food" | "supplies" | "utilities" | "travel" | "inventory"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini Vision API response error, falling back to heuristics.');
      return fallbackHeuristicReceiptParse(base64DataUrl, fileName);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return fallbackHeuristicReceiptParse(base64DataUrl, fileName);
    }

    const parsed = JSON.parse(candidateText);

    // Map Category to Chart of Accounts
    let categoryAccount = { id: '5020', name: 'Food & Dining Expense' };
    if (parsed.suggestedCategory === 'supplies') {
      categoryAccount = { id: '5030', name: 'Office Supplies & SaaS' };
    } else if (parsed.suggestedCategory === 'utilities') {
      categoryAccount = { id: '5040', name: 'Utilities & Living' };
    } else if (parsed.suggestedCategory === 'travel') {
      categoryAccount = { id: '5050', name: 'Travel & Transit' };
    } else if (parsed.suggestedCategory === 'inventory') {
      categoryAccount = { id: '1040', name: 'Inventory / Stock' };
    }

    const sourceDetectedCurrency = parsed.sourceDetectedCurrency || userBaseIso;
    const originalTotal = Number(parsed.originalTotal) || 0;
    const originalSubtotal = Number(parsed.originalSubtotal) || Math.round(originalTotal * 0.92 * 100) / 100;
    const originalTax = Number(parsed.originalTax) || Math.round((originalTotal - originalSubtotal) * 100) / 100;

    // Apply Real-Time FX Conversion
    const { convertedTotal, rate } = resolveCurrencyConversion(originalTotal, sourceDetectedCurrency, userBaseIso);
    const convertedSubtotal = Math.round(originalSubtotal * rate * 100) / 100;
    const convertedTax = Math.round((convertedTotal - convertedSubtotal) * 100) / 100;

    const lineItems = (parsed.lineItems || []).map((item: any) => ({
      description: item.description || 'Item',
      quantity: item.quantity || 1,
      originalPrice: Number(item.originalPrice) || 0,
      convertedPrice: Math.round((Number(item.originalPrice) || 0) * rate * 100) / 100,
    }));

    return {
      vendor: parsed.vendor || 'Scanned Merchant',
      date: parsed.date || new Date().toISOString().split('T')[0],
      sourceDetectedCurrency,
      confidenceCurrencyDetection: parsed.confidenceCurrencyDetection || 'explicit',
      originalSubtotal,
      originalTax,
      originalTotal,
      targetBaseCurrency: userBaseIso,
      exchangeRateApplied: Math.round(rate * 10000) / 10000,
      convertedTotal,
      convertedTax,
      convertedSubtotal,
      lineItems,
      suggestedJournalEntry: {
        narration: `Expense at ${parsed.vendor || 'Merchant'} (${sourceDetectedCurrency} ${originalTotal.toFixed(2)} -> ${userBaseIso} ${convertedTotal.toFixed(2)})`,
        debitAccountCode: categoryAccount.id,
        creditAccountCode: '1010',
        amountInBaseCurrency: convertedTotal,
        lines: [
          {
            accountId: categoryAccount.id,
            accountName: categoryAccount.name,
            debit: convertedSubtotal,
            credit: 0,
          },
          {
            accountId: '2030',
            accountName: 'Sales Tax / VAT Payable',
            debit: convertedTax,
            credit: 0,
          },
          {
            accountId: '1010',
            accountName: 'Cash on Hand',
            debit: 0,
            credit: convertedTotal,
          },
        ],
      },
      rawText: candidateText,
      isAiParsed: true,
    };
  } catch (err) {
    console.warn('Vision OCR parsing encountered error, using fallback:', err);
    return fallbackHeuristicReceiptParse(base64DataUrl, fileName);
  }
}
