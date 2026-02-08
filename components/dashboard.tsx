"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import GoldChart from "@/components/gold-chart";
import {
  historicalData,
  statistics,
  marketFactors,
  filterByRange,
  getPredictions,
  type TimeRange,
  type PredictionHorizon,
} from "@/lib/mock-data";

const TIME_RANGES: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y"];
const PREDICTION_HORIZONS: { label: string; value: PredictionHorizon }[] = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [predictionHorizon, setPredictionHorizon] = useState<PredictionHorizon>(30);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const filteredData = filterByRange(historicalData, timeRange);
  const predictions = getPredictions(predictionHorizon);
  const lastPrediction = predictions[predictions.length - 1];
  const isPositiveChange = statistics.dailyChange >= 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Hero Price */}
        <HeroPrice
          currentPrice={statistics.currentPrice}
          dailyChange={statistics.dailyChange}
          dailyChangePercent={statistics.dailyChangePercent}
          isPositive={isPositiveChange}
        />

        {/* Time Range Selector */}
        <TimeRangeSelector
          selected={timeRange}
          onChange={setTimeRange}
        />

        {/* Chart */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <GoldChart historicalData={filteredData} predictions={predictions} />
        </div>

        {/* Prediction Controls */}
        <PredictionControls
          selected={predictionHorizon}
          onChange={setPredictionHorizon}
          lastPrediction={lastPrediction}
        />

        {/* Statistics Grid */}
        <StatisticsGrid />

        {/* Market Factors */}
        <MarketFactorsGrid />
      </div>
    </div>
  );
}

function Header({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-muted">
          <Coins className="h-5 w-5 text-gold" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-gold">Gold</span>Sight
        </h1>
      </div>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="h-5 w-5 text-gold" />
        ) : (
          <Moon className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    </header>
  );
}

function HeroPrice({
  currentPrice,
  dailyChange,
  dailyChangePercent,
  isPositive,
}: {
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  isPositive: boolean;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-end gap-4">
        <span className="text-4xl font-bold tracking-tight sm:text-5xl">
          ${currentPrice.toFixed(2)}
        </span>
        <div
          className={`mb-1 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
            isPositive
              ? "bg-positive/10 text-positive"
              : "bg-negative/10 text-negative"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {isPositive ? "+" : ""}
          {dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
        </div>
      </div>
      <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
      <p className="mt-2 text-sm text-muted-foreground">
        Gold Spot Price (XAU/USD)
      </p>
    </div>
  );
}

function TimeRangeSelector({
  selected,
  onChange,
}: {
  selected: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  return (
    <div className="mt-6 flex gap-2">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === range
              ? "bg-gold text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

function PredictionControls({
  selected,
  onChange,
  lastPrediction,
}: {
  selected: PredictionHorizon;
  onChange: (v: PredictionHorizon) => void;
  lastPrediction: { predicted: number; upperBound: number; lowerBound: number };
}) {
  const predChange = lastPrediction.predicted - statistics.currentPrice;
  const predChangePercent = (predChange / statistics.currentPrice) * 100;
  const isPredPositive = predChange >= 0;

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Price Prediction</h2>
      <div className="flex flex-wrap gap-2">
        {PREDICTION_HORIZONS.map((h) => (
          <button
            key={h.value}
            onClick={() => onChange(h.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === h.value
                ? "bg-gold text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Predicted Price</p>
          <p className="mt-1 text-xl font-bold">
            ${lastPrediction.predicted.toFixed(2)}
          </p>
          <div
            className={`mt-1 flex items-center gap-1 text-sm font-medium ${
              isPredPositive ? "text-positive" : "text-negative"
            }`}
          >
            {isPredPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {isPredPositive ? "+" : ""}
            {predChangePercent.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Upper Bound (95%)</p>
          <p className="mt-1 text-xl font-bold text-positive">
            ${lastPrediction.upperBound.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Lower Bound (95%)</p>
          <p className="mt-1 text-xl font-bold text-negative">
            ${lastPrediction.lowerBound.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatisticsGrid() {
  const stats = [
    {
      label: "52W High",
      value: `$${statistics.high52w.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-positive",
    },
    {
      label: "52W Low",
      value: `$${statistics.low52w.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-negative",
    },
    {
      label: "Average",
      value: `$${statistics.average.toFixed(2)}`,
      icon: Coins,
      color: "text-gold",
    },
    {
      label: "Volatility",
      value: `${statistics.volatility.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-gold-dark",
    },
  ];

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold">Key Statistics</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketFactorsGrid() {
  const impactStyles = {
    bullish: "bg-positive/10 text-positive",
    bearish: "bg-negative/10 text-negative",
    neutral: "bg-muted text-muted-foreground",
  };

  return (
    <div className="mt-6 mb-8">
      <h2 className="mb-3 text-lg font-semibold">Market Factors</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {marketFactors.map((factor) => (
          <div
            key={factor.name}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{factor.name}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  impactStyles[factor.impact]
                }`}
              >
                {factor.impact}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {factor.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
