// ── Bias Score System ────────────────────────────────────────

export type BiasSignal = -1 | 0 | 1;

export type TimeHorizon = "intraday" | "swing" | "longterm";

export type MarketState =
  | "Strong Bullish"
  | "Bullish"
  | "Slightly Bullish"
  | "Neutral"
  | "Slightly Bearish"
  | "Bearish"
  | "Strong Bearish";

export type ActionRecommendation =
  | "Strong Buy"
  | "Buy"
  | "Lean Buy"
  | "Hold"
  | "Lean Sell"
  | "Sell"
  | "Strong Sell";

export interface BiasScoreData {
  totalScore: number; // -35 to +35
  upProbability: number; // 0-100
  downProbability: number; // 0-100
  confidence: number; // 0-100
  marketState: MarketState;
  actionRecommendation: ActionRecommendation;
  riskLevel: RiskLevel;
}

export type RiskLevel = "Low" | "Medium" | "High";

// ── Prices ─────────────────────────────────────────────────────

export interface PricePoint {
  date: string;
  price: number;
}

// ── Factor Categories ──────────────────────────────────────────

export type FactorCategoryId =
  | "global_macro"
  | "india_market"
  | "market_microstructure"
  | "technical"
  | "volatility_risk"
  | "behavioral_supply";

export interface SubParameter {
  name: string;
  signal: BiasSignal;
  weight: number; // percentage weight within category (e.g., 12 = 12%)
  impact: "bullish" | "bearish" | "neutral";
  detail: string;
  relevantHorizons: TimeHorizon[];
}

export interface FactorCategory {
  id: FactorCategoryId;
  name: string;
  icon: string;
  weight: number; // 0-1, all weights sum to 1
  signal: BiasSignal;
  factorScore: number; // weighted sum of sub-parameter signals
  subParameters: SubParameter[];
}

export interface CategoryWeights {
  global_macro: number;
  india_market: number;
  market_microstructure: number;
  technical: number;
  volatility_risk: number;
  behavioral_supply: number;
}

export const DEFAULT_CATEGORY_WEIGHTS: CategoryWeights = {
  global_macro: 35,
  india_market: 15,
  market_microstructure: 20,
  technical: 15,
  volatility_risk: 10,
  behavioral_supply: 5,
};

// ── Technical Indicators ───────────────────────────────────────

export interface TechnicalIndicators {
  ma5: (number | null)[];
  ma20: (number | null)[];
  ma50: (number | null)[];
  rsi: number;
  atr: number;
  support: number;
  resistance: number;
  momentum: number;
}

// ── Risk Calendar ──────────────────────────────────────────────

export interface RiskEvent {
  date: string;
  title: string;
  category: string;
  impact: "high" | "medium" | "low";
  description: string;
}

export interface VolatilityPoint {
  date: string;
  historical: number;
  implied: number;
}

// ── Statistics ─────────────────────────────────────────────────

export interface Statistics {
  currentPrice: number;
  currentPriceINR: number;
  dailyChange: number;
  dailyChangePercent: number;
  high52w: number;
  low52w: number;
  high52wINR: number;
  low52wINR: number;
  average: number;
  averageINR: number;
  volatility: number;
}

// ── Dashboard Data (orchestrator output) ───────────────────────

export interface DashboardData {
  filteredData: PricePoint[];
  statistics: Statistics;
  biasScoreData: BiasScoreData;
  factorCategories: FactorCategory[];
  technicalIndicators: TechnicalIndicators;
  riskEvents: RiskEvent[];
  volatilityHistory: VolatilityPoint[];
  lastUpdated: Date;
}
