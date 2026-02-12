"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Moon,
  Coins,
} from "lucide-react";
import GoldChart from "@/components/gold-chart";
import HeroDecision from "@/components/hero-decision";
import TimeHorizonSelector from "@/components/time-horizon-selector";
import FactorBreakdown from "@/components/factor-breakdown";
import WeightController from "@/components/weight-controller";
import RiskCalendar from "@/components/risk-calendar";
import ConfidenceFooter from "@/components/confidence-footer";
import {
  historicalData,
  buildDashboardData,
  type TimeRange,
} from "@/lib/mock-data";
import type { TimeHorizon, CategoryWeights } from "@/lib/types";
import { DEFAULT_CATEGORY_WEIGHTS } from "@/lib/types";
import { getDefaultSubFactorWeights } from "@/lib/mock-factors";

const TIME_RANGES: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y"];

const DAYS_MAP: Record<TimeRange, number> = {
  "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365,
};

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("swing");
  const [categoryWeights, setCategoryWeights] = useState<CategoryWeights>({ ...DEFAULT_CATEGORY_WEIGHTS });
  const [subFactorWeights, setSubFactorWeights] = useState<Record<string, Record<string, number>>>(() => getDefaultSubFactorWeights());
  const defaultSubFactorWeights = useMemo(() => getDefaultSubFactorWeights(), []);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter((c) => c + 1);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const data = useMemo(
    () => buildDashboardData(timeRange, categoryWeights, subFactorWeights, refreshCounter),
    [timeRange, categoryWeights, subFactorWeights, refreshCounter]
  );

  const maStartIndex = historicalData.length - DAYS_MAP[timeRange];
  const stats = data.statistics;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Hero Decision Panel */}
        <HeroDecision
          statistics={stats}
          biasScoreData={data.biasScoreData}
        />

        {/* Time Horizon Selector */}
        <TimeHorizonSelector selected={timeHorizon} onChange={setTimeHorizon} />

        {/* Time Range Selector */}
        <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />

        {/* Chart */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <GoldChart
            historicalData={data.filteredData}
            technicalIndicators={data.technicalIndicators}
            maStartIndex={maStartIndex}
          />
        </div>

        {/* Factor Breakdown */}
        <FactorBreakdown categories={data.factorCategories} timeHorizon={timeHorizon} />

        {/* Weight Controller */}
        <WeightController
          weights={categoryWeights}
          onChange={setCategoryWeights}
          defaults={DEFAULT_CATEGORY_WEIGHTS}
          subFactorWeights={subFactorWeights}
          onSubFactorWeightsChange={setSubFactorWeights}
          defaultSubFactorWeights={defaultSubFactorWeights}
        />

        {/* Risk Calendar */}
        <RiskCalendar
          events={data.riskEvents}
          volatilityHistory={data.volatilityHistory}
        />

        {/* Confidence Footer */}
        <ConfidenceFooter
          confidence={data.biasScoreData.confidence}
          lastUpdated={data.lastUpdated}
        />
      </div>
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────

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
          <span className="text-gold">Gold</span> Direction Predictor
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

// ── Time Range Selector ────────────────────────────────────────

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

