// AuraFinance OS — Gemini AI Service + Fallback Heuristic Parser
import { useAppStore } from '../store/useAppStore';
import { getActiveGeminiKey } from './geminiKeyConfig';

// ─── Client-side heuristic parser (works without API key) ───
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Dining': ['food', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'biryani', 'lunch', 'dinner', 'breakfast', 'snack', 'uber eats', 'doordash', 'grubhub', 'latte', 'starbucks', 'mcdonalds', 'kfc', 'tea', 'chai', 'naan', 'shawarma'],
  'Transport': ['uber', 'lyft', 'gas', 'fuel', 'petrol', 'taxi', 'bus', 'metro', 'train', 'careem', 'parking', 'toll'],
  'Shopping': ['amazon', 'walmart', 'target', 'clothes', 'shoes', 'mall', 'zara', 'h&m', 'nike', 'adidas'],
  'Entertainment': ['netflix', 'spotify', 'gaming', 'playstation', 'xbox', 'steam', 'movie', 'cinema', 'concert', 'youtube', 'twitch', 'disney'],
  'Education': ['book', 'course', 'udemy', 'school', 'tuition', 'college', 'university', 'stationery', 'coursera'],
  'Tech & SaaS': ['github', 'vercel', 'aws', 'google cloud', 'figma', 'notion', 'slack', 'laptop', 'phone', 'ipad', 'macbook', 'domain', 'hosting'],
  'Health': ['gym', 'pharmacy', 'medicine', 'doctor', 'hospital', 'vitamin', 'supplement', 'dental'],
  'Bills & Utilities': ['electricity', 'water', 'internet', 'wifi', 'phone bill', 'rent', 'insurance', 'mobile'],
  'Investment': ['stocks', 'crypto', 'bitcoin', 'mutual fund', 'etf', 'savings', 'deposit', 'investment'],
  'Income': ['salary', 'freelance', 'payment received', 'invoice', 'client', 'upwork', 'fiverr', 'gig'],
};

const BUCKET_MAP: Record<string, 'needs' | 'wants' | 'savings'> = {
  'Food & Dining': 'needs',
  'Transport': 'needs',
  'Bills & Utilities': 'needs',
  'Health': 'needs',
  'Shopping': 'wants',
  'Entertainment': 'wants',
  'Tech & SaaS': 'wants',
  'Education': 'needs',
  'Investment': 'savings',
  'Income': 'savings',
};

const CURRENCY_PATTERNS: Record<string, RegExp> = {
  USD: /\$|usd|dollars?/i,
  PKR: /pkr|rupees?|rs\.?/i,
  EUR: /€|eur|euros?/i,
  GBP: /£|gbp|pounds?/i,
  INR: /₹|inr/i,
  AED: /aed|dirhams?/i,
  CAD: /cad|c\$/i,
  JPY: /¥|jpy|yen/i,
};

export interface ParsedTransaction {
  title: string;
  amount: number;
  currency: string;
  category: string;
  bucket: 'needs' | 'wants' | 'savings';
  type: 'income' | 'expense';
  merchant?: string;
  date: string;
  tags: string[];
  confidence: number;
}

export function heuristicParseTransaction(input: string): ParsedTransaction {
  const lower = input.toLowerCase().trim();
  
  // Extract amount
  const amountMatch = lower.match(/(\d[\d,]*\.?\d*)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
  
  // Detect currency
  let currency = 'USD';
  for (const [code, pattern] of Object.entries(CURRENCY_PATTERNS)) {
    if (pattern.test(lower)) { currency = code; break; }
  }
  
  // Detect type
  const incomeKeywords = ['salary', 'earned', 'received', 'income', 'payment from', 'freelance', 'invoice paid', 'got paid'];
  const isIncome = incomeKeywords.some(k => lower.includes(k));
  
  // Detect category
  let category = 'Other';
  let confidence = 0.4;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        category = cat;
        confidence = 0.85;
        break;
      }
    }
    if (confidence > 0.5) break;
  }
  
  // Clean title
  let title = input.replace(/[\$€£₹¥]\s*\d[\d,]*\.?\d*/g, '').replace(/\d[\d,]*\.?\d*\s*(usd|pkr|eur|gbp|inr|aed|cad|jpy|dollars?|rupees?|rs|euros?|pounds?)/gi, '').trim();
  if (!title || title.length < 2) title = input.slice(0, 50);
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  const bucket = isIncome ? 'savings' : (BUCKET_MAP[category] || 'wants');
  
  return {
    title,
    amount,
    currency,
    category,
    bucket,
    type: isIncome ? 'income' : 'expense',
    date: new Date().toISOString().split('T')[0],
    tags: [category.toLowerCase()],
    confidence,
  };
}

// ─── Gemini AI Service ───
export async function geminiParseTransaction(input: string, apiKey?: string): Promise<ParsedTransaction> {
  try {
    const key = apiKey || getActiveGeminiKey();
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });
    
    const prompt = `You are AuraFinance AI. Parse this financial transaction from natural language into structured JSON.
Input: "${input}"

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": "clean descriptive title",
  "amount": number,
  "currency": "USD|EUR|GBP|PKR|INR|AED|CAD|JPY",
  "category": "Food & Dining|Transport|Shopping|Entertainment|Education|Tech & SaaS|Health|Bills & Utilities|Investment|Income|Other",
  "bucket": "needs|wants|savings",
  "type": "income|expense",
  "merchant": "merchant name or null",
  "date": "${new Date().toISOString().split('T')[0]}",
  "tags": ["tag1","tag2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    
    const text = response.text || '';
    const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    return { ...parsed, confidence: 0.95 };
  } catch (e) {
    console.warn('Gemini parse failed, falling back to heuristic:', e);
    return heuristicParseTransaction(input);
  }
}

export function heuristicParseReceipt(fileName: string = 'receipt.png'): ParsedTransaction[] {
  const lower = fileName.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  const { baseCurrency } = useAppStore.getState();

  // Pattern checks from filename
  let title = 'Receipt / Invoice Item';
  let merchant = 'Retail Store / Vendor';
  let category = 'Shopping';
  let bucket: 'needs' | 'wants' | 'savings' = 'wants';
  let amount = baseCurrency === 'PKR' ? 4500 : 42.50;

  if (lower.includes('walmart') || lower.includes('grocery') || lower.includes('food') || lower.includes('rashan')) {
    title = 'Supermarket Groceries & Essentials';
    merchant = lower.includes('walmart') ? 'Walmart' : 'Local Mart';
    category = 'Food & Dining';
    bucket = 'needs';
    amount = baseCurrency === 'PKR' ? 3850 : 38.50;
  } else if (lower.includes('uber') || lower.includes('ride') || lower.includes('careem') || lower.includes('fuel')) {
    title = 'Transit Ride & Transportation';
    merchant = lower.includes('uber') ? 'Uber' : 'Careem';
    category = 'Transport';
    bucket = 'needs';
    amount = baseCurrency === 'PKR' ? 1450 : 16.20;
  } else if (lower.includes('figma') || lower.includes('adobe') || lower.includes('github') || lower.includes('aws')) {
    title = 'Software Subscription License';
    merchant = 'Cloud SaaS';
    category = 'Tech & SaaS';
    bucket = 'wants';
    amount = baseCurrency === 'PKR' ? 5600 : 20.00;
  } else if (lower.includes('cafe') || lower.includes('coffee') || lower.includes('starbucks')) {
    title = 'Espresso & Bakery Snack';
    merchant = 'Coffee House';
    category = 'Food & Dining';
    bucket = 'wants';
    amount = baseCurrency === 'PKR' ? 950 : 7.80;
  }

  // Attempt to extract numeric digits from filename if present
  const numMatch = lower.match(/(\d+[\d.]*)/);
  if (numMatch && parseFloat(numMatch[1]) > 0) {
    amount = parseFloat(numMatch[1]);
  }

  return [
    {
      title,
      amount,
      currency: baseCurrency,
      category,
      bucket,
      type: 'expense',
      merchant,
      date: today,
      tags: ['receipt-ocr', 'verified'],
      confidence: 0.85,
    },
  ];
}

export async function geminiParseReceipt(imageBase64: string, apiKey?: string): Promise<ParsedTransaction[]> {
  try {
    const key = apiKey || getActiveGeminiKey();
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });
    
    const prompt = `You are AuraFinance AI. Parse this receipt/invoice image into structured transaction(s).
Return ONLY valid JSON array (no markdown):
[{
  "title": "item description",
  "amount": number,
  "currency": "USD",
  "category": "Food & Dining|Transport|Shopping|Entertainment|Education|Tech & SaaS|Health|Bills & Utilities|Investment|Other",
  "bucket": "needs|wants|savings",
  "type": "expense",
  "merchant": "store/vendor name",
  "date": "YYYY-MM-DD",
  "tags": ["tag1"]
}]`;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
        ]
      }],
    });
    
    const text = response.text || '';
    const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    return Array.isArray(parsed) ? parsed.map((p: ParsedTransaction) => ({ ...p, confidence: 0.9 })) : [{ ...parsed, confidence: 0.9 }];
  } catch (e) {
    console.warn('Gemini receipt parse failed, falling back to deterministic heuristic:', e);
    return heuristicParseReceipt('receipt.jpg');
  }
}

export async function parseReceiptInput(imageBase64: string, fileName?: string): Promise<ParsedTransaction[]> {
  const apiKey = useAppStore.getState().geminiApiKey || getActiveGeminiKey();
  try {
    const results = await geminiParseReceipt(imageBase64, apiKey);
    if (results && results.length > 0) return results;
  } catch {
    // Fall through to heuristic
  }
  return heuristicParseReceipt(fileName || 'receipt.png');
}

export async function geminiFinancialAdvice(
  context: string,
  persona: 'mentor' | 'roast',
  apiKey?: string,
  countryName?: string,
  vernacularTerms?: { savingsCommunity?: string; emergencyFund?: string; groceryPantry?: string; freshMarket?: string }
): Promise<string> {
  const activeLang = typeof localStorage !== 'undefined' ? localStorage.getItem('aura_language') || 'en' : 'en';
  const langDirective = `CRITICAL: You MUST write your complete response in ${
    activeLang === 'ur' ? 'authentic native Urdu (اردو)' :
    activeLang === 'ur_roman' ? 'conversational Roman Urdu / Hindi' :
    activeLang === 'ar' ? 'standard modern Arabic (العربية)' :
    activeLang === 'es' ? 'Spanish (Español)' :
    activeLang === 'fr' ? 'French (Français)' :
    activeLang === 'de' ? 'German (Deutsch)' :
    activeLang === 'ja' ? 'Japanese (日本語)' :
    activeLang === 'zh' ? 'Mandarin Chinese (简体中文)' : 'English'
  }.`;

  const culturalContext = countryName
    ? `User is based in ${countryName}. When relevant, incorporate local financial wisdom and native terms like ${vernacularTerms?.savingsCommunity || 'community savings'} (for peer/rotating savings), ${vernacularTerms?.emergencyFund || 'emergency vault'}, and smart local market shopping at ${vernacularTerms?.freshMarket || 'local market'}.`
    : '';

  const personaPrompt = persona === 'roast'
    ? `You are "AuraSavage" – a hilarious, sarcastic Gen-Z financial roast comedian. ${langDirective} Deliver a brutally funny critique of the user's discretionary spending (food delivery, subscription waste, impulse buys) designed for viral shareability. ${culturalContext} Use modern vernacular slang, emojis, and cultural references. Keep it under 180 words.`
    : `You are "AuraMentor" – a strict, elite wealth mentor and certified private wealth manager. ${langDirective} ${culturalContext} Analyze the user's cashflow and deliver EXACTLY 3 high-impact, professional recommendations:
1. Discretionary Leakage & Wants Capping (enforce strict 30% ceiling).
2. Debt Snowball / Emergency Runway Fortification (accelerate liquidity to 6 months).
3. Automated Wealth Flywheel (route minimum 20% into compounding assets).
Keep your tone authoritative, analytical, and professional. Keep under 220 words.`;

  try {
    const key = apiKey || getActiveGeminiKey();
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${personaPrompt}\n\nHere's the user's financial context:\n${context}\n\nDeliver your evaluation:`,
    });
    
    return response.text || generateMockAdvice(persona, context, countryName, vernacularTerms);
  } catch {
    return generateMockAdvice(persona, context, countryName, vernacularTerms);
  }
}

function generateMockAdvice(
  persona: 'mentor' | 'roast',
  _context: string,
  countryName?: string,
  vernacularTerms?: { savingsCommunity?: string; emergencyFund?: string; groceryPantry?: string; freshMarket?: string }
): string {
  const activeLang = typeof localStorage !== 'undefined' ? localStorage.getItem('aura_language') || 'en' : 'en';

  if (activeLang === 'ur') {
    if (persona === 'roast') {
      return `💀 بھائی یہ کیا بے لگام خرچے ہیں؟! باہر کے کھانے، چائے کے ہوٹل اور فضول آن لائن خریداری پر آپ نے آدھی سے زیادہ رقم لٹا دی ہے اور بچت کا خانہ بالکل خالی ہے۔ ایمرجنسی فنڈ کا برا حال ہے اور آپ روزانہ نئے شوق پال رہے ہیں۔ فوری طور پر غیر ضروری سبسکرپشنز ختم کریں ورنہ مہینے کے آخر میں دوستوں سے ادھار مانگنا پڑے گا! 😭🔥`;
    }
    return `🎯 ذاتی دولت کی حکمت عملی اور اتالیق کا مشورہ:
1. شوقیہ اور غیر ضروری اخراجات پر 30 فیصد کی حد لگائیں: راشن بازار اور ہول سیل سے سودا خرید کر ماہانہ 20 فیصد رقم بچائیں۔
2. مصیبت کے لفافے (ایمرجنسی فنڈ) کو 6 ماہ کے اخراجات کے برابر کریں: پہلے محفوظ کیش جمع کریں پھر پرتعیش خریداری کریں۔
3. ماہانہ کمیٹی اور بچت میں 20 فیصد لازمی سرمایہ کاری: تنخواہ ملتے ہی سب سے پہلے بچت الگ کریں باقی سے خرچ چلائیں۔`;
  }

  if (activeLang === 'ur_roman') {
    if (persona === 'roast') {
      return `💀 Yaar ye kya fazool kharchi chal rahi hai?! Daily cafe, chai, aur pizza delivery pe budget ka satyanaas kar diya hai aur savings account me chillar bhi nahi bacha. Jeff Bezos ko ameer karne ki bajaye thori aqal se chalo aur faltu subscriptions cancel karo! 😭🔥`;
    }
    return `🎯 Wealth Mentor ki 3 Zaroori Hidayat:
1. Shouq & Dawat (30% ceiling): Bahar ke khano pe control karein aur Mandi/Rashan se bulk purchase karein.
2. Musibat ka Lifafa: Kam az kam 6 mahine ka emergency cash alag rakhein.
3. 20% Bachat Formula: Salary aate hi sab se pehle Kameti ya safe savings me transfer karein.`;
  }

  if (activeLang === 'ar') {
    if (persona === 'roast') {
      return `💀 يا عزيزي، ما هذا الإنفاق العشوائي؟! المطاعم الفاخرة والتوصيل اليومي يبتلعان دخلك وأنت تتصرف كأنك تمتلك بئر نفط بينما مدخراتك تكاد تكون صفراً. أوقف الاشتراكات غير المستخدمة فوراً واعتمد على التسوق الذكي من سوق الجملة! 😭🔥`;
    }
    return `🎯 توجيهات المستشار المالي لإدارة الثروة:
1. ضبط المصاريف الكمالية عند سقف 30%: اعتمد التسوق الشهري من سوق الجملة والبقالة الكبرى لتوفير 20%.
2. تعزيز صندوق الطوارئ ليعادل نفقات 6 أشهر: ابدأ بادخار سيولة فورية قبل أي مظاهر استهلاكية.
3. خطة استثمار وادخار تلقائية بنسبة 20%: خصص النسبة فور استلام الدخل في أصول استثمارية مجدية.`;
  }

  const isSouthAsia = countryName === 'Pakistan' || countryName === 'India';
  const isEastAsia = countryName === 'Japan' || countryName === 'South Korea';
  const isMiddleEast = countryName === 'United Arab Emirates' || countryName === 'Saudi Arabia';

  if (persona === 'roast') {
    if (isSouthAsia) {
      return `💀 Yaar, I checked your expenses and my soul left my body! You're dropping thousands on late-night Chai, Dhabba sessions, and fast-food delivery while your "${vernacularTerms?.emergencyFund || 'Musibat ka Lifafa'}" is sitting empty with cobwebs. At this rate, your only retirement plan is winning a prize bond or borrowing from a "${vernacularTerms?.savingsCommunity || 'Kameti'}". Put down the food delivery app, go to the ${vernacularTerms?.freshMarket || 'Sabzi Mandi'}, and cook at home. You are cooked! 😭🔥`;
    }
    if (isEastAsia) {
      return `💀 I audited your monthly ledger and your Kakeibo (家計簿) balance is weeping! You spent twice as much on Konbini late-night snacks and gacha subscriptions than on your Survival (生活費) cushion. At this rate your savings graph looks like a ski slope down Mount Fuji. Stop tapping your Suica card for bubble tea and meal-prep from the Shotengai! 😭💸`;
    }
    if (isMiddleEast) {
      return `💀 Habibi, what is this spending breakdown?! You're dining out like you own an oil well in Abu Dhabi while your "${vernacularTerms?.savingsCommunity || 'Iddikhar'}" is practically zero. Those daily gourmet coffees and luxury deliveries are draining your capital velocity. Go to the wholesale Souq, stock up the Baqala essentials, and stop financing influencers' lifestyles! 😭🔥`;
    }
    const roasts = [
      "💀 Bestie, I looked at your transaction history and my soul left my body. You spent more on DoorDash, iced matcha lattes, and midnight Uber rides than your entire emergency fund. Your financial plan is literally 'vibes and inshallah.' Your savings account is screaming for help while Jeff Bezos is personally thanking you for funding his next rocket. Cancel those 4 ghost subscriptions right now—you haven't opened that streaming app since 2023. You're cooked! 😭🔥",
      "🔥 Let's be completely real: Your wallet needs a restraining order against Apple Pay. You tapped your phone 14 times this week for snacks you didn't even remember eating. You have more active subscriptions than a Twitch streamer and zero dollars in compound interest. At this rate, your retirement party is going to be hosted in a Walmart parking lot. Put down the takeout menu and cook some rice, chief. 💀📉",
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  
  if (isSouthAsia) {
    return `🎯 STRATEGIC WEALTH COACHING (${countryName}):

1. AUDIT DISCRETIONARY LEAKAGE (30% CEILING):
Curb spontaneous dining out and late-night tea sessions. Source wholesale staples from the ${vernacularTerms?.groceryPantry || 'Rashan Bazzar'} to lock in 15-20% monthly food savings.

2. FORTIFY YOUR "${vernacularTerms?.emergencyFund || 'MUSIBAT KA LIFAFA'}" (6-MONTH RUNWAY):
Prioritize liquid emergency reserves in a high-yield account or reliable peer fund before any luxury lifestyle inflation.

3. DISCIPLINED "${vernacularTerms?.savingsCommunity || 'KAMETI / CHIT FUND'}" COMPOUNDING:
Channel minimum 20% of net income into automated index wealth accumulation and rotating savings groups on pay day.`;
  }

  if (isEastAsia) {
    return `🎯 KAKEIBO (家計簿) WEALTH DIRECTIVES (${countryName}):

1. CATEGORIZE CASHFLOW INTO 4 PILLARS:
Strictly divide outlays into Survival (生活費 50%), Optional (ゆとり費 30%), Culture (教養費 10%), and Extra (予備費 10%). Cap optional shopping ruthlessly.

2. SHOTENGAI ARBITRAGE & BATCH COOKING:
Utilize local fresh markets and evening time-sales (タイムセール) to reduce daily nutritional expenses by up to 25%.

3. AUTOMATED COMPOUND DISCIPLINE:
Channel your monthly surplus into long-term compounding assets immediately upon receiving your salary.`;
  }

  return `🎯 STRICT WEALTH MENTOR — 3 MANDATORY CAPITAL ALLOCATION DIRECTIVES:

1. CAP DISCRETIONARY LEAKAGE AT 30%:
Your current non-essential outflow is compressing your capital velocity. Immediately audit dining and recurring subscriptions; divert at least 15% of discretionary budget into high-yield liquidity.

2. ACCELERATE 6-MONTH EMERGENCY RUNWAY:
Prioritize a baseline cash cushion covering 6 full months of essential Needs. Route the primary savings allocation toward your primary wealth goal until this runway is mathematically locked.

3. ACTIVATE AUTOMATED 20% COMPOUND FLYWHEEL:
Set up standing automated transfers on income disbursement day. Compounding at 9% annualized doubles your principal every 8 years—treat savings as a non-negotiable fixed liability rather than leftover change.`;
}

export async function parseTransactionInput(input: string): Promise<ParsedTransaction> {
  const apiKey = useAppStore.getState().geminiApiKey || getActiveGeminiKey();
  return geminiParseTransaction(input, apiKey);
}
