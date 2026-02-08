// Types
export interface PricePoint {
  date: string;
  price: number;
}

export interface PredictionPoint {
  date: string;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

export interface MarketFactor {
  name: string;
  impact: "bullish" | "bearish" | "neutral";
  description: string;
}

export interface Statistics {
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  high52w: number;
  low52w: number;
  average: number;
  volatility: number;
}

// Seeded random number generator for deterministic output
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate 365 days of historical gold prices
function generateHistoricalData(): PricePoint[] {
  const rand = seededRandom(42);
  const data: PricePoint[] = [];
  const basePrice = 1950;
  let price = basePrice;

  const startDate = new Date("2024-01-01");

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Slight upward drift
    const drift = 0.15;
    // Sinusoidal seasonal component
    const seasonal = 30 * Math.sin((2 * Math.PI * i) / 180);
    // Random noise
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

// Linear regression on last N points
function linearRegression(points: PricePoint[]): { slope: number; intercept: number } {
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += points[i].price;
    sumXY += i * points[i].price;
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Generate prediction points
function generatePredictions(
  historicalData: PricePoint[],
  days: number
): PredictionPoint[] {
  const last30 = historicalData.slice(-30);
  const { slope, intercept } = linearRegression(last30);
  const lastIndex = 29;

  // Calculate standard deviation of residuals for confidence interval
  let sumSquaredResiduals = 0;
  for (let i = 0; i < last30.length; i++) {
    const predicted = intercept + slope * i;
    sumSquaredResiduals += (last30[i].price - predicted) ** 2;
  }
  const stdDev = Math.sqrt(sumSquaredResiduals / (last30.length - 2));

  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const predictions: PredictionPoint[] = [];

  for (let i = 1; i <= days; i++) {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i);

    const predicted = intercept + slope * (lastIndex + i);
    // Confidence interval widens with sqrt of days ahead
    const margin = 1.96 * stdDev * Math.sqrt(i);

    predictions.push({
      date: date.toISOString().split("T")[0],
      predicted: Math.round(predicted * 100) / 100,
      upperBound: Math.round((predicted + margin) * 100) / 100,
      lowerBound: Math.round((predicted - margin) * 100) / 100,
    });
  }

  return predictions;
}

// Compute statistics
function computeStatistics(data: PricePoint[]): Statistics {
  const prices = data.map((d) => d.price);
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2];
  const dailyChange = Math.round((currentPrice - previousPrice) * 100) / 100;
  const dailyChangePercent =
    Math.round((dailyChange / previousPrice) * 10000) / 100;

  const high52w = Math.max(...prices);
  const low52w = Math.min(...prices);
  const average = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;

  // Annualized volatility from daily returns
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
    dailyChange,
    dailyChangePercent,
    high52w: Math.round(high52w * 100) / 100,
    low52w: Math.round(low52w * 100) / 100,
    average,
    volatility: annualizedVol,
  };
}

// Static market factors
export const marketFactors: MarketFactor[] = [
  {
    name: "USD Strength",
    impact: "bearish",
    description: "Dollar index rising, pressuring gold prices downward",
  },
  {
    name: "Inflation Outlook",
    impact: "bullish",
    description: "Persistent inflation expectations supporting safe-haven demand",
  },
  {
    name: "Geopolitical Risk",
    impact: "bullish",
    description: "Elevated global tensions driving flight-to-safety flows",
  },
  {
    name: "Central Bank Buying",
    impact: "bullish",
    description: "Central banks continue accumulating gold reserves globally",
  },
  {
    name: "Real Interest Rates",
    impact: "bearish",
    description: "Rising real yields increasing opportunity cost of holding gold",
  },
  {
    name: "ETF Flows",
    impact: "neutral",
    description: "Mixed inflows and outflows across major gold ETFs",
  },
];

// Filter by time range
export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y";

export function filterByRange(data: PricePoint[], range: TimeRange): PricePoint[] {
  const daysMap: Record<TimeRange, number> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
  };
  const days = daysMap[range];
  return data.slice(-days);
}

// Export generated data
export const historicalData = generateHistoricalData();
export const statistics = computeStatistics(historicalData);

export type PredictionHorizon = 7 | 30 | 90;

export function getPredictions(horizon: PredictionHorizon): PredictionPoint[] {
  return generatePredictions(historicalData, horizon);
}
