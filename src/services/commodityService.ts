// AuraFinance OS — Hyper-Local Commodity & Daily Bazaar Price Service
// Tracks daily prices down to per-unit items (1 egg, 1kg meat, milk, atta, oil, petrol, etc.)
// Auto-detects location via IP Geolocation with manual city selector

export interface CommodityItem {
  id: string;
  name: string;
  urduName: string;
  category: 'poultry_meat' | 'dairy_bakery' | 'staples' | 'produce' | 'oil_ghee' | 'energy_fuel';
  unit: string;
  unitPriceDesc: string; // e.g., "Rs 30 / egg"
  basePricePKR: number; // reference price in PKR
  singleUnitPricePKR: number; // e.g. for egg: 30, for chicken 1/2kg: 310
  cityPrices: Record<string, number>;
  nationalAvgPKR: number;
  dailyChange: number; // Rs change today (+2, -15, etc)
  dailyChangePercent: number; // +1.2%, -2.5%
  trend: 'up' | 'down' | 'stable';
  forecastNote: string;
  icon: string;
  isDailyEssential: boolean;
  monthlyPerPersonQty: number; // standard monthly requirement per person
  monthlyQtyUnit: string;
  bachatTip: string;
  bachatPotentialRs: number; // estimated monthly saving
  quickLogOptions: { label: string; qtyRatio: number; amountPKR: number; title: string }[];
}

export interface CityInfo {
  id: string;
  name: string;
  urduName: string;
  province: string;
  inflationModifier: number; // multiplier vs national base (e.g. 1.04 for Karachi, 0.98 for Lahore)
  currency: string;
}

export const CITIES_LIST: CityInfo[] = [
  { id: 'Karachi', name: 'Karachi', urduName: 'کراچی', province: 'Sindh', inflationModifier: 1.03, currency: 'PKR' },
  { id: 'Lahore', name: 'Lahore', urduName: 'لاہور', province: 'Punjab', inflationModifier: 0.98, currency: 'PKR' },
  { id: 'Islamabad', name: 'Islamabad', urduName: 'اسلام آباد', province: 'ICT', inflationModifier: 1.06, currency: 'PKR' },
  { id: 'Rawalpindi', name: 'Rawalpindi', urduName: 'راولپنڈی', province: 'Punjab', inflationModifier: 1.02, currency: 'PKR' },
  { id: 'Faisalabad', name: 'Faisalabad', urduName: 'فیصل آباد', province: 'Punjab', inflationModifier: 0.96, currency: 'PKR' },
  { id: 'Multan', name: 'Multan', urduName: 'ملتان', province: 'Punjab', inflationModifier: 0.95, currency: 'PKR' },
  { id: 'Peshawar', name: 'Peshawar', urduName: 'پشاور', province: 'KPK', inflationModifier: 0.99, currency: 'PKR' },
  { id: 'Quetta', name: 'Quetta', urduName: 'کوئٹہ', province: 'Balochistan', inflationModifier: 1.05, currency: 'PKR' },
  { id: 'Hyderabad', name: 'Hyderabad', urduName: 'حیدرآباد', province: 'Sindh', inflationModifier: 0.97, currency: 'PKR' },
  { id: 'Sialkot', name: 'Sialkot', urduName: 'سیالکوٹ', province: 'Punjab', inflationModifier: 0.98, currency: 'PKR' },
  { id: 'Dubai', name: 'Dubai', urduName: 'دبئی', province: 'UAE', inflationModifier: 3.2, currency: 'AED' },
  { id: 'London', name: 'London', urduName: 'لندن', province: 'UK', inflationModifier: 4.5, currency: 'GBP' },
  { id: 'New York', name: 'New York', urduName: 'نیویارک', province: 'USA', inflationModifier: 5.0, currency: 'USD' },
];

export const COMMODITIES_DATABASE: CommodityItem[] = [
  {
    id: 'eggs',
    name: 'Farm Fresh Eggs',
    urduName: 'فارمی انڈے (Anday)',
    category: 'dairy_bakery',
    unit: '1 Dozen',
    unitPriceDesc: '₨ 30 per egg (₨ 360 / dozen)',
    basePricePKR: 360,
    singleUnitPricePKR: 30,
    cityPrices: {
      Karachi: 365,
      Lahore: 350,
      Islamabad: 375,
      Rawalpindi: 368,
      Faisalabad: 345,
      Multan: 340,
      Peshawar: 360,
      Quetta: 380,
      Hyderabad: 360,
      Sialkot: 352,
    },
    nationalAvgPKR: 358,
    dailyChange: 2,
    dailyChangePercent: 0.56,
    trend: 'up',
    forecastNote: 'Mild rise expected this weekend due to winter breakfast demand.',
    icon: '🥚',
    isDailyEssential: true,
    monthlyPerPersonQty: 15, // 15 eggs per person/month
    monthlyQtyUnit: 'eggs',
    bachatTip: 'Buy 1 Crate (30 eggs) from wholesale egg market instead of daily 2-egg grocery trips. Saves ₨ 250/month!',
    bachatPotentialRs: 250,
    quickLogOptions: [
      { label: '1 Egg (Breakfast)', qtyRatio: 1 / 12, amountPKR: 30, title: '1 Single Egg' },
      { label: '6 Eggs (Half Doz)', qtyRatio: 0.5, amountPKR: 180, title: 'Half Dozen Eggs' },
      { label: '1 Dozen (12 Eggs)', qtyRatio: 1, amountPKR: 360, title: '1 Dozen Farm Eggs' },
      { label: '1 Crate (30 Eggs Wholesale)', qtyRatio: 2.5, amountPKR: 850, title: '1 Crate Eggs (Wholesale)' },
    ],
  },
  {
    id: 'chicken_meat',
    name: 'Fresh Chicken Meat',
    urduName: 'تازہ مرغی کا گوشت (Chicken Meat)',
    category: 'poultry_meat',
    unit: '1 kg Meat',
    unitPriceDesc: '₨ 620 / kg (₨ 310 / 500g)',
    basePricePKR: 620,
    singleUnitPricePKR: 620,
    cityPrices: {
      Karachi: 630,
      Lahore: 605,
      Islamabad: 645,
      Rawalpindi: 635,
      Faisalabad: 595,
      Multan: 590,
      Peshawar: 615,
      Quetta: 650,
      Hyderabad: 625,
      Sialkot: 610,
    },
    nationalAvgPKR: 618,
    dailyChange: -15,
    dailyChangePercent: -2.36,
    trend: 'down',
    forecastNote: 'Supply surge from poultry farms lowering live broiler rates today.',
    icon: '🍗',
    isDailyEssential: true,
    monthlyPerPersonQty: 2, // 2kg chicken meat per person
    monthlyQtyUnit: 'kg',
    bachatTip: 'Purchase whole dressed broiler (live rate ₨ 410/kg) instead of pre-cut boneless breast. Saves ₨ 950/month!',
    bachatPotentialRs: 950,
    quickLogOptions: [
      { label: '500g Chicken Meat', qtyRatio: 0.5, amountPKR: 310, title: 'Chicken Meat 500g' },
      { label: '1 kg Chicken Meat', qtyRatio: 1, amountPKR: 620, title: 'Chicken Meat 1kg' },
      { label: '2 kg Family Chicken', qtyRatio: 2, amountPKR: 1240, title: 'Chicken Meat 2kg' },
    ],
  },
  {
    id: 'beef_meat',
    name: 'Fresh Beef (Bara Gosht)',
    urduName: 'گائے کا گوشت (Beef with Bone)',
    category: 'poultry_meat',
    unit: '1 kg Meat',
    unitPriceDesc: '₨ 950 / kg with bone',
    basePricePKR: 950,
    singleUnitPricePKR: 950,
    cityPrices: {
      Karachi: 920,
      Lahore: 960,
      Islamabad: 1050,
      Rawalpindi: 1020,
      Faisalabad: 940,
      Multan: 930,
      Peshawar: 980,
      Quetta: 1000,
      Hyderabad: 920,
      Sialkot: 950,
    },
    nationalAvgPKR: 965,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Official municipal market committee fixed rate stable.',
    icon: '🥩',
    isDailyEssential: false,
    monthlyPerPersonQty: 1, // 1kg beef per person
    monthlyQtyUnit: 'kg',
    bachatTip: 'Buy 5kg bulk portion from wholesale butcher on Tuesday/Saturday morning. Saves ₨ 600/month!',
    bachatPotentialRs: 600,
    quickLogOptions: [
      { label: '1 kg Beef (Bone-in)', qtyRatio: 1, amountPKR: 950, title: 'Fresh Beef 1kg' },
      { label: '1 kg Beef (Boneless/Pasandey)', qtyRatio: 1, amountPKR: 1180, title: 'Beef Boneless 1kg' },
      { label: '2 kg Family Beef', qtyRatio: 2, amountPKR: 1900, title: 'Fresh Beef 2kg' },
    ],
  },
  {
    id: 'mutton_meat',
    name: 'Fresh Mutton (Chota Gosht)',
    urduName: 'بکرے کا گوشت (Mutton/Goat)',
    category: 'poultry_meat',
    unit: '1 kg Meat',
    unitPriceDesc: '₨ 2,150 / kg',
    basePricePKR: 2150,
    singleUnitPricePKR: 2150,
    cityPrices: {
      Karachi: 2100,
      Lahore: 2200,
      Islamabad: 2350,
      Rawalpindi: 2300,
      Faisalabad: 2100,
      Multan: 2050,
      Peshawar: 2250,
      Quetta: 2000,
      Hyderabad: 2050,
      Sialkot: 2150,
    },
    nationalAvgPKR: 2165,
    dailyChange: 10,
    dailyChangePercent: 0.46,
    trend: 'stable',
    forecastNote: 'Premium quality livestock prices firm across retail outlets.',
    icon: '🍖',
    isDailyEssential: false,
    monthlyPerPersonQty: 0.5,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Mix mutton chops with lentil (Daal Gosht) or vegetable stew once a week. Cuts monthly meat bill by ₨ 2,500!',
    bachatPotentialRs: 2500,
    quickLogOptions: [
      { label: '500g Mutton', qtyRatio: 0.5, amountPKR: 1075, title: 'Fresh Mutton 500g' },
      { label: '1 kg Fresh Mutton', qtyRatio: 1, amountPKR: 2150, title: 'Fresh Mutton 1kg' },
    ],
  },
  {
    id: 'milk_fresh',
    name: 'Fresh Buffalo Milk (Khula Doodh)',
    urduName: 'تازہ دودھ (Khula Doodh)',
    category: 'dairy_bakery',
    unit: '1 Litre',
    unitPriceDesc: '₨ 210 / Litre (₨ 105 / 500ml)',
    basePricePKR: 210,
    singleUnitPricePKR: 210,
    cityPrices: {
      Karachi: 220,
      Lahore: 200,
      Islamabad: 230,
      Rawalpindi: 225,
      Faisalabad: 190,
      Multan: 185,
      Peshawar: 215,
      Quetta: 240,
      Hyderabad: 210,
      Sialkot: 195,
    },
    nationalAvgPKR: 211,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Dairy farm supply steady at fixed government retail rates.',
    icon: '🥛',
    isDailyEssential: true,
    monthlyPerPersonQty: 8, // 8 litres milk per person
    monthlyQtyUnit: 'Litres',
    bachatTip: 'Get fresh direct dairy delivery (₨ 210/L) instead of tetrapack cartons (₨ 290/L). Saves ₨ 2,400/month for a family of 4!',
    bachatPotentialRs: 2400,
    quickLogOptions: [
      { label: '500 ml Fresh Milk', qtyRatio: 0.5, amountPKR: 105, title: 'Fresh Milk 500ml' },
      { label: '1 Litre Fresh Milk', qtyRatio: 1, amountPKR: 210, title: 'Fresh Milk 1L' },
      { label: '2 Litres Daily Milk', qtyRatio: 2, amountPKR: 420, title: 'Fresh Milk 2L' },
    ],
  },
  {
    id: 'atta_flour',
    name: 'Whole Wheat Flour (Chakki Atta)',
    urduName: 'چکی آٹا (Whole Wheat Atta)',
    category: 'staples',
    unit: '10 kg Bag',
    unitPriceDesc: '₨ 135 / kg (₨ 1,320 / 10kg Bag)',
    basePricePKR: 1320,
    singleUnitPricePKR: 135,
    cityPrices: {
      Karachi: 1350,
      Lahore: 1280,
      Islamabad: 1380,
      Rawalpindi: 1360,
      Faisalabad: 1250,
      Multan: 1240,
      Peshawar: 1340,
      Quetta: 1420,
      Hyderabad: 1340,
      Sialkot: 1270,
    },
    nationalAvgPKR: 1323,
    dailyChange: -5,
    dailyChangePercent: -0.38,
    trend: 'down',
    forecastNote: 'New wheat releases from government reserves holding prices steady.',
    icon: '🌾',
    isDailyEssential: true,
    monthlyPerPersonQty: 5, // 5kg per person
    monthlyQtyUnit: 'kg',
    bachatTip: 'Buy 20kg bag from Utility Stores or wholesale grain dealer instead of 5kg mart pouches. Saves ₨ 350 per bag!',
    bachatPotentialRs: 350,
    quickLogOptions: [
      { label: '1 kg Loose Atta', qtyRatio: 0.1, amountPKR: 135, title: 'Chakki Atta 1kg' },
      { label: '10 kg Atta Bag', qtyRatio: 1, amountPKR: 1320, title: 'Chakki Atta 10kg Bag' },
      { label: '20 kg Family Atta Bag', qtyRatio: 2, amountPKR: 2580, title: 'Chakki Atta 20kg Bag' },
    ],
  },
  {
    id: 'cooking_oil',
    name: 'Cooking Oil / Banaspati Ghee',
    urduName: 'کوکنگ آئل / گھی (Cooking Oil)',
    category: 'oil_ghee',
    unit: '1 Litre Pouch',
    unitPriceDesc: '₨ 490 / Litre Pouch',
    basePricePKR: 490,
    singleUnitPricePKR: 490,
    cityPrices: {
      Karachi: 480,
      Lahore: 490,
      Islamabad: 510,
      Rawalpindi: 505,
      Faisalabad: 485,
      Multan: 480,
      Peshawar: 500,
      Quetta: 520,
      Hyderabad: 485,
      Sialkot: 490,
    },
    nationalAvgPKR: 494,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'International palm oil import prices unchanged.',
    icon: '🫒',
    isDailyEssential: true,
    monthlyPerPersonQty: 1.2, // 1.2L per person
    monthlyQtyUnit: 'Litres',
    bachatTip: 'Buying a 5 Litre Tin (₨ 2,340) saves ₨ 110 over five individual pouches. Saves ₨ 450/month on household cooking!',
    bachatPotentialRs: 450,
    quickLogOptions: [
      { label: '1 Litre Oil Pouch', qtyRatio: 1, amountPKR: 490, title: 'Cooking Oil 1L Pouch' },
      { label: '5 Litre Oil Tin (Wholesale)', qtyRatio: 5, amountPKR: 2340, title: 'Cooking Oil 5L Tin' },
    ],
  },
  {
    id: 'rice_basmati',
    name: 'Super Kernel Basmati Rice',
    urduName: 'کرنل باسمتی چاول (Basmati Rice)',
    category: 'staples',
    unit: '1 kg',
    unitPriceDesc: '₨ 340 / kg',
    basePricePKR: 340,
    singleUnitPricePKR: 340,
    cityPrices: {
      Karachi: 350,
      Lahore: 320,
      Islamabad: 360,
      Rawalpindi: 350,
      Faisalabad: 310,
      Multan: 315,
      Peshawar: 345,
      Quetta: 370,
      Hyderabad: 340,
      Sialkot: 310,
    },
    nationalAvgPKR: 337,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Punjab paddy harvest processing stable.',
    icon: '🍚',
    isDailyEssential: true,
    monthlyPerPersonQty: 1.5,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Buy 5kg or 10kg sack directly from wholesale mandi. Cuts cost from ₨ 340/kg down to ₨ 305/kg! Saves ₨ 350/mo.',
    bachatPotentialRs: 350,
    quickLogOptions: [
      { label: '1 kg Basmati Rice', qtyRatio: 1, amountPKR: 340, title: 'Basmati Rice 1kg' },
      { label: '5 kg Rice Bag', qtyRatio: 5, amountPKR: 1620, title: 'Basmati Rice 5kg Bag' },
    ],
  },
  {
    id: 'potatoes_aloo',
    name: 'Fresh Potatoes (Aloo)',
    urduName: 'تازہ آلو (Aloo)',
    category: 'produce',
    unit: '1 kg',
    unitPriceDesc: '₨ 85 / kg (₨ 380 / 5kg Dhari)',
    basePricePKR: 85,
    singleUnitPricePKR: 85,
    cityPrices: {
      Karachi: 90,
      Lahore: 75,
      Islamabad: 95,
      Rawalpindi: 90,
      Faisalabad: 70,
      Multan: 70,
      Peshawar: 85,
      Quetta: 100,
      Hyderabad: 85,
      Sialkot: 75,
    },
    nationalAvgPKR: 82,
    dailyChange: -5,
    dailyChangePercent: -5.5,
    trend: 'down',
    forecastNote: 'Cold storage stocks released into sabzi mandis, prices softening.',
    icon: '🥔',
    isDailyEssential: true,
    monthlyPerPersonQty: 2.5,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Purchase a 5kg Dhari (₨ 380) on weekend sabzi mandi instead of daily vendor cart. Saves ₨ 180/month!',
    bachatPotentialRs: 180,
    quickLogOptions: [
      { label: '1 kg Fresh Aloo', qtyRatio: 1, amountPKR: 85, title: 'Potatoes (Aloo) 1kg' },
      { label: '5 kg Dhari (Mandi Rate)', qtyRatio: 5, amountPKR: 380, title: 'Potatoes 5kg Dhari' },
    ],
  },
  {
    id: 'onions_piyaz',
    name: 'Fresh Onions (Piyaz)',
    urduName: 'پیاز (Piyaz)',
    category: 'produce',
    unit: '1 kg',
    unitPriceDesc: '₨ 140 / kg',
    basePricePKR: 140,
    singleUnitPricePKR: 140,
    cityPrices: {
      Karachi: 135,
      Lahore: 140,
      Islamabad: 155,
      Rawalpindi: 150,
      Faisalabad: 130,
      Multan: 130,
      Peshawar: 145,
      Quetta: 160,
      Hyderabad: 130,
      Sialkot: 135,
    },
    nationalAvgPKR: 142,
    dailyChange: 5,
    dailyChangePercent: 3.7,
    trend: 'up',
    forecastNote: 'Inter-provincial truck arrivals delayed; expected to normalize by Tuesday.',
    icon: '🧅',
    isDailyEssential: true,
    monthlyPerPersonQty: 2,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Buy medium-sized dry onions in 5kg bags from wholesale bazaar. Saves ₨ 220/month!',
    bachatPotentialRs: 220,
    quickLogOptions: [
      { label: '1 kg Fresh Piyaz', qtyRatio: 1, amountPKR: 140, title: 'Onions (Piyaz) 1kg' },
      { label: '3 kg Onions', qtyRatio: 3, amountPKR: 400, title: 'Onions 3kg' },
    ],
  },
  {
    id: 'tomatoes_tamatar',
    name: 'Fresh Red Tomatoes (Tamatar)',
    urduName: 'لال ٹماٹر (Tamatar)',
    category: 'produce',
    unit: '1 kg',
    unitPriceDesc: '₨ 125 / kg',
    basePricePKR: 125,
    singleUnitPricePKR: 125,
    cityPrices: {
      Karachi: 120,
      Lahore: 130,
      Islamabad: 145,
      Rawalpindi: 140,
      Faisalabad: 115,
      Multan: 110,
      Peshawar: 135,
      Quetta: 150,
      Hyderabad: 115,
      Sialkot: 125,
    },
    nationalAvgPKR: 128,
    dailyChange: -10,
    dailyChangePercent: -7.4,
    trend: 'down',
    forecastNote: 'Fresh Sindh tomato crop harvest hitting all major mandis.',
    icon: '🍅',
    isDailyEssential: true,
    monthlyPerPersonQty: 1.5,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Buy 3kg when tomato rates are down like today, blend and freeze as tomato paste cubes! Saves ₨ 450/month!',
    bachatPotentialRs: 450,
    quickLogOptions: [
      { label: '1 kg Red Tamatar', qtyRatio: 1, amountPKR: 125, title: 'Tomatoes 1kg' },
      { label: '2 kg Tomatoes', qtyRatio: 2, amountPKR: 240, title: 'Tomatoes 2kg' },
    ],
  },
  {
    id: 'daal_chana',
    name: 'Daal Chana (Split Chickpea)',
    urduName: 'دال چنا (Daal Chana)',
    category: 'staples',
    unit: '1 kg',
    unitPriceDesc: '₨ 280 / kg',
    basePricePKR: 280,
    singleUnitPricePKR: 280,
    cityPrices: {
      Karachi: 275,
      Lahore: 280,
      Islamabad: 295,
      Rawalpindi: 290,
      Faisalabad: 270,
      Multan: 265,
      Peshawar: 285,
      Quetta: 300,
      Hyderabad: 275,
      Sialkot: 280,
    },
    nationalAvgPKR: 281,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Pulses market supply balanced.',
    icon: '🫘',
    isDailyEssential: false,
    monthlyPerPersonQty: 0.8,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Replacing one meat meal per week with nutritious Daal Chana saves a family over ₨ 3,200/month!',
    bachatPotentialRs: 3200,
    quickLogOptions: [
      { label: '1 kg Daal Chana', qtyRatio: 1, amountPKR: 280, title: 'Daal Chana 1kg' },
      { label: '2 kg Daal Chana', qtyRatio: 2, amountPKR: 550, title: 'Daal Chana 2kg' },
    ],
  },
  {
    id: 'sugar_cheeni',
    name: 'White Sugar (Cheeni)',
    urduName: 'چینی (Sugar)',
    category: 'staples',
    unit: '1 kg',
    unitPriceDesc: '₨ 145 / kg',
    basePricePKR: 145,
    singleUnitPricePKR: 145,
    cityPrices: {
      Karachi: 145,
      Lahore: 142,
      Islamabad: 150,
      Rawalpindi: 148,
      Faisalabad: 140,
      Multan: 138,
      Peshawar: 148,
      Quetta: 155,
      Hyderabad: 144,
      Sialkot: 142,
    },
    nationalAvgPKR: 145,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Government sugar mill stocks sufficient for the quarter.',
    icon: '🧂',
    isDailyEssential: true,
    monthlyPerPersonQty: 1,
    monthlyQtyUnit: 'kg',
    bachatTip: 'Purchase 5kg pack (₨ 710) at Utility Stores instead of small corner shop purchases. Saves ₨ 150/month.',
    bachatPotentialRs: 150,
    quickLogOptions: [
      { label: '1 kg Sugar', qtyRatio: 1, amountPKR: 145, title: 'Sugar 1kg' },
      { label: '5 kg Sugar Pack', qtyRatio: 5, amountPKR: 710, title: 'Sugar 5kg Pack' },
    ],
  },
  {
    id: 'chai_tea',
    name: 'Black Tea (Tapal / Lipton Chai Patti)',
    urduName: 'چائے کی پتی (Chai Patti)',
    category: 'staples',
    unit: '400g Pack',
    unitPriceDesc: '₨ 680 / 400g Pack',
    basePricePKR: 680,
    singleUnitPricePKR: 680,
    cityPrices: {
      Karachi: 680,
      Lahore: 680,
      Islamabad: 700,
      Rawalpindi: 690,
      Faisalabad: 675,
      Multan: 670,
      Peshawar: 685,
      Quetta: 710,
      Hyderabad: 680,
      Sialkot: 680,
    },
    nationalAvgPKR: 685,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Branded consumer retail price intact.',
    icon: '☕',
    isDailyEssential: true,
    monthlyPerPersonQty: 0.25, // 250g per person
    monthlyQtyUnit: 'pack',
    bachatTip: 'Buy 900g Mega Economy Pouch instead of multiple 200g boxes. Saves ₨ 240/month!',
    bachatPotentialRs: 240,
    quickLogOptions: [
      { label: '400g Chai Patti', qtyRatio: 1, amountPKR: 680, title: 'Chai Patti 400g' },
      { label: '900g Mega Pack', qtyRatio: 2.25, amountPKR: 1480, title: 'Chai Patti 900g Pack' },
    ],
  },
  {
    id: 'bread_large',
    name: 'Plain Bread (Double Roti)',
    urduName: 'ڈبل روٹی (Plain Bread)',
    category: 'dairy_bakery',
    unit: '1 Large Loaf',
    unitPriceDesc: '₨ 140 / Large Loaf',
    basePricePKR: 140,
    singleUnitPricePKR: 140,
    cityPrices: {
      Karachi: 140,
      Lahore: 135,
      Islamabad: 150,
      Rawalpindi: 145,
      Faisalabad: 130,
      Multan: 130,
      Peshawar: 140,
      Quetta: 150,
      Hyderabad: 135,
      Sialkot: 135,
    },
    nationalAvgPKR: 139,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'Bakery Association standard price.',
    icon: '🍞',
    isDailyEssential: true,
    monthlyPerPersonQty: 2,
    monthlyQtyUnit: 'loaves',
    bachatTip: 'Fresh homemade parathas/rotis using chakki atta cost ₨ 18 per serving vs ₨ 45 for bakery bread. Saves ₨ 1,200/month!',
    bachatPotentialRs: 1200,
    quickLogOptions: [
      { label: '1 Small Bread', qtyRatio: 0.6, amountPKR: 85, title: 'Small Bread' },
      { label: '1 Large Bread', qtyRatio: 1, amountPKR: 140, title: 'Large Plain Bread' },
    ],
  },
  {
    id: 'petrol_fuel',
    name: 'Super Petrol (Motor Gasoline)',
    urduName: 'سپر پٹرول (Petrol per Litre)',
    category: 'energy_fuel',
    unit: '1 Litre',
    unitPriceDesc: '₨ 268.4 / Litre',
    basePricePKR: 268.4,
    singleUnitPricePKR: 268.4,
    cityPrices: {
      Karachi: 268.4,
      Lahore: 268.4,
      Islamabad: 268.4,
      Rawalpindi: 268.4,
      Faisalabad: 268.4,
      Multan: 268.4,
      Peshawar: 268.4,
      Quetta: 268.4,
      Hyderabad: 268.4,
      Sialkot: 268.4,
    },
    nationalAvgPKR: 268.4,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'OGRA fortnightly review in effect until the end of the fortnight.',
    icon: '⛽',
    isDailyEssential: true,
    monthlyPerPersonQty: 10,
    monthlyQtyUnit: 'Litres',
    bachatTip: 'Carpooling twice a week or combining errand routes cuts petrol burn by 20%. Saves ₨ 3,500/month!',
    bachatPotentialRs: 3500,
    quickLogOptions: [
      { label: '2 Litres Bike Fuel', qtyRatio: 2, amountPKR: 537, title: 'Petrol 2 Litres' },
      { label: '5 Litres Bike Fuel', qtyRatio: 5, amountPKR: 1342, title: 'Petrol 5 Litres' },
      { label: '10 Litres Car Fuel', qtyRatio: 10, amountPKR: 2684, title: 'Petrol 10 Litres' },
    ],
  },
  {
    id: 'lpg_gas',
    name: 'Domestic LPG Cylinder (11.8 kg)',
    urduName: 'گھریلو گیس سلنڈر (LPG Cylinder)',
    category: 'energy_fuel',
    unit: '11.8 kg Cylinder',
    unitPriceDesc: '₨ 240 / kg (₨ 2,832 / Cylinder)',
    basePricePKR: 2832,
    singleUnitPricePKR: 240,
    cityPrices: {
      Karachi: 2800,
      Lahore: 2832,
      Islamabad: 2950,
      Rawalpindi: 2920,
      Faisalabad: 2820,
      Multan: 2810,
      Peshawar: 2880,
      Quetta: 3050,
      Hyderabad: 2820,
      Sialkot: 2840,
    },
    nationalAvgPKR: 2873,
    dailyChange: 0,
    dailyChangePercent: 0,
    trend: 'stable',
    forecastNote: 'OGRA notified maximum consumer price.',
    icon: '🔥',
    isDailyEssential: false,
    monthlyPerPersonQty: 0.25,
    monthlyQtyUnit: 'cylinder',
    bachatTip: 'Use pressure cookers for lentils and meat to reduce gas cooking time by 45%. Extends cylinder life by 12 days!',
    bachatPotentialRs: 1100,
    quickLogOptions: [
      { label: '2 kg LPG Refill', qtyRatio: 0.17, amountPKR: 480, title: 'LPG Refill 2kg' },
      { label: '11.8 kg Domestic Cylinder', qtyRatio: 1, amountPKR: 2832, title: 'LPG Domestic Cylinder' },
    ],
  },
];

// Helper to get adjusted price based on selected city
export function getItemPriceForCity(item: CommodityItem, cityId: string): number {
  if (item.cityPrices[cityId]) {
    return item.cityPrices[cityId];
  }
  const city = CITIES_LIST.find((c) => c.id === cityId);
  const multiplier = city ? city.inflationModifier : 1.0;
  return Math.round(item.basePricePKR * multiplier);
}

// Client-side IP Geolocation detection with fast fallback
export async function detectClientLocation(): Promise<{ city: string; country: string; ip: string; isAutoDetected: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const detectedCity = data.city || 'Karachi';
      const detectedCountry = data.country_name || 'Pakistan';
      
      // Match with known city or find closest
      const match = CITIES_LIST.find(
        (c) => c.name.toLowerCase() === detectedCity.toLowerCase() || detectedCity.toLowerCase().includes(c.name.toLowerCase())
      );

      return {
        city: match ? match.name : detectedCity,
        country: detectedCountry,
        ip: data.ip || '127.0.0.1',
        isAutoDetected: true,
      };
    }
  } catch {
    // Adblocker or offline, try secondary or fallback
  }

  // Graceful fallback to Karachi
  return {
    city: 'Karachi',
    country: 'Pakistan',
    ip: '119.160.119.50',
    isAutoDetected: false,
  };
}

// Calculate estimated monthly rashan budget based on family size and city
export function calculateMonthlyRashan(
  familySize: number,
  cityId: string
): {
  totalEstimatedPKR: number;
  totalPotentialSavingsPKR: number;
  itemsBreakdown: {
    item: CommodityItem;
    monthlyQty: number;
    unitPrice: number;
    totalCost: number;
    potentialSaving: number;
  }[];
} {
  let totalEstimatedPKR = 0;
  let totalPotentialSavingsPKR = 0;

  const itemsBreakdown = COMMODITIES_DATABASE.map((item) => {
    const unitPrice = getItemPriceForCity(item, cityId);
    let monthlyQty = Math.round(item.monthlyPerPersonQty * familySize * 10) / 10;
    
    // Scale minimum thresholds for realism
    if (item.id === 'atta_flour') {
      monthlyQty = Math.max(1, Math.round((familySize * 5) / 10)); // bags of 10kg
    } else if (item.id === 'cooking_oil') {
      monthlyQty = Math.max(1, Math.round(familySize * 1.25)); // Litres
    } else if (item.id === 'eggs') {
      monthlyQty = Math.max(1, Math.round((familySize * 15) / 12)); // Dozens
    }

    const totalCost = Math.round(monthlyQty * unitPrice);
    const potentialSaving = Math.round(item.bachatPotentialRs * (familySize >= 4 ? 1.2 : 0.8));

    totalEstimatedPKR += totalCost;
    totalPotentialSavingsPKR += potentialSaving;

    return {
      item,
      monthlyQty,
      unitPrice,
      totalCost,
      potentialSaving,
    };
  });

  return {
    totalEstimatedPKR,
    totalPotentialSavingsPKR,
    itemsBreakdown,
  };
}
