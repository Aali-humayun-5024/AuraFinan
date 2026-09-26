// AuraFinance OS — Dynamic User-Crafted Experience Persona Generator
// Synthesizes a mathematically consistent 50/30/20 financial universe locally in IndexedDB
import { db } from '../db/database';
import type { CustomPersonaProfile, Transaction, FinancialGoal, Subscription, UserProfile, IOUTransaction } from '../db/database';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ─── CURATED INSPIRATION PRESETS (Judge 1-Tap Quick Fill) ───
export const INSPIRATION_PERSONA_PRESETS: CustomPersonaProfile[] = [
  {
    id: 'medical_resident',
    name: 'Struggling Medical Resident',
    avatarIcon: '🩺',
    userRole: 'early_career',
    monthlyIncome: 4800,
    currency: 'USD',
    lifestyleTier: 'frugal',
    primaryGoal: {
      title: 'Pay Off Med School Loans',
      targetAmount: 45000,
      timelineMonths: 24,
    },
    biggestExpenseLeak: 'rent_living',
    culturalContext: 'US',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'remote_nomad_dubai',
    name: 'Single Nomad in Dubai / Bali',
    avatarIcon: '🌴',
    userRole: 'freelancer',
    monthlyIncome: 8500,
    currency: 'USD',
    lifestyleTier: 'balanced',
    primaryGoal: {
      title: 'Coastal Plot Land Acquisition',
      targetAmount: 35000,
      timelineMonths: 18,
    },
    biggestExpenseLeak: 'dining_out',
    culturalContext: 'AE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ai_founder',
    name: 'Bootstrap AI Startup Founder',
    avatarIcon: '⚡',
    userRole: 'business_owner',
    monthlyIncome: 6200,
    currency: 'USD',
    lifestyleTier: 'frugal',
    primaryGoal: {
      title: '12-Month Seed Stage Runway',
      targetAmount: 60000,
      timelineMonths: 12,
    },
    biggestExpenseLeak: 'gadgets_tech',
    culturalContext: 'US',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'crypto_day_trader',
    name: 'High-Beta Crypto & Quant Trader',
    avatarIcon: '📈',
    userRole: 'freelancer',
    monthlyIncome: 14000,
    currency: 'USD',
    lifestyleTier: 'lavish',
    primaryGoal: {
      title: 'Secure Cold-Storage Treasury',
      targetAmount: 120000,
      timelineMonths: 15,
    },
    biggestExpenseLeak: 'shopping',
    culturalContext: 'AE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lahore_tech_lead',
    name: 'Lahore Remote Engineering Lead',
    avatarIcon: '🇵🇰',
    userRole: 'early_career',
    monthlyIncome: 650000,
    currency: 'PKR',
    lifestyleTier: 'balanced',
    primaryGoal: {
      title: 'DHA Plot & Ghar Construction',
      targetAmount: 4500000,
      timelineMonths: 14,
    },
    biggestExpenseLeak: 'dining_out',
    culturalContext: 'PK',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'genz_motion_designer',
    name: 'Gen-Z Freelance 3D Designer',
    avatarIcon: '🎨',
    userRole: 'student',
    monthlyIncome: 3200,
    currency: 'EUR',
    lifestyleTier: 'balanced',
    primaryGoal: {
      title: 'M3 Max Studio Workstation',
      targetAmount: 4200,
      timelineMonths: 6,
    },
    biggestExpenseLeak: 'gadgets_tech',
    culturalContext: 'GB',
    createdAt: new Date().toISOString(),
  },
];

// Approximate conversion multiplier to USD for realistic amountInUSD field
function getUSDRate(currency: string): number {
  switch (currency.toUpperCase()) {
    case 'PKR': return 1 / 278.5;
    case 'INR': return 1 / 86.5;
    case 'EUR': return 1.08;
    case 'GBP': return 1.28;
    case 'AED': return 1 / 3.6725;
    case 'CAD': return 1 / 1.38;
    case 'JPY': return 1 / 152.0;
    default: return 1.0;
  }
}

// ─── LOCALIZED MERCHANT & COMMODITY DICTIONARY ───
interface CulturalPack {
  groceries: { merchant: string; item: string }[];
  utilities: { merchant: string; item: string }[];
  transport: { merchant: string; item: string }[];
  dining: { merchant: string; item: string }[];
  health: { merchant: string; item: string }[];
}

function getCulturalPack(countryCode: string): CulturalPack {
  const code = countryCode.toUpperCase();
  if (code === 'PK') {
    return {
      groceries: [
        { merchant: 'Imtiaz Super Market', item: 'Monthly Wholesale Rashan (Atta, Ghee, Daal)' },
        { merchant: 'Kiryana General Store', item: 'Organic Brown Eggs & Milk Pack' },
        { merchant: 'Sabzi & Fruit Mandi', item: 'Fresh Seasonal Farm Produce' },
        { merchant: 'Meat One Butchery', item: 'Fresh Boneless Chicken & Mutton' },
      ],
      utilities: [
        { merchant: 'K-Electric / LESCO', item: 'Monthly Electricity & Tariff Bill' },
        { merchant: 'SSGC Gas Utility', item: 'Piped Natural Gas Meter Bill' },
        { merchant: 'PTCL Flash Fiber', item: '100 Mbps Gigabit Home Fiber' },
      ],
      transport: [
        { merchant: 'Shell V-Power Fuel', item: 'Full Tank Petrol Fill-Up' },
        { merchant: 'Careem / Indrive', item: 'Daily Work Commute & Rides' },
        { merchant: 'Total Parco', item: 'Engine Oil & Car Maintenance' },
      ],
      dining: [
        { merchant: 'Kolachi Seafood', item: 'Weekend Family Dinner Out' },
        { merchant: 'Espresso Cafe', item: 'Cold Brew & Artisan Croissant' },
        { merchant: 'Kababjees Bakers', item: 'Specialty Birthday Cake & Treats' },
      ],
      health: [
        { merchant: 'Chughtai Lab', item: 'Quarterly Routine Wellness Bloodwork' },
        { merchant: 'Fazal Din Pharma', item: 'Vitamins & Daily Supplements' },
      ],
    };
  }

  if (code === 'AE') {
    return {
      groceries: [
        { merchant: 'Spinneys Dubai', item: 'Weekly Organic Grocery Basket' },
        { merchant: 'Carrefour Hypermarket', item: 'Pantry Bulk Restock & Olive Oil' },
        { merchant: 'Lulu Hypermarket', item: 'Fresh Seafood & Mediterranean Veggies' },
      ],
      utilities: [
        { merchant: 'DEWA Dubai', item: 'Water & Electricity Utility Bill' },
        { merchant: 'Du Telecom', item: 'Home Ultra 5G Broadband' },
      ],
      transport: [
        { merchant: 'ENOC Petrol', item: 'Special 95 Vehicle Refueling' },
        { merchant: 'Careem Dubai', item: 'Tesla Airport & Business Transfers' },
        { merchant: 'RTA Dubai', item: 'Gold Class Nol Card Recharge' },
      ],
      dining: [
        { merchant: 'Zuma DIFC', item: 'Client Strategy Lunch & Sushi' },
        { merchant: '% Arabica Dubai Mall', item: 'Kyoto Latte & Matcha' },
        { merchant: 'Salt Kite Beach', item: 'Sliders & Beachfront Treats' },
      ],
      health: [
        { merchant: 'Aster Pharmacy', item: 'Electrolytes & High-Strength Omega 3' },
      ],
    };
  }

  if (code === 'GB') {
    return {
      groceries: [
        { merchant: "Marks & Spencer Food", item: 'Artisan Sourdough & British Berries' },
        { merchant: "Sainsbury's Local", item: 'Weekly Essentials & Dairy' },
        { merchant: 'Waitrose & Partners', item: 'Organic Free-Range Produce' },
      ],
      utilities: [
        { merchant: 'British Gas', item: 'Dual Fuel Home Energy Tariff' },
        { merchant: 'Virgin Media Fibre', item: 'Gigabit M500 Fibre Broadband' },
        { merchant: 'Thames Water', item: 'Monthly Water Services' },
      ],
      transport: [
        { merchant: 'Transport for London', item: 'Zone 1-3 Monthly Tube Oyster' },
        { merchant: 'BP Connect', item: 'Unleaded Fuel Top-Up' },
      ],
      dining: [
        { merchant: 'Dishoom Shoreditch', item: 'Bombay Breakfast & Chai Feast' },
        { merchant: 'Pret A Manger', item: 'Daily Flat White & Protein Pot' },
        { merchant: 'Flat Iron Steak', item: 'Sirloin Steak with Coworkers' },
      ],
      health: [
        { merchant: 'Boots Pharmacy', item: 'Winter Vitamin D3 & Daily Essentials' },
      ],
    };
  }

  // Default / US / Worldwide
  return {
    groceries: [
      { merchant: "Trader Joe's", item: 'Weekly Organic Grocery Haul' },
      { merchant: 'Costco Wholesale', item: 'Bulk Pantry Staples & Paper Goods' },
      { merchant: 'Whole Foods Market', item: 'Grass-Fed Meat & Wild Salmon' },
      { merchant: 'Local Farmers Market', item: 'Farm Fresh Organic Greens & Honey' },
    ],
    utilities: [
      { merchant: 'Consolidated Energy Co.', item: 'Electric & Heating Monthly Grid' },
      { merchant: 'Verizon / AT&T Fiber', item: 'Gigabit Symmetric Home Fiber' },
      { merchant: 'Municipal Utility', item: 'Water & Trash Services' },
    ],
    transport: [
      { merchant: 'Chevron / Shell Station', item: 'Premium Unleaded Vehicle Fuel' },
      { merchant: 'Uber Technologies', item: 'Rideshare to Airport & Meetings' },
      { merchant: 'City Metro Transit', item: 'Monthly Unlimited Transit Pass' },
    ],
    dining: [
      { merchant: 'Sweetgreen Harvest', item: 'Crispy Rice Salad & Kombucha' },
      { merchant: 'Blue Bottle Coffee', item: 'Single Origin Pour Over & Oat Milk' },
      { merchant: 'Artisan Trattoria', item: 'Handmade Pasta & Wine Tasting' },
      { merchant: 'Shake Shack', item: 'Double SmokeShack & Concrete Shake' },
    ],
    health: [
      { merchant: 'CVS Health / Walgreens', item: 'Multivitamins & Athletic Supplements' },
      { merchant: 'Equinox / Local Fitness', item: 'CrossFit & Recovery Session' },
    ],
  };
}

// ─── SUBSCRIPTION GENERATOR BY ROLE ───
function getSubscriptionsForRole(
  role: CustomPersonaProfile['userRole'],
  currency: string,
  income: number
): Omit<Subscription, 'id'>[] {
  const isPKR = currency === 'PKR';
  const scale = isPKR ? 280 : 1;

  if (role === 'student') {
    return [
      {
        name: 'Spotify Student Premium',
        amount: Math.round(5.99 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: daysAgo(-12),
        isActive: true,
        merchant: 'Spotify AB',
        autoCancelDraft: 'Cancel Spotify Student subscription via account settings.',
      },
      {
        name: 'Notion Plus & AI for Education',
        amount: Math.round(4.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Productivity',
        nextBillingDate: daysAgo(-18),
        isActive: true,
        merchant: 'Notion Labs',
      },
      {
        name: 'Quizlet Plus / Study Pack',
        amount: Math.round(7.99 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Education',
        nextBillingDate: daysAgo(-5),
        isActive: true,
        merchant: 'Quizlet Inc.',
      },
    ];
  }

  if (role === 'freelancer') {
    return [
      {
        name: 'Adobe Creative Cloud All Apps',
        amount: Math.round(59.99 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Software & Tools',
        nextBillingDate: daysAgo(-8),
        isActive: true,
        merchant: 'Adobe Systems',
        autoCancelDraft: 'Downgrade to Photography plan to save 70% monthly.',
      },
      {
        name: 'Figma Professional Team Seat',
        amount: Math.round(15.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Software & Tools',
        nextBillingDate: daysAgo(-14),
        isActive: true,
        merchant: 'Figma Inc.',
      },
      {
        name: 'GitHub Copilot Business',
        amount: Math.round(19.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Software & Tools',
        nextBillingDate: daysAgo(-22),
        isActive: true,
        merchant: 'GitHub Inc.',
      },
      {
        name: 'Claude Pro + ChatGPT Plus AI Stack',
        amount: Math.round(40.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'AI Copilots',
        nextBillingDate: daysAgo(-3),
        isActive: true,
        merchant: 'Anthropic / OpenAI',
      },
    ];
  }

  if (role === 'business_owner') {
    return [
      {
        name: 'Google Workspace Enterprise',
        amount: Math.round(72.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Operations',
        nextBillingDate: daysAgo(-10),
        isActive: true,
        merchant: 'Google LLC',
      },
      {
        name: 'Slack Business+ Workspace',
        amount: Math.round(45.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Operations',
        nextBillingDate: daysAgo(-19),
        isActive: true,
        merchant: 'Slack / Salesforce',
      },
      {
        name: 'AWS Cloud Hosting & Compute',
        amount: Math.round(180.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Infrastructure',
        nextBillingDate: daysAgo(-2),
        isActive: true,
        merchant: 'Amazon Web Services',
      },
      {
        name: 'QuickBooks Online Accountant',
        amount: Math.round(35.0 * scale),
        currency,
        billingCycle: 'monthly',
        category: 'Finance & Compliance',
        nextBillingDate: daysAgo(-15),
        isActive: true,
        merchant: 'Intuit',
      },
    ];
  }

  // Early Career / Default
  return [
    {
      name: 'High-Density Gym & Health Club',
      amount: Math.round(65.0 * scale),
      currency,
      billingCycle: 'monthly',
      category: 'Health & Fitness',
      nextBillingDate: daysAgo(-7),
      isActive: true,
      merchant: 'Fitness Club',
    },
    {
      name: 'Netflix 4K HDR Family Stream',
      amount: Math.round(22.99 * scale),
      currency,
      billingCycle: 'monthly',
      category: 'Entertainment',
      nextBillingDate: daysAgo(-16),
      isActive: true,
      merchant: 'Netflix Inc.',
    },
    {
      name: 'Apple One Premier Bundle',
      amount: Math.round(37.95 * scale),
      currency,
      billingCycle: 'monthly',
      category: 'Cloud & Media',
      nextBillingDate: daysAgo(-24),
      isActive: true,
      merchant: 'Apple Services',
    },
    {
      name: 'Audible Premium Plus',
      amount: Math.round(14.95 * scale),
      currency,
      billingCycle: 'monthly',
      category: 'Learning',
      nextBillingDate: daysAgo(-11),
      isActive: true,
      merchant: 'Audible Inc.',
    },
  ];
}

// ─── MAIN GENERATOR FUNCTION ───
export async function generateAndSeedCustomPersona(
  profile: CustomPersonaProfile
): Promise<{
  transactionCount: number;
  goalCount: number;
  subscriptionCount: number;
  iouCount: number;
}> {
  const {
    monthlyIncome,
    currency,
    lifestyleTier,
    biggestExpenseLeak,
    culturalContext,
    userRole,
    name,
    avatarIcon,
  } = profile;

  const usdRate = getUSDRate(currency);
  const pack = getCulturalPack(culturalContext);

  // 1. Determine Needs / Wants / Savings target percentages
  let needsPct = 0.50;
  let wantsPct = 0.30;
  let savingsPct = 0.20;

  if (lifestyleTier === 'frugal') {
    needsPct = 0.50;
    wantsPct = 0.20;
    savingsPct = 0.30;
  } else if (lifestyleTier === 'lavish') {
    needsPct = 0.40;
    wantsPct = 0.45;
    savingsPct = 0.15;
  }

  const targetNeedsAmt = monthlyIncome * needsPct;
  const targetWantsAmt = monthlyIncome * wantsPct;
  const targetSavingsAmt = monthlyIncome * savingsPct;

  // 2. Generate Incomes (1 or 2 entries)
  const transactions: Omit<Transaction, 'id'>[] = [];

  if (userRole === 'freelancer' || userRole === 'business_owner') {
    const mainPayout = Math.round(monthlyIncome * 0.68);
    const secondaryPayout = Math.round(monthlyIncome - mainPayout);

    transactions.push({
      title: `${userRole === 'business_owner' ? 'Enterprise Client Retainer' : 'Senior Design Retainer'} Payout`,
      amount: mainPayout,
      originalCurrency: currency,
      amountInUSD: Math.round(mainPayout * usdRate * 100) / 100,
      type: 'income',
      bucket: 'savings',
      category: 'Income',
      merchant: 'Stripe Direct Deposit',
      date: daysAgo(2),
      isRecurring: true,
      tags: ['primary-income', 'client-retainer'],
      profileId: 'household',
    });

    transactions.push({
      title: 'Milestone Delivery Bonus & Secondary Contract',
      amount: secondaryPayout,
      originalCurrency: currency,
      amountInUSD: Math.round(secondaryPayout * usdRate * 100) / 100,
      type: 'income',
      bucket: 'savings',
      category: 'Income',
      merchant: 'Global Wire / Deel',
      date: daysAgo(16),
      isRecurring: false,
      tags: ['secondary-income', 'bonus'],
      profileId: 'household',
    });
  } else if (userRole === 'student') {
    const stipend = Math.round(monthlyIncome * 0.65);
    const tutoring = Math.round(monthlyIncome - stipend);

    transactions.push({
      title: 'Monthly Academic Stipend / Family Allowance',
      amount: stipend,
      originalCurrency: currency,
      amountInUSD: Math.round(stipend * usdRate * 100) / 100,
      type: 'income',
      bucket: 'savings',
      category: 'Income',
      merchant: 'University Campus Accounts',
      date: daysAgo(1),
      isRecurring: true,
      tags: ['stipend', 'allowance'],
      profileId: 'household',
    });

    transactions.push({
      title: 'Peer Tutoring & Lab Assistant Pay',
      amount: tutoring,
      originalCurrency: currency,
      amountInUSD: Math.round(tutoring * usdRate * 100) / 100,
      type: 'income',
      bucket: 'savings',
      category: 'Income',
      merchant: 'Direct Zelle / Bank',
      date: daysAgo(14),
      isRecurring: false,
      tags: ['tutoring', 'part-time'],
      profileId: 'household',
    });
  } else {
    // Early Career / Retiree / Custom
    transactions.push({
      title: `Monthly Professional Salary & Compensation (${name})`,
      amount: monthlyIncome,
      originalCurrency: currency,
      amountInUSD: Math.round(monthlyIncome * usdRate * 100) / 100,
      type: 'income',
      bucket: 'savings',
      category: 'Income',
      merchant: 'Automated ACH / Bank Transfer',
      date: daysAgo(1),
      isRecurring: true,
      tags: ['salary', 'main-income'],
      profileId: 'household',
    });
  }

  // 3. Generate Needs Expenses (~50%)
  // Major Fixed: Rent / Housing
  const rentAmt = Math.round(targetNeedsAmt * (biggestExpenseLeak === 'rent_living' ? 0.65 : 0.50));
  transactions.push({
    title: biggestExpenseLeak === 'rent_living'
      ? 'Luxury High-Floor Residence Rent & Building Dues'
      : 'Monthly Apartment Residence Rent',
    amount: rentAmt,
    originalCurrency: currency,
    amountInUSD: Math.round(rentAmt * usdRate * 100) / 100,
    type: 'expense',
    bucket: 'needs',
    category: 'Housing & Rent',
    merchant: 'Property Management Escrow',
    date: daysAgo(3),
    isRecurring: true,
    tags: ['housing', 'rent', 'essential'],
    profileId: 'household',
  });

  // Groceries / Food (3-4 items)
  const remainingNeeds = targetNeedsAmt - rentAmt;
  const grocerySlice = Math.round(remainingNeeds * 0.45);
  pack.groceries.forEach((g, idx) => {
    const share = Math.round(grocerySlice / pack.groceries.length * (1 + (idx % 2 === 0 ? 0.15 : -0.15)));
    transactions.push({
      title: g.item,
      amount: share,
      originalCurrency: currency,
      amountInUSD: Math.round(share * usdRate * 100) / 100,
      type: 'expense',
      bucket: 'needs',
      category: 'Food & Dining',
      merchant: g.merchant,
      date: daysAgo(2 + idx * 6),
      isRecurring: idx === 0,
      tags: ['groceries', 'supermarket', 'rashan'],
      profileId: 'household',
    });
  });

  // Utilities (2-3 items)
  const utilitySlice = Math.round(remainingNeeds * 0.30);
  pack.utilities.forEach((u, idx) => {
    const share = Math.round(utilitySlice / pack.utilities.length);
    transactions.push({
      title: u.item,
      amount: share,
      originalCurrency: currency,
      amountInUSD: Math.round(share * usdRate * 100) / 100,
      type: 'expense',
      bucket: 'needs',
      category: 'Utilities & Bills',
      merchant: u.merchant,
      date: daysAgo(5 + idx * 7),
      isRecurring: true,
      tags: ['utilities', 'bills'],
      profileId: 'household',
    });
  });

  // Transport (2 items)
  const transportSlice = Math.round(remainingNeeds * 0.25);
  pack.transport.slice(0, 2).forEach((tr, idx) => {
    const share = Math.round(transportSlice / 2);
    transactions.push({
      title: tr.item,
      amount: share,
      originalCurrency: currency,
      amountInUSD: Math.round(share * usdRate * 100) / 100,
      type: 'expense',
      bucket: 'needs',
      category: 'Transport',
      merchant: tr.merchant,
      date: daysAgo(4 + idx * 11),
      isRecurring: false,
      tags: ['transport', 'commute'],
      profileId: 'household',
    });
  });

  // 4. Generate Wants Expenses (~30%) heavily calibrated to biggestExpenseLeak
  let leakMultiplier = 0.55; // 55% of wants dedicated to the leak
  const leakBudget = Math.round(targetWantsAmt * leakMultiplier);
  const remainingWants = targetWantsAmt - leakBudget;

  if (biggestExpenseLeak === 'dining_out') {
    const diningItems = [
      { title: 'Fine Dining Degustation & Wine Pairing', amt: Math.round(leakBudget * 0.40), day: 4, merchant: pack.dining[0]?.merchant || 'Boutique Bistro' },
      { title: 'Artisan Espresso Bar & Pastry Run', amt: Math.round(leakBudget * 0.15), day: 8, merchant: pack.dining[1]?.merchant || 'Third Wave Roasters' },
      { title: 'Late-Night Food Delivery Feast', amt: Math.round(leakBudget * 0.25), day: 12, merchant: 'DoorDash / UberEats' },
      { title: 'Sunday Brunch & Specialty Mocktails', amt: Math.round(leakBudget * 0.20), day: 19, merchant: pack.dining[2]?.merchant || 'Garden Cafe' },
    ];
    diningItems.forEach((d) => {
      transactions.push({
        title: d.title,
        amount: d.amt,
        originalCurrency: currency,
        amountInUSD: Math.round(d.amt * usdRate * 100) / 100,
        type: 'expense',
        bucket: 'wants',
        category: 'Food & Dining',
        merchant: d.merchant,
        date: daysAgo(d.day),
        isRecurring: false,
        tags: ['dining-out', 'impulse-leak', 'lifestyle'],
        profileId: 'personal',
      });
    });
  } else if (biggestExpenseLeak === 'gadgets_tech') {
    const techItems = [
      { title: 'Custom Mechanical Keyboard & Desk Accessories', amt: Math.round(leakBudget * 0.35), day: 6, merchant: 'MechanicalKeyboards.com' },
      { title: 'Dell 32-inch 4K USB-C Hub Monitor', amt: Math.round(leakBudget * 0.45), day: 15, merchant: 'Dell Technologies' },
      { title: 'Noise-Cancelling Studio Headphones', amt: Math.round(leakBudget * 0.20), day: 22, merchant: 'Bose / Sony Store' },
    ];
    techItems.forEach((t) => {
      transactions.push({
        title: t.title,
        amount: t.amt,
        originalCurrency: currency,
        amountInUSD: Math.round(t.amt * usdRate * 100) / 100,
        type: 'expense',
        bucket: 'wants',
        category: 'Shopping',
        merchant: t.merchant,
        date: daysAgo(t.day),
        isRecurring: false,
        tags: ['gadgets', 'tech-hardware', 'impulse-leak'],
        profileId: 'personal',
      });
    });
  } else if (biggestExpenseLeak === 'shopping') {
    const shopItems = [
      { title: 'Designer Minimalist Wardrobe Essentials', amt: Math.round(leakBudget * 0.45), day: 7, merchant: 'SSENSE / Zara' },
      { title: 'Bespoke Leather Sneakers & Care Kit', amt: Math.round(leakBudget * 0.35), day: 14, merchant: 'Common Projects' },
      { title: 'Aesthetic Japanese Stationery & Desk Mat', amt: Math.round(leakBudget * 0.20), day: 23, merchant: 'Tokyo Stationery Co.' },
    ];
    shopItems.forEach((s) => {
      transactions.push({
        title: s.title,
        amount: s.amt,
        originalCurrency: currency,
        amountInUSD: Math.round(s.amt * usdRate * 100) / 100,
        type: 'expense',
        bucket: 'wants',
        category: 'Shopping',
        merchant: s.merchant,
        date: daysAgo(s.day),
        isRecurring: false,
        tags: ['shopping', 'apparel', 'impulse-leak'],
        profileId: 'personal',
      });
    });
  } else if (biggestExpenseLeak === 'travel') {
    const travelItems = [
      { title: 'Boutique Forest Eco-Cabin Weekend Booking', amt: Math.round(leakBudget * 0.55), day: 9, merchant: 'Airbnb Superhost' },
      { title: 'Roundtrip Regional Flight Ticket', amt: Math.round(leakBudget * 0.30), day: 17, merchant: 'Delta / Emirates' },
      { title: 'Ultra-Light Travel Backpack Gear', amt: Math.round(leakBudget * 0.15), day: 25, merchant: 'Peak Design' },
    ];
    travelItems.forEach((tr) => {
      transactions.push({
        title: tr.title,
        amount: tr.amt,
        originalCurrency: currency,
        amountInUSD: Math.round(tr.amt * usdRate * 100) / 100,
        type: 'expense',
        bucket: 'wants',
        category: 'Travel & Trips',
        merchant: tr.merchant,
        date: daysAgo(tr.day),
        isRecurring: false,
        tags: ['travel', 'wanderlust', 'impulse-leak'],
        profileId: 'personal',
      });
    });
  } else {
    // rent_living was handled in needs, distribute remaining wants to lifestyle
    transactions.push({
      title: 'Mid-Century Interior Lamp & Velvet Cushions',
      amount: Math.round(leakBudget * 0.60),
      originalCurrency: currency,
      amountInUSD: Math.round(leakBudget * 0.60 * usdRate * 100) / 100,
      type: 'expense',
      bucket: 'wants',
      category: 'Housing & Rent',
      merchant: 'West Elm / Design Within Reach',
      date: daysAgo(10),
      isRecurring: false,
      tags: ['home-decor', 'aesthetic'],
      profileId: 'personal',
    });
  }

  // General Wants (Coffee, Cinema, Fun)
  const coffeeAmt = Math.round(remainingWants * 0.40);
  transactions.push({
    title: 'Daily Artisan Flat Whites & Bakery Treats',
    amount: coffeeAmt,
    originalCurrency: currency,
    amountInUSD: Math.round(coffeeAmt * usdRate * 100) / 100,
    type: 'expense',
    bucket: 'wants',
    category: 'Food & Dining',
    merchant: pack.dining[1]?.merchant || 'Specialty Coffee Bar',
    date: daysAgo(5),
    isRecurring: false,
    tags: ['coffee', 'treats'],
    profileId: 'personal',
  });

  const entertainAmt = Math.round(remainingWants * 0.60);
  transactions.push({
    title: 'Weekend Cinema IMAX & Arcade Outing',
    amount: entertainAmt,
    originalCurrency: currency,
    amountInUSD: Math.round(entertainAmt * usdRate * 100) / 100,
    type: 'expense',
    bucket: 'wants',
    category: 'Entertainment',
    merchant: 'IMAX Theatres',
    date: daysAgo(11),
    isRecurring: false,
    tags: ['cinema', 'entertainment'],
    profileId: 'personal',
  });

  // 5. Generate Savings & Investments (~20%)
  const indexFundAmt = Math.round(targetSavingsAmt * 0.60);
  transactions.push({
    title: `Automated S&P / Global ETF Index Investment (${name})`,
    amount: indexFundAmt,
    originalCurrency: currency,
    amountInUSD: Math.round(indexFundAmt * usdRate * 100) / 100,
    type: 'expense',
    bucket: 'savings',
    category: 'Investments',
    merchant: 'Vanguard / Interactive Brokers',
    date: daysAgo(4),
    isRecurring: true,
    tags: ['future-you', 'investing', 'compounding'],
    profileId: 'household',
  });

  const highYieldSavingsAmt = Math.round(targetSavingsAmt * 0.40);
  transactions.push({
    title: 'High-Yield Emergency Vault Deposit',
    amount: highYieldSavingsAmt,
    originalCurrency: currency,
    amountInUSD: Math.round(highYieldSavingsAmt * usdRate * 100) / 100,
    type: 'expense',
    bucket: 'savings',
    category: 'Savings',
    merchant: 'Aura High-Yield Vault (5.2% APY)',
    date: daysAgo(5),
    isRecurring: true,
    tags: ['emergency-fund', 'savings'],
    profileId: 'household',
  });

  // 6. Subscriptions tailored to role
  const subscriptions = getSubscriptionsForRole(userRole, currency, monthlyIncome);

  // 7. Life Goals (Primary from user + Secondary Emergency Runway)
  const primaryGoal = profile.primaryGoal;
  const initialGoalProgress = Math.round(primaryGoal.targetAmount * 0.28);
  const deadlineDays = Math.max(30, Math.round(primaryGoal.timelineMonths * 30));

  const goals: Omit<FinancialGoal, 'id'>[] = [
    {
      title: primaryGoal.title,
      targetAmount: primaryGoal.targetAmount,
      currentAmount: initialGoalProgress,
      deadline: daysAgo(-deadlineDays),
      category: 'Primary Mission',
      icon: avatarIcon || '🎯',
      profileId: 'household',
    },
    {
      title: '6-Month Emergency Peace of Mind Vault',
      targetAmount: Math.round(monthlyIncome * 3.5),
      currentAmount: Math.round(monthlyIncome * 1.4),
      deadline: daysAgo(-270),
      category: 'Safety Net',
      icon: '🛡️',
      profileId: 'household',
    },
  ];

  // 8. Realistic Peer IOU Settler records
  const friendBillShare = Math.round(monthlyIncome * 0.035);
  const ious: Omit<IOUTransaction, 'id'>[] = [
    {
      title: 'Friday Team Dinner & Artisanal Pizzas',
      totalBill: friendBillShare * 2,
      myShare: friendBillShare,
      friendName: 'Alex Vance',
      friendPhone: '+1 415 890 2314',
      friendShare: friendBillShare,
      currency,
      status: 'pending',
      createdAt: daysAgo(3),
      direction: 'they_owe_me',
      category: 'Dining',
      notes: 'Paid on corporate card; Alex owes his half.',
    },
    {
      title: 'Uber Premier to Downtown Tech Summit',
      totalBill: Math.round(friendBillShare * 0.8),
      myShare: Math.round(friendBillShare * 0.4),
      friendName: 'Fatima Noor',
      friendPhone: '+971 50 123 4567',
      friendShare: Math.round(friendBillShare * 0.4),
      currency,
      status: 'pending',
      createdAt: daysAgo(7),
      direction: 'i_owe_them',
      category: 'Uber/Taxi',
      notes: 'Fatima booked the ride.',
    },
  ];

  // 9. Profile Entry for Multi-User System
  const userProfile: UserProfile = {
    id: profile.id || `custom-${Date.now()}`,
    name,
    urduName: name,
    role: `${userRole.replace('_', ' ').toUpperCase()} · ${lifestyleTier.toUpperCase()}`,
    avatar: avatarIcon || '✨',
    color: '#6D28D9',
    monthlyBudget: monthlyIncome,
    isDefault: true,
  };

  // 10. Execute Transactional Write to Dexie.js (100% Local IndexedDB)
  await db.transaction('rw', [db.transactions, db.goals, db.subscriptions, db.profiles, db.ious, db.settings, db.auditLogs, db.customPersonas], async () => {
    // Clear previous seed data
    await db.transactions.clear();
    await db.goals.clear();
    await db.subscriptions.clear();
    await db.ious.clear();
    await db.profiles.clear();

    // Insert active user profile
    await db.profiles.add(userProfile);

    // Save custom persona definition to db.customPersonas
    const personaRecord: CustomPersonaProfile = {
      ...profile,
      id: profile.id || userProfile.id,
      createdAt: profile.createdAt || new Date().toISOString(),
    };
    await db.customPersonas.put(personaRecord);

    // Bulk Add generated data
    await db.transactions.bulkAdd(transactions as Transaction[]);
    await db.goals.bulkAdd(goals as FinancialGoal[]);
    await db.subscriptions.bulkAdd(subscriptions as Subscription[]);
    await db.ious.bulkAdd(ious as IOUTransaction[]);

    // Update settings
    const settingsList = await db.settings.toArray();
    if (settingsList.length > 0) {
      await db.settings.update(settingsList[0].id!, {
        activePersona: 'custom',
        baseCurrency: currency as any,
        monthlyIncomeTarget: monthlyIncome,
        detectedCity: culturalContext === 'PK' ? 'Karachi' : culturalContext === 'AE' ? 'Dubai' : culturalContext === 'GB' ? 'London' : 'San Francisco',
      });
    } else {
      await db.settings.add({
        baseCurrency: currency as any,
        aiPersona: 'mentor',
        monthlyIncomeTarget: monthlyIncome,
        isEncrypted: false,
        activePersona: 'custom',
        detectedCity: culturalContext === 'PK' ? 'Karachi' : 'San Francisco',
        familySize: 3,
      });
    }

    // Audit Log
    await db.auditLogs.add({
      timestamp: new Date().toISOString(),
      action: 'CUSTOM_PERSONA_GENERATED',
      details: `Generated financial universe for "${name}" (${userRole}, ${currency} ${monthlyIncome.toLocaleString()}/mo, leak: ${biggestExpenseLeak}). Created ${transactions.length} ledger items, ${goals.length} goals, ${subscriptions.length} subs.`,
      aiGenerated: false,
    });
  });

  return {
    transactionCount: transactions.length,
    goalCount: goals.length,
    subscriptionCount: subscriptions.length,
    iouCount: ious.length,
  };
}
