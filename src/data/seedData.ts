// AuraFinance OS — Persona Seed Data Generator
import { db } from '../db/database';
import type { Transaction, FinancialGoal, Subscription, UserProfile, IOUTransaction } from '../db/database';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'household',
    name: 'Ghar Ka Kharcha (Family)',
    urduName: 'گھر کا راشن و خرچہ',
    role: 'Shared Household & Rashan',
    avatar: '🏠',
    color: '#7c5cfc',
    monthlyBudget: 95000,
    isDefault: true,
  },
  {
    id: 'personal',
    name: 'Mera Zaati (Personal)',
    urduName: 'میرا ذاتی جیب خرچ',
    role: 'Personal Allowance & Shopping',
    avatar: '👤',
    color: '#06b6d4',
    monthlyBudget: 25000,
  },
  {
    id: 'business',
    name: 'Kaarobar / Freelance',
    urduName: 'کاروبار اور سائیڈ بزنس',
    role: 'Client Projects & Side Hustle',
    avatar: '💼',
    color: '#22c55e',
    monthlyBudget: 50000,
  },
  {
    id: 'kids',
    name: 'Bachon Ki Parhai (Kids)',
    urduName: 'بچوں کی اسکول فیس و دیکھ بھال',
    role: 'Education & Childcare',
    avatar: '🎒',
    color: '#f59e0b',
    monthlyBudget: 20000,
  },
];

// ─── Pakistani Household & Rashan Persona ───
const HOUSEHOLD_TRANSACTIONS: Omit<Transaction, 'id'>[] = [
  // Income
  {
    title: 'Monthly Main Salary (Tankhwa)',
    amount: 185000,
    originalCurrency: 'PKR',
    amountInUSD: 664.27,
    type: 'income',
    bucket: 'savings',
    category: 'Income',
    merchant: 'Company Direct Transfer',
    date: daysAgo(1),
    isRecurring: true,
    tags: ['salary', 'income'],
    profileId: 'household',
  },
  {
    title: 'Freelance & Side Project Payout',
    amount: 45000,
    originalCurrency: 'PKR',
    amountInUSD: 161.58,
    type: 'income',
    bucket: 'savings',
    category: 'Income',
    merchant: 'Online Client',
    date: daysAgo(8),
    isRecurring: false,
    tags: ['freelance', 'side-hustle'],
    profileId: 'business',
  },
  // Rashan & Daily Groceries
  {
    title: 'Monthly Wholesale Rashan (Atta, Oil, Daal, Rice, Sugar, Spices)',
    amount: 34500,
    originalCurrency: 'PKR',
    amountInUSD: 123.88,
    type: 'expense',
    bucket: 'needs',
    category: 'Food & Dining',
    merchant: 'Wholesale Grain Market / Imtiaz Mart',
    date: daysAgo(2),
    isRecurring: true,
    tags: ['rashan', 'monthly-groceries', 'household'],
    profileId: 'household',
  },
  {
    title: 'Monthly Fresh Milk (Khula Doodh - 30 Litres)',
    amount: 6300,
    originalCurrency: 'PKR',
    amountInUSD: 22.62,
    type: 'expense',
    bucket: 'needs',
    category: 'Food & Dining',
    merchant: 'Local Gawala Dairy',
    date: daysAgo(1),
    isRecurring: true,
    tags: ['milk', 'dairy', 'daily-essential'],
    profileId: 'household',
  },
  {
    title: 'Farm Eggs (2 Crates - 60 Eggs)',
    amount: 1700,
    originalCurrency: 'PKR',
    amountInUSD: 6.10,
    type: 'expense',
    bucket: 'needs',
    category: 'Food & Dining',
    merchant: 'Wholesale Egg Market',
    date: daysAgo(3),
    isRecurring: false,
    tags: ['eggs', 'breakfast', 'daily-essential'],
    profileId: 'household',
  },
  {
    title: 'Fresh Broiler Chicken Meat (4 kg)',
    amount: 2480,
    originalCurrency: 'PKR',
    amountInUSD: 8.90,
    type: 'expense',
    bucket: 'needs',
    category: 'Food & Dining',
    merchant: 'Corner Chicken Shop',
    date: daysAgo(4),
    isRecurring: false,
    tags: ['chicken', 'meat'],
    profileId: 'household',
  },
  {
    title: 'Weekend Sabzi Mandi (Aloo, Piyaz, Tamatar 5kg each)',
    amount: 4200,
    originalCurrency: 'PKR',
    amountInUSD: 15.08,
    type: 'expense',
    bucket: 'needs',
    category: 'Food & Dining',
    merchant: 'Sunday Sabzi Bachat Bazaar',
    date: daysAgo(6),
    isRecurring: true,
    tags: ['vegetables', 'mandi', 'groceries'],
    profileId: 'household',
  },
  {
    title: 'Beef with Bone (2 kg Family Handi)',
    amount: 1900,
    originalCurrency: 'PKR',
    amountInUSD: 6.82,
    type: 'expense',
    bucket: 'needs',
    category: 'Food & Dining',
    merchant: 'City Meat Butchery',
    date: daysAgo(9),
    isRecurring: false,
    tags: ['meat', 'beef'],
    profileId: 'household',
  },
  // Utilities & Bills
  {
    title: 'Electricity Bill (K-Electric / WAPDA)',
    amount: 18200,
    originalCurrency: 'PKR',
    amountInUSD: 65.35,
    type: 'expense',
    bucket: 'needs',
    category: 'Bills & Utilities',
    merchant: 'K-Electric Bill Payment',
    date: daysAgo(5),
    isRecurring: true,
    tags: ['electricity', 'utilities'],
    profileId: 'household',
  },
  {
    title: 'Domestic LPG Gas Cylinder (11.8 kg)',
    amount: 2832,
    originalCurrency: 'PKR',
    amountInUSD: 10.17,
    type: 'expense',
    bucket: 'needs',
    category: 'Bills & Utilities',
    merchant: 'OGRA Gas Distributor',
    date: daysAgo(11),
    isRecurring: false,
    tags: ['gas', 'cylinder', 'fuel'],
    profileId: 'household',
  },
  {
    title: 'PTCL Flash Fiber Optical Internet (50 Mbps)',
    amount: 3499,
    originalCurrency: 'PKR',
    amountInUSD: 12.56,
    type: 'expense',
    bucket: 'needs',
    category: 'Bills & Utilities',
    merchant: 'PTCL',
    date: daysAgo(7),
    isRecurring: true,
    tags: ['internet', 'wifi'],
    profileId: 'household',
  },
  // Transport & Commute
  {
    title: 'Super Petrol (Bike & Car Commute - 40L)',
    amount: 10736,
    originalCurrency: 'PKR',
    amountInUSD: 38.55,
    type: 'expense',
    bucket: 'needs',
    category: 'Transport',
    merchant: 'PSO Petrol Pump',
    date: daysAgo(3),
    isRecurring: true,
    tags: ['fuel', 'petrol', 'transport'],
    profileId: 'household',
  },
  // Children & Education
  {
    title: 'School Fees & Tuition',
    amount: 16000,
    originalCurrency: 'PKR',
    amountInUSD: 57.45,
    type: 'expense',
    bucket: 'needs',
    category: 'Education',
    merchant: 'City School System',
    date: daysAgo(10),
    isRecurring: true,
    tags: ['school', 'education', 'kids'],
    profileId: 'kids',
  },
  // Health & Medicine
  {
    title: 'Family Medical & Monthly Pharmacy',
    amount: 2400,
    originalCurrency: 'PKR',
    amountInUSD: 8.62,
    type: 'expense',
    bucket: 'needs',
    category: 'Health',
    merchant: 'Servaid Pharmacy',
    date: daysAgo(8),
    isRecurring: false,
    tags: ['medicine', 'pharmacy'],
    profileId: 'household',
  },
  // Wants / Lifestyle
  {
    title: 'Sunday Family Dinner (Al-Rehman Biryani + Chai)',
    amount: 3600,
    originalCurrency: 'PKR',
    amountInUSD: 12.93,
    type: 'expense',
    bucket: 'wants',
    category: 'Food & Dining',
    merchant: 'Biryani Center',
    date: daysAgo(4),
    isRecurring: false,
    tags: ['dining', 'family-treat', 'biryani'],
    profileId: 'personal',
  },
  {
    title: 'Personal Clothing & Tailor Stitching',
    amount: 5200,
    originalCurrency: 'PKR',
    amountInUSD: 18.67,
    type: 'expense',
    bucket: 'wants',
    category: 'Shopping',
    merchant: 'Tariq Road Market',
    date: daysAgo(12),
    isRecurring: false,
    tags: ['clothes', 'shopping'],
    profileId: 'personal',
  },
  // Savings & Future You
  {
    title: 'Monthly Bachat Kameti (بچت کمیٹی Contribution)',
    amount: 25000,
    originalCurrency: 'PKR',
    amountInUSD: 89.76,
    type: 'expense',
    bucket: 'savings',
    category: 'Investment',
    merchant: 'Family Committee',
    date: daysAgo(1),
    isRecurring: true,
    tags: ['kameti', 'savings', 'future-you'],
    profileId: 'household',
  },
  {
    title: 'Meezan Bank Emergency Fund Deposit',
    amount: 15000,
    originalCurrency: 'PKR',
    amountInUSD: 53.86,
    type: 'expense',
    bucket: 'savings',
    category: 'Investment',
    merchant: 'Meezan Islamic Bank',
    date: daysAgo(2),
    isRecurring: true,
    tags: ['emergency-fund', 'halal-savings'],
    profileId: 'household',
  },
];

const HOUSEHOLD_GOALS: Omit<FinancialGoal, 'id'>[] = [
  {
    title: 'Emergency Fund (6 Mah Ka Kharcha) 🛡️',
    targetAmount: 300000,
    currentAmount: 145000,
    deadline: '2027-06-01',
    category: 'Savings',
    icon: '🛡️',
    profileId: 'household',
  },
  {
    title: 'Umrah Mubarak Fund (عمرہ فنڈ) 🕋',
    targetAmount: 550000,
    currentAmount: 220000,
    deadline: '2027-11-01',
    category: 'Travel',
    icon: '🕋',
    profileId: 'household',
  },
  {
    title: 'New Honda 125 Bike Upgrade 🏍️',
    targetAmount: 240000,
    currentAmount: 110000,
    deadline: '2027-04-01',
    category: 'Transport',
    icon: '🏍️',
    profileId: 'personal',
  },
  {
    title: 'Bachat Kameti Payout Pool 💰',
    targetAmount: 100000,
    currentAmount: 65000,
    deadline: '2027-01-01',
    category: 'Investment',
    icon: '💰',
    profileId: 'household',
  },
];

const HOUSEHOLD_SUBSCRIPTIONS: Omit<Subscription, 'id'>[] = [
  {
    name: 'PTCL Flash Fiber (50 Mbps)',
    amount: 3499,
    currency: 'PKR',
    billingCycle: 'monthly',
    category: 'Bills & Utilities',
    nextBillingDate: daysAgo(-20),
    isActive: true,
    merchant: 'PTCL',
    profileId: 'household',
  },
  {
    name: 'Water Tanker & RO Drinking Water',
    amount: 2500,
    currency: 'PKR',
    billingCycle: 'monthly',
    category: 'Bills & Utilities',
    nextBillingDate: daysAgo(-15),
    isActive: true,
    merchant: 'RO Water Supply',
    profileId: 'household',
  },
  {
    name: 'Zong / Jazz Family Data Package',
    amount: 1800,
    currency: 'PKR',
    billingCycle: 'monthly',
    category: 'Bills & Utilities',
    nextBillingDate: daysAgo(-22),
    isActive: true,
    merchant: 'Telecom',
    profileId: 'personal',
  },
  {
    name: 'Netflix Family HD (4 Screens)',
    amount: 1100,
    currency: 'PKR',
    billingCycle: 'monthly',
    category: 'Entertainment',
    nextBillingDate: daysAgo(-26),
    isActive: true,
    merchant: 'Netflix',
    profileId: 'household',
  },
];

// ─── Student Persona (35+ Realistic Transactions) ───
const STUDENT_TRANSACTIONS: Omit<Transaction, 'id'>[] = [
  // Income Sources
  { title: 'Weekly Allowance from Mom', amount: 50, originalCurrency: 'USD', amountInUSD: 50, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Family Transfer', date: daysAgo(1), isRecurring: true, tags: ['allowance'], profileId: 'personal' },
  { title: 'Weekly Allowance from Mom', amount: 50, originalCurrency: 'USD', amountInUSD: 50, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Family Transfer', date: daysAgo(8), isRecurring: true, tags: ['allowance'], profileId: 'personal' },
  { title: 'Weekly Allowance from Mom', amount: 50, originalCurrency: 'USD', amountInUSD: 50, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Family Transfer', date: daysAgo(15), isRecurring: true, tags: ['allowance'], profileId: 'personal' },
  { title: 'Weekly Allowance from Mom', amount: 50, originalCurrency: 'USD', amountInUSD: 50, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Family Transfer', date: daysAgo(22), isRecurring: true, tags: ['allowance'], profileId: 'personal' },
  { title: 'Peer Math Tutoring Session', amount: 35, originalCurrency: 'USD', amountInUSD: 35, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Classmate Tutor', date: daysAgo(3), isRecurring: false, tags: ['tutoring', 'side-hustle'], profileId: 'business' },
  { title: 'Physics Exam Prep Tutoring', amount: 40, originalCurrency: 'USD', amountInUSD: 40, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Neighbor Family', date: daysAgo(10), isRecurring: false, tags: ['tutoring', 'side-hustle'], profileId: 'business' },
  { title: 'Weekend Barista Shift Payout', amount: 65, originalCurrency: 'USD', amountInUSD: 65, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Campus Coffee Roasters', date: daysAgo(17), isRecurring: false, tags: ['job', 'shift'], profileId: 'business' },
  { title: 'Birthday Cash from Grandma 🎁', amount: 75, originalCurrency: 'USD', amountInUSD: 75, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Grandma Gift', date: daysAgo(12), isRecurring: false, tags: ['gift', 'birthday'], profileId: 'personal' },

  // Essential Needs (School, Food, Commute)
  { title: 'Cafeteria Lunch - Pizza Slice & Drink', amount: 6.50, originalCurrency: 'USD', amountInUSD: 6.50, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'School Cafeteria', date: daysAgo(1), isRecurring: false, tags: ['school', 'lunch'], profileId: 'personal' },
  { title: 'Cafeteria Lunch - Grilled Sandwich', amount: 7.25, originalCurrency: 'USD', amountInUSD: 7.25, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'School Cafeteria', date: daysAgo(2), isRecurring: false, tags: ['school', 'lunch'], profileId: 'personal' },
  { title: 'Cafeteria Lunch - Pasta Bowl', amount: 6.75, originalCurrency: 'USD', amountInUSD: 6.75, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'School Cafeteria', date: daysAgo(4), isRecurring: false, tags: ['school', 'lunch'], profileId: 'personal' },
  { title: 'Cafeteria Lunch - Chicken Salad', amount: 8.00, originalCurrency: 'USD', amountInUSD: 8.00, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'School Cafeteria', date: daysAgo(7), isRecurring: false, tags: ['school', 'lunch'], profileId: 'personal' },
  { title: 'City Student Transit Bus Pass', amount: 30.00, originalCurrency: 'USD', amountInUSD: 30.00, type: 'expense', bucket: 'needs', category: 'Transport', merchant: 'City Metro Transit', date: daysAgo(2), isRecurring: true, tags: ['bus', 'transit'], profileId: 'personal' },
  { title: 'Calculus Textbook & Study Guide', amount: 32.50, originalCurrency: 'USD', amountInUSD: 32.50, type: 'expense', bucket: 'needs', category: 'Education', merchant: 'Campus Bookstore', date: daysAgo(14), isRecurring: false, tags: ['textbook', 'school'], profileId: 'personal' },
  { title: 'Chemistry Lab Safety Goggles & Coat', amount: 18.00, originalCurrency: 'USD', amountInUSD: 18.00, type: 'expense', bucket: 'needs', category: 'Education', merchant: 'Lab Supplies Direct', date: daysAgo(20), isRecurring: false, tags: ['lab', 'chemistry'], profileId: 'personal' },
  { title: 'Notebooks, Highlighters & Pens', amount: 14.20, originalCurrency: 'USD', amountInUSD: 14.20, type: 'expense', bucket: 'needs', category: 'Education', merchant: 'Target Stationary', date: daysAgo(5), isRecurring: false, tags: ['stationery'], profileId: 'personal' },
  { title: 'Library Card & Printing Credits', amount: 8.50, originalCurrency: 'USD', amountInUSD: 8.50, type: 'expense', bucket: 'needs', category: 'Education', merchant: 'Public Library', date: daysAgo(9), isRecurring: false, tags: ['printing', 'library'], profileId: 'personal' },
  { title: 'Subway Sandwich after Track Practice', amount: 9.40, originalCurrency: 'USD', amountInUSD: 9.40, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'Subway', date: daysAgo(11), isRecurring: false, tags: ['food', 'sports'], profileId: 'personal' },

  // Wants & Social Life
  { title: 'Spotify Premium Student', amount: 5.99, originalCurrency: 'USD', amountInUSD: 5.99, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Spotify', date: daysAgo(3), isRecurring: true, tags: ['music', 'subscription'], profileId: 'personal' },
  { title: 'Nintendo Switch Online Monthly', amount: 3.99, originalCurrency: 'USD', amountInUSD: 3.99, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Nintendo eShop', date: daysAgo(9), isRecurring: true, tags: ['gaming', 'subscription'], profileId: 'personal' },
  { title: 'Discord Nitro Basic', amount: 2.99, originalCurrency: 'USD', amountInUSD: 2.99, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Discord', date: daysAgo(6), isRecurring: true, tags: ['discord', 'gaming'], profileId: 'personal' },
  { title: 'Boba Milk Tea with Friends 🧋', amount: 6.25, originalCurrency: 'USD', amountInUSD: 6.25, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Kung Fu Tea', date: daysAgo(3), isRecurring: false, tags: ['boba', 'friends'], profileId: 'personal' },
  { title: 'Weekend Movie Night - Ticket & Popcorn', amount: 16.50, originalCurrency: 'USD', amountInUSD: 16.50, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'AMC Theatres', date: daysAgo(5), isRecurring: false, tags: ['movies', 'cinema'], profileId: 'personal' },
  { title: 'Thrift Store Vintage Jacket 🧥', amount: 22.00, originalCurrency: 'USD', amountInUSD: 22.00, type: 'expense', bucket: 'wants', category: 'Shopping', merchant: 'Goodwill Vintage', date: daysAgo(13), isRecurring: false, tags: ['thrifting', 'fashion'], profileId: 'personal' },
  { title: 'Late Night Pizza Slice Hangout', amount: 8.75, originalCurrency: 'USD', amountInUSD: 8.75, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Corner Slice Pizza', date: daysAgo(8), isRecurring: false, tags: ['pizza', 'hangout'], profileId: 'personal' },
  { title: 'Gaming Battle Pass Season Upgrade', amount: 9.99, originalCurrency: 'USD', amountInUSD: 9.99, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Steam Games', date: daysAgo(16), isRecurring: false, tags: ['gaming', 'skins'], profileId: 'personal' },
  { title: 'Ice Cream Sundae with Sister', amount: 5.50, originalCurrency: 'USD', amountInUSD: 5.50, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Dairy Queen', date: daysAgo(18), isRecurring: false, tags: ['dessert'], profileId: 'personal' },
  { title: 'Anime Stickers & Keychains Pack', amount: 6.00, originalCurrency: 'USD', amountInUSD: 6.00, type: 'expense', bucket: 'wants', category: 'Shopping', merchant: 'Etsy Merchant', date: daysAgo(21), isRecurring: false, tags: ['anime', 'hobbies'], profileId: 'personal' },
  { title: 'Starbucks Iced Caramel Macchiato', amount: 5.75, originalCurrency: 'USD', amountInUSD: 5.75, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Starbucks', date: daysAgo(23), isRecurring: false, tags: ['coffee'], profileId: 'personal' },

  // Wealth & Goal Savings
  { title: 'Direct Deposit to PS5 Gaming Rig Fund', amount: 50.00, originalCurrency: 'USD', amountInUSD: 50.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'High Yield Stash', date: daysAgo(1), isRecurring: false, tags: ['ps5-fund', 'goal'], profileId: 'personal' },
  { title: 'Savings Transfer from Tutoring Gig', amount: 35.00, originalCurrency: 'USD', amountInUSD: 35.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'High Yield Stash', date: daysAgo(4), isRecurring: false, tags: ['ps5-fund', 'savings'], profileId: 'personal' },
  { title: 'Emergency Rainy Day Jar Contribution', amount: 20.00, originalCurrency: 'USD', amountInUSD: 20.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Emergency Fund', date: daysAgo(7), isRecurring: false, tags: ['rainy-day'], profileId: 'personal' },
  { title: 'Birthday Cash Allocation to Gaming Rig', amount: 45.00, originalCurrency: 'USD', amountInUSD: 45.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'High Yield Stash', date: daysAgo(12), isRecurring: false, tags: ['ps5-fund', 'goal'], profileId: 'personal' },
  { title: 'Weekly Auto-Save to PS5 Fund', amount: 25.00, originalCurrency: 'USD', amountInUSD: 25.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'High Yield Stash', date: daysAgo(15), isRecurring: true, tags: ['ps5-fund', 'goal'], profileId: 'personal' },
  { title: 'Weekly Auto-Save to PS5 Fund', amount: 25.00, originalCurrency: 'USD', amountInUSD: 25.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'High Yield Stash', date: daysAgo(22), isRecurring: true, tags: ['ps5-fund', 'goal'], profileId: 'personal' },
  { title: 'Weekly Auto-Save to PS5 Fund', amount: 25.00, originalCurrency: 'USD', amountInUSD: 25.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'High Yield Stash', date: daysAgo(29), isRecurring: true, tags: ['ps5-fund', 'goal'], profileId: 'personal' },
];

const STUDENT_GOALS: Omit<FinancialGoal, 'id'>[] = [
  { title: 'PlayStation 5 / Gaming Rig 🎮', targetAmount: 500, currentAmount: 320, deadline: '2027-04-01', category: 'Gaming', icon: '🎮', profileId: 'personal' },
  { title: 'Emergency Pocket Stash 🛡️', targetAmount: 200, currentAmount: 110, deadline: '2027-06-01', category: 'Savings', icon: '🛡️', profileId: 'personal' },
];

const STUDENT_SUBSCRIPTIONS: Omit<Subscription, 'id'>[] = [
  { name: 'Spotify Premium Student', amount: 5.99, currency: 'USD', billingCycle: 'monthly', category: 'Entertainment', nextBillingDate: daysAgo(-27), isActive: true, merchant: 'Spotify', profileId: 'personal' },
  { name: 'City Student Transit Pass', amount: 30, currency: 'USD', billingCycle: 'monthly', category: 'Transport', nextBillingDate: daysAgo(-25), isActive: true, merchant: 'City Transit', profileId: 'personal' },
  { name: 'Nintendo Switch Online', amount: 3.99, currency: 'USD', billingCycle: 'monthly', category: 'Entertainment', nextBillingDate: daysAgo(-21), isActive: true, merchant: 'Nintendo', profileId: 'personal' },
];

// ─── Global Freelancer Persona (50+ Multi-Currency Transactions) ───
const FREELANCER_TRANSACTIONS: Omit<Transaction, 'id'>[] = [
  // Income Sources (Multi-Currency: USD, EUR, PKR)
  { title: 'Upwork Milestone: FinTech UI/UX Redesign', amount: 3500, originalCurrency: 'USD', amountInUSD: 3500, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Upwork Escrow', date: daysAgo(2), isRecurring: false, tags: ['upwork', 'design'], profileId: 'business' },
  { title: 'Stripe Direct Invoice: Mobile App MVP', amount: 5000, originalCurrency: 'USD', amountInUSD: 5000, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Stripe Invoicing', date: daysAgo(14), isRecurring: false, tags: ['stripe', 'mobile-app'], profileId: 'business' },
  { title: 'Berlin Startup Retainer: Design Systems', amount: 2200, originalCurrency: 'EUR', amountInUSD: 2398, type: 'income', bucket: 'savings', category: 'Income', merchant: 'SEPA Transfer Europe', date: daysAgo(8), isRecurring: true, tags: ['retainer', 'euro'], profileId: 'business' },
  { title: 'London Agency Code Review Payout', amount: 1400, originalCurrency: 'GBP', amountInUSD: 1778, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Wise Business Transfer', date: daysAgo(20), isRecurring: false, tags: ['consulting', 'uk'], profileId: 'business' },
  { title: 'Local Corporate Workshop & Advisory', amount: 180000, originalCurrency: 'PKR', amountInUSD: 646.30, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Bank Alfalah Corporate', date: daysAgo(6), isRecurring: false, tags: ['workshop', 'pkr-income'], profileId: 'business' },
  { title: 'Subcontract Developer Mentorship', amount: 45000, originalCurrency: 'INR', amountInUSD: 540.00, type: 'income', bucket: 'savings', category: 'Income', merchant: 'Wire Payout', date: daysAgo(18), isRecurring: false, tags: ['mentorship', 'inr-income'], profileId: 'business' },

  // SaaS & Developer Infrastructure (Business Expenses)
  { title: 'Adobe Creative Cloud All Apps', amount: 54.99, originalCurrency: 'USD', amountInUSD: 54.99, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Adobe Systems', date: daysAgo(4), isRecurring: true, tags: ['saas', 'design'], profileId: 'business' },
  { title: 'Figma Organization Seat License', amount: 15.00, originalCurrency: 'USD', amountInUSD: 15.00, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Figma Inc.', date: daysAgo(4), isRecurring: true, tags: ['saas', 'figma'], profileId: 'business' },
  { title: 'GitHub Pro & Copilot Workspace', amount: 14.00, originalCurrency: 'USD', amountInUSD: 14.00, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'GitHub', date: daysAgo(4), isRecurring: true, tags: ['github', 'copilot'], profileId: 'business' },
  { title: 'Vercel Team Enterprise Hosting', amount: 20.00, originalCurrency: 'USD', amountInUSD: 20.00, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Vercel Inc.', date: daysAgo(4), isRecurring: true, tags: ['hosting', 'vercel'], profileId: 'business' },
  { title: 'AWS Cloud Hosting & Database Instances', amount: 142.50, originalCurrency: 'USD', amountInUSD: 142.50, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Amazon Web Services', date: daysAgo(5), isRecurring: true, tags: ['aws', 'cloud'], profileId: 'business' },
  { title: 'ChatGPT Plus Team AI Subscription', amount: 20.00, originalCurrency: 'USD', amountInUSD: 20.00, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'OpenAI', date: daysAgo(5), isRecurring: true, tags: ['ai', 'chatgpt'], profileId: 'business' },
  { title: 'Notion AI Unlimited Team Workspace', amount: 10.00, originalCurrency: 'USD', amountInUSD: 10.00, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Notion Labs', date: daysAgo(7), isRecurring: true, tags: ['notes', 'productivity'], profileId: 'business' },
  { title: 'Loom Video Messaging Pro Plan', amount: 10.00, originalCurrency: 'USD', amountInUSD: 10.00, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Loom Atlassian', date: daysAgo(8), isRecurring: true, tags: ['async-video'], profileId: 'business' },
  { title: 'Slack Pro Team Communication', amount: 8.75, originalCurrency: 'USD', amountInUSD: 8.75, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: 'Slack Technologies', date: daysAgo(8), isRecurring: true, tags: ['communication'], profileId: 'business' },
  { title: '1Password Business Family Vault', amount: 7.99, originalCurrency: 'USD', amountInUSD: 7.99, type: 'expense', bucket: 'needs', category: 'Tech & SaaS', merchant: '1Password', date: daysAgo(9), isRecurring: true, tags: ['security'], profileId: 'business' },

  // Living Needs (Rent, Utilities, Food)
  { title: 'Monthly Studio Loft Rent Payment', amount: 1400.00, originalCurrency: 'USD', amountInUSD: 1400.00, type: 'expense', bucket: 'needs', category: 'Bills & Utilities', merchant: 'Loft Property Management', date: daysAgo(1), isRecurring: true, tags: ['rent', 'housing'], profileId: 'household' },
  { title: 'High-Speed Fiber Optic Gig Internet', amount: 85.00, originalCurrency: 'USD', amountInUSD: 85.00, type: 'expense', bucket: 'needs', category: 'Bills & Utilities', merchant: 'Verizon Fios', date: daysAgo(3), isRecurring: true, tags: ['internet', 'wifi'], profileId: 'household' },
  { title: 'Electricity & Central Climate Control', amount: 115.40, originalCurrency: 'USD', amountInUSD: 115.40, type: 'expense', bucket: 'needs', category: 'Bills & Utilities', merchant: 'Electric Utility Co.', date: daysAgo(5), isRecurring: true, tags: ['electricity', 'utilities'], profileId: 'household' },
  { title: 'Whole Foods Organic Weekly Groceries', amount: 148.60, originalCurrency: 'USD', amountInUSD: 148.60, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'Whole Foods Market', date: daysAgo(2), isRecurring: false, tags: ['groceries', 'organic'], profileId: 'household' },
  { title: 'Trader Joe\'s Pantry Stockup', amount: 92.40, originalCurrency: 'USD', amountInUSD: 92.40, type: 'expense', bucket: 'needs', category: 'Food & Dining', merchant: 'Trader Joe\'s', date: daysAgo(9), isRecurring: false, tags: ['groceries'], profileId: 'household' },
  { title: 'Freelancer Private Health Insurance', amount: 320.00, originalCurrency: 'USD', amountInUSD: 320.00, type: 'expense', bucket: 'needs', category: 'Health', merchant: 'BlueCross Health', date: daysAgo(1), isRecurring: true, tags: ['health-insurance'], profileId: 'household' },
  { title: 'Gym & Crossfit Monthly Membership', amount: 75.00, originalCurrency: 'USD', amountInUSD: 75.00, type: 'expense', bucket: 'needs', category: 'Health', merchant: 'Equinox Gym', date: daysAgo(11), isRecurring: true, tags: ['fitness', 'gym'], profileId: 'personal' },
  { title: 'Uber Rides for Client Meetings', amount: 38.50, originalCurrency: 'USD', amountInUSD: 38.50, type: 'expense', bucket: 'needs', category: 'Transport', merchant: 'Uber Technologies', date: daysAgo(6), isRecurring: false, tags: ['uber', 'transit'], profileId: 'business' },
  { title: 'Subway & Light Rail Reload', amount: 40.00, originalCurrency: 'USD', amountInUSD: 40.00, type: 'expense', bucket: 'needs', category: 'Transport', merchant: 'City Metro Transit', date: daysAgo(15), isRecurring: false, tags: ['metro'], profileId: 'personal' },

  // Wants / Lifestyle & Workspace
  { title: 'WeWork Hot Desk Dedicated Membership', amount: 250.00, originalCurrency: 'USD', amountInUSD: 250.00, type: 'expense', bucket: 'wants', category: 'Tech & SaaS', merchant: 'WeWork Co-Working', date: daysAgo(3), isRecurring: true, tags: ['coworking', 'office'], profileId: 'business' },
  { title: 'Artisan Espresso & Pour-Over Work Session', amount: 8.50, originalCurrency: 'USD', amountInUSD: 8.50, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Blue Bottle Coffee', date: daysAgo(2), isRecurring: false, tags: ['coffee', 'cafe'], profileId: 'personal' },
  { title: 'Matcha Latte & Croissant at Cafe', amount: 9.20, originalCurrency: 'USD', amountInUSD: 9.20, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Local Roasters', date: daysAgo(5), isRecurring: false, tags: ['coffee', 'cafe'], profileId: 'personal' },
  { title: 'Client Dinner Celebration - Sushi Bar', amount: 135.00, originalCurrency: 'USD', amountInUSD: 135.00, type: 'expense', bucket: 'wants', category: 'Food & Dining', merchant: 'Nobu Japanese Bistro', date: daysAgo(7), isRecurring: false, tags: ['client-dinner', 'sushi'], profileId: 'business' },
  { title: 'Weekend Craft Brewery Hangout', amount: 48.00, originalCurrency: 'USD', amountInUSD: 48.00, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Brooklyn Brewery', date: daysAgo(6), isRecurring: false, tags: ['social', 'weekend'], profileId: 'personal' },
  { title: 'Custom Mechanical Keyboard Keycaps', amount: 85.00, originalCurrency: 'USD', amountInUSD: 85.00, type: 'expense', bucket: 'wants', category: 'Shopping', merchant: 'Drop.com Mechanical', date: daysAgo(10), isRecurring: false, tags: ['desk-setup', 'gear'], profileId: 'personal' },
  { title: 'Heavy Duty Dual Monitor Gas Arm', amount: 65.00, originalCurrency: 'USD', amountInUSD: 65.00, type: 'expense', bucket: 'wants', category: 'Shopping', merchant: 'Amazon Prime', date: daysAgo(13), isRecurring: false, tags: ['ergonomics'], profileId: 'business' },
  { title: 'Audible Audiobooks Subscription', amount: 14.95, originalCurrency: 'USD', amountInUSD: 14.95, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Amazon Audible', date: daysAgo(16), isRecurring: true, tags: ['audiobooks'], profileId: 'personal' },
  { title: 'Netflix 4K Premium Plan', amount: 22.99, originalCurrency: 'USD', amountInUSD: 22.99, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Netflix', date: daysAgo(19), isRecurring: true, tags: ['streaming'], profileId: 'household' },
  { title: 'YouTube Premium Family Plan', amount: 22.99, originalCurrency: 'USD', amountInUSD: 22.99, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Google YouTube', date: daysAgo(21), isRecurring: true, tags: ['streaming'], profileId: 'household' },
  { title: 'Concert Tickets - Indie Synthwave Tour', amount: 62.00, originalCurrency: 'USD', amountInUSD: 62.00, type: 'expense', bucket: 'wants', category: 'Entertainment', merchant: 'Ticketmaster Live', date: daysAgo(22), isRecurring: false, tags: ['concert', 'music'], profileId: 'personal' },
  { title: 'New Running Shoes - Brooks Ghost', amount: 130.00, originalCurrency: 'USD', amountInUSD: 130.00, type: 'expense', bucket: 'wants', category: 'Shopping', merchant: 'Runner Warehouse', date: daysAgo(25), isRecurring: false, tags: ['running', 'shoes'], profileId: 'personal' },

  // Wealth Accumulation & Future Runway (Savings)
  { title: 'Quarterly Federal & State Tax Reserve (25%)', amount: 2125.00, originalCurrency: 'USD', amountInUSD: 2125.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Tax Escrow Savings', date: daysAgo(2), isRecurring: true, tags: ['taxes', 'reserve'], profileId: 'business' },
  { title: 'Vanguard VOO S&P 500 Index Fund Auto-Buy', amount: 1000.00, originalCurrency: 'USD', amountInUSD: 1000.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Vanguard Brokerage', date: daysAgo(1), isRecurring: true, tags: ['index-fund', 'investing'], profileId: 'household' },
  { title: '6-Month Emergency Runway Deposit', amount: 800.00, originalCurrency: 'USD', amountInUSD: 800.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Marcus High Yield Savings', date: daysAgo(3), isRecurring: true, tags: ['emergency-runway', 'goal'], profileId: 'household' },
  { title: '6-Month Emergency Runway Deposit', amount: 800.00, originalCurrency: 'USD', amountInUSD: 800.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Marcus High Yield Savings', date: daysAgo(17), isRecurring: true, tags: ['emergency-runway', 'goal'], profileId: 'household' },
  { title: 'Tech Gear Upgrade Fund Transfer (M3 Max)', amount: 400.00, originalCurrency: 'USD', amountInUSD: 400.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Gear Savings Vault', date: daysAgo(5), isRecurring: false, tags: ['gear-upgrade', 'goal'], profileId: 'business' },
  { title: 'Tech Gear Upgrade Fund Transfer (M3 Max)', amount: 350.00, originalCurrency: 'USD', amountInUSD: 350.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Gear Savings Vault', date: daysAgo(19), isRecurring: false, tags: ['gear-upgrade', 'goal'], profileId: 'business' },
  { title: 'Ethereum Staking Rewards & Treasury DCA', amount: 300.00, originalCurrency: 'USD', amountInUSD: 300.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Cold Storage Ledger', date: daysAgo(12), isRecurring: false, tags: ['crypto', 'dca'], profileId: 'personal' },
  { title: 'Solo 401(k) Retirement Account Contribution', amount: 750.00, originalCurrency: 'USD', amountInUSD: 750.00, type: 'expense', bucket: 'savings', category: 'Investment', merchant: 'Fidelity Investments', date: daysAgo(15), isRecurring: true, tags: ['retirement', '401k'], profileId: 'household' },
];

const FREELANCER_GOALS: Omit<FinancialGoal, 'id'>[] = [
  { title: '6-Month Emergency Runway 🛡️', targetAmount: 9000, currentAmount: 5400, deadline: '2027-08-01', category: 'Savings', icon: '🛡️', profileId: 'household' },
  { title: 'Tech Gear Upgrade (M3 Max & 5K Display) 💻', targetAmount: 2200, currentAmount: 1100, deadline: '2027-05-01', category: 'Tech & SaaS', icon: '💻', profileId: 'business' },
];

const FREELANCER_SUBSCRIPTIONS: Omit<Subscription, 'id'>[] = [
  { name: 'Adobe Creative Cloud', amount: 54.99, currency: 'USD', billingCycle: 'monthly', category: 'Tech & SaaS', nextBillingDate: daysAgo(-26), isActive: true, merchant: 'Adobe', profileId: 'business' },
  { name: 'Vercel Pro Team', amount: 20.00, currency: 'USD', billingCycle: 'monthly', category: 'Tech & SaaS', nextBillingDate: daysAgo(-26), isActive: true, merchant: 'Vercel', profileId: 'business' },
  { name: 'Figma Organization Seat', amount: 15.00, currency: 'USD', billingCycle: 'monthly', category: 'Tech & SaaS', nextBillingDate: daysAgo(-26), isActive: true, merchant: 'Figma', profileId: 'business' },
  { name: 'ChatGPT Plus Team', amount: 20.00, currency: 'USD', billingCycle: 'monthly', category: 'Tech & SaaS', nextBillingDate: daysAgo(-25), isActive: true, merchant: 'OpenAI', profileId: 'business' },
  { name: 'Netflix Premium 4K', amount: 22.99, currency: 'USD', billingCycle: 'monthly', category: 'Entertainment', nextBillingDate: daysAgo(-26), isActive: true, merchant: 'Netflix', profileId: 'household' },
  { name: 'WeWork Hot Desk Pass', amount: 250.00, currency: 'USD', billingCycle: 'monthly', category: 'Tech & SaaS', nextBillingDate: daysAgo(-27), isActive: true, merchant: 'WeWork', profileId: 'business' },
];

export const DEFAULT_IOUS: Omit<IOUTransaction, 'id'>[] = [
  {
    title: 'Dinner at Monal Margalla Hills',
    totalBill: 9600,
    myShare: 4800,
    friendName: 'Hamza Tariq',
    friendPhone: '+923001234567',
    friendShare: 4800,
    currency: 'PKR',
    status: 'pending',
    createdAt: daysAgo(2),
    direction: 'they_owe_me',
    category: 'Dining',
    notes: 'Split Shinwari Karahi & BBQ platter 50/50',
    profileId: 'household',
  },
  {
    title: 'Grocery Wholesale Mandi Run',
    totalBill: 14200,
    myShare: 7100,
    friendName: 'Usman Ghani',
    friendPhone: '+923219876543',
    friendShare: 7100,
    currency: 'PKR',
    status: 'pending',
    createdAt: daysAgo(5),
    direction: 'they_owe_me',
    category: 'Groceries',
    notes: 'Bulk whole wheat flour & cooking oil crate split',
    profileId: 'household',
  },
  {
    title: 'Careem Airport Ride (Shared)',
    totalBill: 3400,
    myShare: 1700,
    friendName: 'Sarah Khan',
    friendPhone: '+923335558899',
    friendShare: 1700,
    currency: 'PKR',
    status: 'settled',
    createdAt: daysAgo(10),
    settledAt: daysAgo(8),
    direction: 'they_owe_me',
    category: 'Uber/Taxi',
    notes: 'Settled via Raast transfer',
    profileId: 'personal',
  },
  {
    title: 'Badminton Court Booking & Shuttles',
    totalBill: 2800,
    myShare: 1400,
    friendName: 'Bilal Ahmed',
    friendPhone: '+923451122334',
    friendShare: 1400,
    currency: 'PKR',
    status: 'pending',
    createdAt: daysAgo(3),
    direction: 'i_owe_them',
    category: 'Entertainment',
    notes: 'Bilal paid upfront for 2 hours court reservation',
    profileId: 'personal',
  },
  {
    title: 'Client Lunch Pitch - Thai Street Food',
    totalBill: 6400,
    myShare: 3200,
    friendName: 'Zubair Malik',
    friendPhone: '+923124455667',
    friendShare: 3200,
    currency: 'PKR',
    status: 'pending',
    createdAt: daysAgo(1),
    direction: 'they_owe_me',
    category: 'Dining',
    notes: 'Discussed Q4 mobile app design contract',
    profileId: 'business',
  },
];

export async function seedPersona(persona: 'student' | 'freelancer' | 'household' | 'clean') {
  // Clear all existing data
  await db.transactions.clear();
  await db.goals.clear();
  await db.subscriptions.clear();
  await db.auditLogs.clear();
  await db.profiles.clear();
  await db.ious.clear();

  // Always seed default multi-user profiles so family mode works right away
  await db.profiles.bulkAdd(DEFAULT_PROFILES);

  if (persona === 'clean') {
    const existingSettings = await db.settings.toArray();
    if (existingSettings.length > 0) {
      await db.settings.update(existingSettings[0].id!, { activePersona: 'clean', baseCurrency: 'PKR' });
    } else {
      await db.settings.add({
        baseCurrency: 'PKR',
        aiPersona: 'mentor',
        monthlyIncomeTarget: 0,
        isEncrypted: false,
        activePersona: 'clean',
        detectedCity: 'Karachi',
        familySize: 4,
      });
    }
    return;
  }

  let transactions = HOUSEHOLD_TRANSACTIONS;
  let goals = HOUSEHOLD_GOALS;
  let subs = HOUSEHOLD_SUBSCRIPTIONS;
  let baseCurrency = 'PKR';
  let monthlyTarget = 230000;

  if (persona === 'student') {
    transactions = STUDENT_TRANSACTIONS;
    goals = STUDENT_GOALS;
    subs = STUDENT_SUBSCRIPTIONS;
    baseCurrency = 'USD';
    monthlyTarget = 200;
  } else if (persona === 'freelancer') {
    transactions = FREELANCER_TRANSACTIONS;
    goals = FREELANCER_GOALS;
    subs = FREELANCER_SUBSCRIPTIONS;
    baseCurrency = 'USD';
    monthlyTarget = 12000;
  }

  await db.transactions.bulkAdd(transactions);
  await db.goals.bulkAdd(goals);
  await db.subscriptions.bulkAdd(subs);
  await db.ious.bulkAdd(DEFAULT_IOUS);

  // Log it
  await db.auditLogs.add({
    timestamp: new Date().toISOString(),
    action: 'PERSONA_LOADED',
    details: `Loaded ${persona} persona with ${transactions.length} transactions, ${goals.length} goals, ${subs.length} subscriptions. Multi-user profiles enabled.`,
    aiGenerated: false,
  });

  // Update settings
  const existingSettings = await db.settings.toArray();
  if (existingSettings.length > 0) {
    await db.settings.update(existingSettings[0].id!, {
      activePersona: persona,
      monthlyIncomeTarget: monthlyTarget,
      baseCurrency,
      detectedCity: 'Karachi',
      familySize: 4,
    });
  } else {
    await db.settings.add({
      baseCurrency,
      aiPersona: 'mentor',
      monthlyIncomeTarget: monthlyTarget,
      isEncrypted: false,
      activePersona: persona,
      detectedCity: 'Karachi',
      familySize: 4,
    });
  }
}
