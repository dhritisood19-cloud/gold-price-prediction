import type {
  PricePoint,
  Statistics,
  BiasScoreData,
  MarketState,
  ActionRecommendation,
  RiskLevel,
  FactorCategory,
  TechnicalIndicators,
  RiskEvent,
  VolatilityPoint,
  DashboardData,
  CategoryWeights,
} from "./types";
import { generateFactorCategories } from "./mock-factors";
import { computeTechnicalIndicators, generateVolatilityHistory } from "./mock-technicals";
import { generateRiskEvents } from "./mock-events";

// Re-export types
export type { PricePoint, Statistics };

// ── Constants ──────────────────────────────────────────────────

export const USD_TO_INR = 83.5;

/** Convert USD/oz to INR per 1g */
export function toINR(usdPerOz: number): number {
  return Math.round((usdPerOz / 31.1035) * USD_TO_INR * 100) / 100;
}

// ── Seeded PRNG (exported) ─────────────────────────────────────

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Historical Data Generation ─────────────────────────────────

function generateHistoricalData(): PricePoint[] {
  const rand = seededRandom(42);
  const data: PricePoint[] = [];
  const basePrice = 1950;
  let price = basePrice;

  const startDate = new Date("2024-01-01");

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const drift = 0.15;
    const seasonal = 30 * Math.sin((2 * Math.PI * i) / 180);
    const noise = (rand() - 0.5) * 20;

    price = price + drift + noise * 0.3;
    const displayPrice = price + seasonal;

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(displayPrice * 100) / 100,
    });
  }

  return data;
}

// ── Statistics ──────────────────────────────────────────────────

function computeStatistics(data: PricePoint[]): Statistics {
  const prices = data.map((d) => d.price);
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2];
  const dailyChange = Math.round((currentPrice - previousPrice) * 100) / 100;
  const dailyChangePercent =
    Math.round((dailyChange / previousPrice) * 10000) / 100;

  const high52w = Math.round(Math.max(...prices) * 100) / 100;
  const low52w = Math.round(Math.min(...prices) * 100) / 100;
  const average = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) /
    (returns.length - 1);
  const dailyVol = Math.sqrt(variance);
  const annualizedVol = Math.round(dailyVol * Math.sqrt(252) * 10000) / 100;

  return {
    currentPrice,
    currentPriceINR: toINR(currentPrice),
    dailyChange,
    dailyChangePercent,
    high52w,
    low52w,
    high52wINR: toINR(high52w),
    low52wINR: toINR(low52w),
    average,
    averageINR: toINR(average),
    volatility: annualizedVol,
  };
}

// ── Bias Score Computation ──────────────────────────────────────

export function computeBiasScore(
  factorCategories: FactorCategory[],
  stats: Statistics
): BiasScoreData {
  // Total score = sum of (category.factorScore * category.weight) for all categories
  // Each category's factorScore is already: sum of (signal * subWeight)
  // So totalScore = weighted sum across categories
  let totalScore = 0;
  for (const cat of factorCategories) {
    totalScore += cat.factorScore * cat.weight;
  }

  // Clamp to -35 to +35 range
  totalScore = Math.max(-35, Math.min(35, Math.round(totalScore * 100) / 100));

  // Map totalScore to probabilities
  // At +35, up probability ~95%. At -35, up probability ~5%.
  const normalizedScore = (totalScore + 35) / 70; // 0 to 1
  const upProbability = Math.round(Math.min(95, Math.max(5, normalizedScore * 90 + 5)));
  const downProbability = 100 - upProbability;

  // Market state
  let marketState: MarketState;
  if (totalScore > 20) marketState = "Strong Bullish";
  else if (totalScore > 10) marketState = "Bullish";
  else if (totalScore > 3) marketState = "Slightly Bullish";
  else if (totalScore >= -3) marketState = "Neutral";
  else if (totalScore >= -10) marketState = "Slightly Bearish";
  else if (totalScore >= -20) marketState = "Bearish";
  else marketState = "Strong Bearish";

  // Action recommendation
  let actionRecommendation: ActionRecommendation;
  if (totalScore > 20) actionRecommendation = "Strong Buy";
  else if (totalScore > 10) actionRecommendation = "Buy";
  else if (totalScore > 3) actionRecommendation = "Lean Buy";
  else if (totalScore >= -3) actionRecommendation = "Hold";
  else if (totalScore >= -10) actionRecommendation = "Lean Sell";
  else if (totalScore >= -20) actionRecommendation = "Sell";
  else actionRecommendation = "Strong Sell";

  // Confidence: higher when score is more extreme and volatility is lower
  const absScore = Math.abs(totalScore);
  const scoreFactor = (absScore / 35) * 50; // 0-50 from score strength
  const volPenalty = Math.min(stats.volatility / 30, 0.3) * 30; // 0-30 penalty
  const confidence = Math.round(Math.min(95, Math.max(30, 40 + scoreFactor - volPenalty)));

  // Risk level
  let riskLevel: RiskLevel;
  if (stats.volatility > 20) riskLevel = "High";
  else if (stats.volatility > 12) riskLevel = "Medium";
  else riskLevel = "Low";

  return {
    totalScore,
    upProbability,
    downProbability,
    confidence,
    marketState,
    actionRecommendation,
    riskLevel,
  };
}

// ── Filtering ──────────────────────────────────────────────────

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y";

export function filterByRange(data: PricePoint[], range: TimeRange): PricePoint[] {
  const daysMap: Record<TimeRange, number> = {
    "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365,
  };
  return data.slice(-daysMap[range]);
}

// ── Exports ────────────────────────────────────────────────────

export const historicalData = generateHistoricalData();
export const statistics = computeStatistics(historicalData);

// ── Dashboard Orchestrator ─────────────────────────────────────

export function buildDashboardData(
  timeRange: TimeRange,
  categoryWeights: CategoryWeights,
  subFactorWeights: Record<string, Record<string, number>>,
  refreshCounter: number
): DashboardData {
  const filteredData = filterByRange(historicalData, timeRange);
  const stats = computeStatistics(historicalData);

  const factorSeed = 42 + refreshCounter;
  const factorCategories: FactorCategory[] = generateFactorCategories(
    seededRandom(factorSeed),
    categoryWeights,
    subFactorWeights
  );
  const technicalIndicators: TechnicalIndicators = computeTechnicalIndicators(historicalData);
  const riskEvents: RiskEvent[] = generateRiskEvents(historicalData[historicalData.length - 1].date);
  const volatilityHistory: VolatilityPoint[] = generateVolatilityHistory(seededRandom(99));

  const biasScoreData = computeBiasScore(factorCategories, stats);

  return {
    filteredData,
    statistics: stats,
    biasScoreData,
    factorCategories,
    technicalIndicators,
    riskEvents,
    volatilityHistory,
    lastUpdated: new Date(),
  };
}
