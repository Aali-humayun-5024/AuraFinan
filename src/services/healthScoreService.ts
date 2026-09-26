// AuraFinance OS — Financial Health & Karma Score Mathematical Engine (0 - 1000)
// Formula: Score = (Savings Rate * 400) + (Budget Adherence * 350) + (Emergency Runway Ratio * 250)

export type HealthBadgeTier = 'Vulnerable' | 'Balanced' | 'Wealth Builder' | 'Financial Sovereign';

export interface HealthScoreBreakdown {
  score: number; // 0 - 1000
  savingsRate: number; // 0.0 - 1.0
  savingsRateContrib: number; // 0 - 400
  budgetAdherence: number; // 0.0 - 1.0
  budgetAdherenceContrib: number; // 0 - 350
  runwayRatio: number; // 0.0 - 1.0
  runwayContrib: number; // 0 - 250
  badge: HealthBadgeTier;
  badgeColor: string;
  glowColor: string;
  description: string;
  runwayMonths: number;
}

export function calculateHealthScore(params: {
  totalIncome: number;
  totalExpenses: number;
  wantsExpenses: number;
  needsExpenses: number;
  totalLiquidSavings: number; // Current emergency fund / savings
}): HealthScoreBreakdown {
  const { totalIncome, totalExpenses, wantsExpenses, needsExpenses, totalLiquidSavings } = params;

  // 1. Savings Rate Component (0 - 400 points)
  let savingsRate = 0;
  if (totalIncome > 0) {
    const netSavings = Math.max(0, totalIncome - totalExpenses);
    savingsRate = Math.min(Math.max(netSavings / totalIncome, 0), 1);
  }
  const savingsRateContrib = Math.round(savingsRate * 400);

  // 2. Budget Adherence Component (0 - 350 points)
  // Evaluates adherence to 50/30/20 guidelines:
  // Wants should be <= 30% of income; Total expenses should be <= income
  let budgetAdherence = 1.0;
  if (totalIncome > 0) {
    const wantsRatio = wantsExpenses / totalIncome;
    const wantsPenalty = wantsRatio > 0.30 ? (wantsRatio - 0.30) * 1.5 : 0;
    const overspendPenalty = totalExpenses > totalIncome ? (totalExpenses - totalIncome) / totalIncome : 0;
    budgetAdherence = Math.max(0, Math.min(1.0, 1.0 - wantsPenalty - overspendPenalty));
  } else if (totalExpenses > 0) {
    budgetAdherence = 0.2;
  }
  const budgetAdherenceContrib = Math.round(budgetAdherence * 350);

  // 3. Emergency Runway Ratio Component (0 - 250 points)
  // Benchmark: 6 months of Needs (or 6 months of basic monthly expense)
  const monthlyBurn = needsExpenses > 0 ? needsExpenses : (totalExpenses > 0 ? totalExpenses : 1000);
  const targetRunway = monthlyBurn * 6;
  const runwayMonths = monthlyBurn > 0 ? Math.round((totalLiquidSavings / monthlyBurn) * 10) / 10 : 0;
  const runwayRatio = Math.min(Math.max(totalLiquidSavings / Math.max(targetRunway, 1), 0), 1.0);
  const runwayContrib = Math.round(runwayRatio * 250);

  // Overall Score (0 - 1000)
  const rawScore = savingsRateContrib + budgetAdherenceContrib + runwayContrib;
  const score = Math.max(0, Math.min(1000, rawScore));

  // Determine Tier and Badge
  let badge: HealthBadgeTier = 'Vulnerable';
  let badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  let glowColor = 'rgba(244, 63, 94, 0.4)';
  let description = 'High cashflow volatility. Build a 30-day cushion to escape the danger zone.';

  if (score >= 876) {
    badge = 'Financial Sovereign';
    badgeColor = 'text-amber-300 bg-amber-500/20 border-amber-400/40 shadow-amber-500/20';
    glowColor = 'rgba(251, 191, 36, 0.45)';
    description = 'Supreme capital efficiency. Your cashflow flywheel compounds effortlessly.';
  } else if (score >= 701) {
    badge = 'Wealth Builder';
    badgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    glowColor = 'rgba(16, 185, 129, 0.4)';
    description = 'Optimal savings velocity. Consistent capital allocation towards financial independence.';
  } else if (score >= 451) {
    badge = 'Balanced';
    badgeColor = 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
    glowColor = 'rgba(6, 182, 212, 0.4)';
    description = 'Stable liquidity. Moderate cushion with opportunities to tighten discretionary leakage.';
  }

  return {
    score,
    savingsRate,
    savingsRateContrib,
    budgetAdherence,
    budgetAdherenceContrib,
    runwayRatio,
    runwayContrib,
    badge,
    badgeColor,
    glowColor,
    description,
    runwayMonths,
  };
}
