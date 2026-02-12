"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
} from "lucide-react";
import type { BiasScoreData, Statistics } from "@/lib/types";

interface HeroDecisionProps {
  statistics: Statistics;
  biasScoreData: BiasScoreData;
}

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function getScoreColor(score: number): string {
  if (score > 10) return "text-positive";
  if (score > 3) return "text-positive/80";
  if (score >= -3) return "text-muted-foreground";
  if (score >= -10) return "text-negative/80";
  return "text-negative";
}

function getScoreBg(score: number): string {
  if (score > 10) return "bg-positive/10";
  if (score > 3) return "bg-positive/5";
  if (score >= -3) return "bg-muted";
  if (score >= -10) return "bg-negative/5";
  return "bg-negative/10";
}

function getMarketStateBadge(state: string): { bg: string; text: string } {
  if (state.includes("Strong Bullish")) return { bg: "bg-positive", text: "text-white" };
  if (state.includes("Bullish")) return { bg: "bg-positive/15", text: "text-positive" };
  if (state.includes("Neutral")) return { bg: "bg-muted", text: "text-muted-foreground" };
  if (state.includes("Strong Bearish")) return { bg: "bg-negative", text: "text-white" };
  if (state.includes("Bearish")) return { bg: "bg-negative/15", text: "text-negative" };
  return { bg: "bg-muted", text: "text-muted-foreground" };
}

function getActionColor(action: string): string {
  if (action.includes("Buy")) return "bg-positive text-white";
  if (action.includes("Sell")) return "bg-negative text-white";
  return "bg-warning text-foreground";
}

const riskConfig = {
  Low: "text-positive",
  Medium: "text-warning",
  High: "text-negative",
};

export default function HeroDecision({
  statistics: stats,
  biasScoreData: bias,
}: HeroDecisionProps) {
  const isPositive = stats.dailyChange >= 0;
  const marketBadge = getMarketStateBadge(bias.marketState);

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* Price + Bias Score row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Price */}
        <div>
          <p className="text-xs text-muted-foreground">Gold Price (₹/10g)</p>
          <span className="text-4xl font-bold tracking-tight sm:text-5xl">
            {formatINR(stats.currentPriceINR)}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
              }`}
            >
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {isPositive ? "+" : ""}
              {stats.dailyChangePercent.toFixed(2)}%
            </div>
            <span className="text-sm text-muted-foreground">
              ${stats.currentPrice.toFixed(2)} / oz
            </span>
          </div>
        </div>

        {/* Right: Bias Score */}
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Bias Score</p>
          <span className={`text-5xl font-bold tracking-tight ${getScoreColor(bias.totalScore)}`}>
            {bias.totalScore > 0 ? "+" : ""}{bias.totalScore.toFixed(1)}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">Range: -35 to +35</p>
        </div>
      </div>

      {/* Gradient divider */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Probability bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1 font-medium text-positive">
            <TrendingUp className="h-3.5 w-3.5" />
            Up {bias.upProbability}%
          </span>
          <span className="flex items-center gap-1 font-medium text-negative">
            Down {bias.downProbability}%
            <TrendingDown className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="bg-positive transition-all"
            style={{ width: `${bias.upProbability}%` }}
          />
          <div
            className="bg-negative transition-all"
            style={{ width: `${bias.downProbability}%` }}
          />
        </div>
      </div>

      {/* Market State, Risk, Confidence row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Market state badge */}
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${marketBadge.bg} ${marketBadge.text}`}>
          <Activity className="h-3.5 w-3.5" />
          {bias.marketState}
        </div>

        {/* Risk level */}
        <div className="flex items-center gap-1.5 text-xs">
          <ShieldAlert className={`h-3.5 w-3.5 ${riskConfig[bias.riskLevel]}`} />
          <span className="text-muted-foreground">Risk:</span>
          <span className={`font-semibold ${riskConfig[bias.riskLevel]}`}>
            {bias.riskLevel}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2 text-xs">
          <Target className="h-3.5 w-3.5 text-info" />
          <span className="text-muted-foreground">Confidence:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-16 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-info transition-all"
                style={{ width: `${bias.confidence}%` }}
              />
            </div>
            <span className="font-semibold">{bias.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Action Recommendation */}
      <button
        className={`mt-4 w-full rounded-lg py-3 text-center text-lg font-bold shadow-sm transition-opacity hover:opacity-90 ${getActionColor(bias.actionRecommendation)}`}
      >
        {bias.actionRecommendation}
      </button>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        This is a simulated signal for educational purposes only. Not financial advice.
      </p>
    </div>
  );
}
