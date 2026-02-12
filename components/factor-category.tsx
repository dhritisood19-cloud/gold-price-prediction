"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  BarChart3,
  Scale,
  IndianRupee,
  Shield,
  TrendingUp,
  CircleDot,
} from "lucide-react";
import BiasIndicator from "./bias-indicator";
import type { FactorCategory as FactorCategoryType, TimeHorizon } from "@/lib/types";

interface FactorCategoryProps {
  category: FactorCategoryType;
  timeHorizon: TimeHorizon;
}

const impactStyles = {
  bullish: "bg-positive/10 text-positive",
  bearish: "bg-negative/10 text-negative",
  neutral: "bg-muted text-muted-foreground",
};

const iconMap: Record<string, typeof CircleDot> = {
  Globe,
  BarChart3,
  Scale,
  IndianRupee,
  Shield,
  TrendingUp,
};

function getIcon(name: string) {
  return iconMap[name] || CircleDot;
}

export default function FactorCategoryCard({ category, timeHorizon }: FactorCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = getIcon(category.icon);

  // Filter sub-parameters by time horizon
  const filteredSubs = category.subParameters.filter((sp) =>
    sp.relevantHorizons.includes(timeHorizon)
  );

  const signalLabel =
    category.signal === 1 ? "Bullish" : category.signal === -1 ? "Bearish" : "Neutral";

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm transition-all">
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-muted">
          <Icon className="h-4.5 w-4.5 text-gold-dark" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{category.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {Math.round(category.weight * 100)}%
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${impactStyles[category.signal === 1 ? "bullish" : category.signal === -1 ? "bearish" : "neutral"]}`}
            >
              {signalLabel}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Score: {category.factorScore > 0 ? "+" : ""}{category.factorScore.toFixed(1)}
            </span>
          </div>
        </div>

        <BiasIndicator signal={category.signal} size="md" />

        <div className="shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded sub-parameters */}
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {filteredSubs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No factors relevant to this time horizon.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredSubs.map((sp) => (
                <div key={sp.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{sp.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {sp.weight}%
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${impactStyles[sp.impact]}`}
                      >
                        {sp.impact}
                      </span>
                      <BiasIndicator signal={sp.signal} size="sm" />
                    </div>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{sp.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
