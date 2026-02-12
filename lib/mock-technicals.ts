import type { PricePoint, TechnicalIndicators, VolatilityPoint } from "./types";

/** Simple moving average — returns null for indices before `period` window is full */
export function computeMovingAverage(
  data: PricePoint[],
  period: number
): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].price;
      }
      result.push(Math.round((sum / period) * 100) / 100);
    }
  }
  return result;
}

/** RSI (Relative Strength Index) on last `period` returns */
export function computeRSI(data: PricePoint[], period: number = 14): number {
  const prices = data.map((d) => d.price);
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;
  const startIdx = prices.length - period - 1;

  for (let i = startIdx + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100;
}

/** Average True Range (simplified — based on daily price changes) */
export function computeATR(data: PricePoint[], period: number = 14): number {
  const prices = data.map((d) => d.price);
  if (prices.length < period + 1) return 0;

  let sum = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    sum += Math.abs(prices[i] - prices[i - 1]);
  }
  return Math.round((sum / period) * 100) / 100;
}

/** Support and resistance from recent highs/lows */
export function computeSupportResistance(data: PricePoint[]): {
  support: number;
  resistance: number;
} {
  const recent = data.slice(-60);
  const prices = recent.map((d) => d.price);
  const sorted = [...prices].sort((a, b) => a - b);

  // Support = average of bottom 10% prices, resistance = average of top 10%
  const n = Math.max(3, Math.floor(sorted.length * 0.1));
  const support = sorted.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const resistance = sorted.slice(-n).reduce((a, b) => a + b, 0) / n;

  return {
    support: Math.round(support * 100) / 100,
    resistance: Math.round(resistance * 100) / 100,
  };
}

/** Momentum indicator: percentage change over last 10 days, mapped to -100..100 */
export function computeMomentum(data: PricePoint[], lookback: number = 10): number {
  if (data.length < lookback + 1) return 0;
  const current = data[data.length - 1].price;
  const past = data[data.length - 1 - lookback].price;
  const pctChange = ((current - past) / past) * 100;
  // Clamp to -100..100 with scaling
  return Math.round(Math.max(-100, Math.min(100, pctChange * 20)));
}

/** Compute all technical indicators for a full dataset */
export function computeTechnicalIndicators(data: PricePoint[]): TechnicalIndicators {
  const { support, resistance } = computeSupportResistance(data);
  return {
    ma5: computeMovingAverage(data, 5),
    ma20: computeMovingAverage(data, 20),
    ma50: computeMovingAverage(data, 50),
    rsi: computeRSI(data),
    atr: computeATR(data),
    support,
    resistance,
    momentum: computeMomentum(data),
  };
}

/** Generate 30 days of volatility history (historical vs implied) */
export function generateVolatilityHistory(rand: () => number): VolatilityPoint[] {
  const points: VolatilityPoint[] = [];
  const baseDate = new Date("2024-12-01");

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    const historical = 12 + rand() * 8;
    const implied = historical + (rand() - 0.4) * 5;

    points.push({
      date: date.toISOString().split("T")[0],
      historical: Math.round(historical * 100) / 100,
      implied: Math.round(Math.max(5, implied) * 100) / 100,
    });
  }

  return points;
}
