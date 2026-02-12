import type {
  FactorCategory,
  SubParameter,
  FactorCategoryId,
  BiasSignal,
  TimeHorizon,
  CategoryWeights,
} from "./types";

interface SubFactorTemplate {
  name: string;
  weight: number; // % within category
  detail: string;
  relevantHorizons: TimeHorizon[];
}

interface FactorTemplate {
  id: FactorCategoryId;
  name: string;
  icon: string;
  defaultWeight: number; // 0-1
  subFactors: SubFactorTemplate[];
}

const TEMPLATES: FactorTemplate[] = [
  {
    id: "global_macro",
    name: "Global Macro",
    icon: "Globe",
    defaultWeight: 0.35,
    subFactors: [
      { name: "US 10Y Real Yield", weight: 10, detail: "Real yield inversely correlated with gold; rising yields pressure gold", relevantHorizons: ["swing", "longterm"] },
      { name: "Treasury Yield Curve", weight: 3, detail: "Yield curve shape signals recession risk and safe-haven demand", relevantHorizons: ["swing", "longterm"] },
      { name: "Inflation Expectations", weight: 5, detail: "Breakeven inflation rates drive gold as an inflation hedge", relevantHorizons: ["swing", "longterm"] },
      { name: "Fed Rate Expectations", weight: 5, detail: "Fed funds futures pricing for next meeting and forward path", relevantHorizons: ["swing", "longterm"] },
      { name: "DXY Index", weight: 4, detail: "US Dollar Index inversely correlated with gold prices", relevantHorizons: ["intraday", "swing", "longterm"] },
      { name: "Geopolitical Tensions", weight: 1.5, detail: "Global conflict index and geopolitical risk premium", relevantHorizons: ["intraday", "swing", "longterm"] },
      { name: "Global Liquidity", weight: 3, detail: "Central bank balance sheet expansion supports gold", relevantHorizons: ["longterm"] },
      { name: "GDP Growth", weight: 1.5, detail: "Slowing GDP growth increases safe-haven appeal", relevantHorizons: ["longterm"] },
      { name: "Unemployment Rate", weight: 1, detail: "Rising unemployment signals economic weakness, bullish for gold", relevantHorizons: ["longterm"] },
      { name: "M2 Money Supply", weight: 1, detail: "Monetary expansion creates inflation risk, supports gold", relevantHorizons: ["longterm"] },
    ],
  },
  {
    id: "india_market",
    name: "India Market Pulse",
    icon: "IndianRupee",
    defaultWeight: 0.15,
    subFactors: [
      { name: "INR-USD Exchange Rate", weight: 6, detail: "Rupee depreciation directly boosts INR gold prices", relevantHorizons: ["intraday", "swing", "longterm"] },
      { name: "RBI Policy Stance", weight: 2, detail: "RBI rate decisions and liquidity measures affect gold demand", relevantHorizons: ["swing", "longterm"] },
      { name: "MCX-COMEX Basis", weight: 3, detail: "Premium/discount between MCX and COMEX gold futures", relevantHorizons: ["intraday", "swing"] },
      { name: "Local Premium/Discount", weight: 2, detail: "India physical gold premium over international price", relevantHorizons: ["intraday", "swing"] },
      { name: "Import Duty Effect", weight: 1, detail: "Changes in gold import duty impact domestic prices", relevantHorizons: ["longterm"] },
      { name: "Festival/Wedding Season", weight: 1, detail: "Seasonal demand spikes during Diwali, Akshaya Tritiya, wedding season", relevantHorizons: ["swing", "longterm"] },
    ],
  },
  {
    id: "market_microstructure",
    name: "Market Microstructure & Flows",
    icon: "BarChart3",
    defaultWeight: 0.20,
    subFactors: [
      { name: "Open Interest Change", weight: 3, detail: "Rising OI with price confirms trend strength", relevantHorizons: ["intraday", "swing"] },
      { name: "OI + Price Divergence", weight: 3, detail: "Divergence between OI and price signals potential reversal", relevantHorizons: ["intraday", "swing"] },
      { name: "Volume Delta", weight: 2.5, detail: "Buy vs sell volume imbalance indicates directional pressure", relevantHorizons: ["intraday"] },
      { name: "Large Trader Positioning", weight: 2.5, detail: "Institutional order flow and block trade patterns", relevantHorizons: ["intraday", "swing"] },
      { name: "VWAP Deviation", weight: 1.5, detail: "Price relative to VWAP signals intraday fair value", relevantHorizons: ["intraday"] },
      { name: "Bid-Ask Spread", weight: 1.5, detail: "Widening spreads indicate stress; tight spreads mean confidence", relevantHorizons: ["intraday"] },
      { name: "COT Net Speculative", weight: 3, detail: "CFTC Commitment of Traders speculative net positioning", relevantHorizons: ["swing", "longterm"] },
      { name: "ETF Flows (GLD/IAU)", weight: 3, detail: "Gold ETF inflows/outflows signal institutional sentiment", relevantHorizons: ["swing", "longterm"] },
    ],
  },
  {
    id: "technical",
    name: "Technical Indicators",
    icon: "TrendingUp",
    defaultWeight: 0.15,
    subFactors: [
      { name: "Moving Average Alignment", weight: 4, detail: "5/20/50-day MA crossovers and alignment direction", relevantHorizons: ["intraday", "swing", "longterm"] },
      { name: "Support/Resistance", weight: 3, detail: "Key price levels from historical pivots and Fibonacci", relevantHorizons: ["intraday", "swing"] },
      { name: "RSI (14-day)", weight: 2, detail: "Overbought >70, oversold <30 momentum oscillator", relevantHorizons: ["intraday", "swing"] },
      { name: "ATR Volatility", weight: 2, detail: "Average True Range indicates current volatility regime", relevantHorizons: ["intraday", "swing"] },
      { name: "Momentum (ROC)", weight: 2, detail: "Rate of change and momentum divergence signals", relevantHorizons: ["intraday", "swing"] },
      { name: "Volume Trend", weight: 2, detail: "Volume confirming or diverging from price trend", relevantHorizons: ["intraday", "swing"] },
    ],
  },
  {
    id: "volatility_risk",
    name: "Volatility & Risk",
    icon: "Shield",
    defaultWeight: 0.10,
    subFactors: [
      { name: "Implied Volatility", weight: 3, detail: "Gold options implied vol signals expected future moves", relevantHorizons: ["intraday", "swing"] },
      { name: "Historical Volatility", weight: 2, detail: "Realized volatility over trailing 20/60 day windows", relevantHorizons: ["swing", "longterm"] },
      { name: "Volatility Skew", weight: 2, detail: "Put/call skew indicates directional fear in options market", relevantHorizons: ["swing"] },
      { name: "Event Risk Premium", weight: 3, detail: "Elevated risk ahead of FOMC, NFP, CPI releases", relevantHorizons: ["intraday", "swing"] },
    ],
  },
  {
    id: "behavioral_supply",
    name: "Behavioral & Physical Supply-Demand",
    icon: "Scale",
    defaultWeight: 0.05,
    subFactors: [
      { name: "COT Sentiment Reports", weight: 1, detail: "Commercial hedger vs speculator positioning extremes", relevantHorizons: ["swing", "longterm"] },
      { name: "Retail Sentiment", weight: 0.5, detail: "Retail investor positioning as a contrarian indicator", relevantHorizons: ["swing"] },
      { name: "Central Bank Buying", weight: 1, detail: "Global central bank gold reserve accumulation trends", relevantHorizons: ["longterm"] },
      { name: "Jewelry Demand", weight: 0.5, detail: "Consumer jewelry demand from India, China, Middle East", relevantHorizons: ["longterm"] },
      { name: "Mine Production", weight: 0.5, detail: "Global gold mining output and all-in sustaining costs", relevantHorizons: ["longterm"] },
      { name: "Recycling Supply", weight: 0.5, detail: "Scrap gold supply increases when prices are high", relevantHorizons: ["longterm"] },
      { name: "China Demand", weight: 1, detail: "Shanghai Gold Exchange withdrawals and PBOC buying", relevantHorizons: ["swing", "longterm"] },
    ],
  },
];

export function getDefaultSubFactorWeights(): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const tmpl of TEMPLATES) {
    result[tmpl.id] = {};
    for (const sf of tmpl.subFactors) {
      result[tmpl.id][sf.name] = sf.weight;
    }
  }
  return result;
}

function signalToImpact(signal: BiasSignal): "bullish" | "bearish" | "neutral" {
  if (signal === 1) return "bullish";
  if (signal === -1) return "bearish";
  return "neutral";
}

function generateSignal(rand: () => number): BiasSignal {
  const r = rand();
  if (r < 0.35) return 1;
  if (r < 0.65) return 0;
  return -1;
}

export function generateFactorCategories(
  rand: () => number,
  categoryWeights?: CategoryWeights,
  subFactorWeights?: Record<string, Record<string, number>>
): FactorCategory[] {
  return TEMPLATES.map((tmpl) => {
    const weight = categoryWeights
      ? (categoryWeights[tmpl.id as keyof CategoryWeights] ?? tmpl.defaultWeight * 100) / 100
      : tmpl.defaultWeight;

    const subParameters: SubParameter[] = tmpl.subFactors.map((sf) => {
      const signal = generateSignal(rand);
      const customWeight = subFactorWeights?.[tmpl.id]?.[sf.name];
      return {
        name: sf.name,
        signal,
        weight: customWeight ?? sf.weight,
        impact: signalToImpact(signal),
        detail: sf.detail,
        relevantHorizons: sf.relevantHorizons,
      };
    });

    // Category factor score: sum of (signal * sub-weight)
    const factorScore = subParameters.reduce(
      (sum, sp) => sum + sp.signal * sp.weight,
      0
    );

    // Category signal: based on factor score direction
    const totalWeight = subParameters.reduce((sum, sp) => sum + sp.weight, 0);
    let signal: BiasSignal = 0;
    if (totalWeight > 0) {
      const normalized = factorScore / totalWeight;
      if (normalized > 0.15) signal = 1;
      else if (normalized < -0.15) signal = -1;
    }

    return {
      id: tmpl.id,
      name: tmpl.name,
      icon: tmpl.icon,
      weight,
      signal,
      factorScore: Math.round(factorScore * 100) / 100,
      subParameters,
    };
  });
}
