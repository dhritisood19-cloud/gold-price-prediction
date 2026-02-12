"use client";

import { useState } from "react";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryWeights } from "@/lib/types";

interface WeightControllerProps {
  weights: CategoryWeights;
  onChange: (weights: CategoryWeights) => void;
  defaults: CategoryWeights;
  subFactorWeights: Record<string, Record<string, number>>;
  onSubFactorWeightsChange: (w: Record<string, Record<string, number>>) => void;
  defaultSubFactorWeights: Record<string, Record<string, number>>;
}

const CATEGORY_LABELS: { id: keyof CategoryWeights; label: string }[] = [
  { id: "global_macro", label: "Global Macro" },
  { id: "india_market", label: "India Market Pulse" },
  { id: "market_microstructure", label: "Market Microstructure" },
  { id: "technical", label: "Technical Indicators" },
  { id: "volatility_risk", label: "Volatility & Risk" },
  { id: "behavioral_supply", label: "Behavioral & Supply" },
];

export default function WeightController({
  weights,
  onChange,
  defaults,
  subFactorWeights,
  onSubFactorWeightsChange,
  defaultSubFactorWeights,
}: WeightControllerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isBalanced = Math.abs(total - 100) < 0.5;

  function handleSliderChange(id: keyof CategoryWeights, newValue: number) {
    const oldValue = weights[id];
    const diff = newValue - oldValue;
    if (diff === 0) return;

    const otherIds = CATEGORY_LABELS.map((c) => c.id).filter((cid) => cid !== id);
    const otherTotal = otherIds.reduce((sum, cid) => sum + weights[cid], 0);
    const updated = { ...weights, [id]: newValue };

    if (otherTotal > 0) {
      const remaining = -diff;
      for (const cid of otherIds) {
        const proportion = weights[cid] / otherTotal;
        const adjustment = Math.round(remaining * proportion * 10) / 10;
        updated[cid] = Math.max(0, Math.round((weights[cid] + adjustment) * 10) / 10);
      }

      const newTotal = Object.values(updated).reduce((sum, w) => sum + w, 0);
      const roundingError = Math.round((100 - newTotal) * 10) / 10;
      if (Math.abs(roundingError) > 0.01) {
        const largest = otherIds.reduce((a, b) => (updated[a] >= updated[b] ? a : b));
        updated[largest] = Math.round((updated[largest] + roundingError) * 10) / 10;
      }
    }

    onChange(updated);
  }

  function handleSubFactorChange(categoryId: string, name: string, value: number) {
    const updated = { ...subFactorWeights };
    updated[categoryId] = { ...updated[categoryId], [name]: value };
    onSubFactorWeightsChange(updated);
  }

  function handleResetCategory(id: string) {
    const catId = id as keyof CategoryWeights;
    const defaultWeight = defaults[catId];
    const diff = defaultWeight - weights[catId];

    const otherIds = CATEGORY_LABELS.map((c) => c.id).filter((cid) => cid !== catId);
    const otherTotal = otherIds.reduce((sum, cid) => sum + weights[cid], 0);
    const updated = { ...weights, [catId]: defaultWeight };

    if (otherTotal > 0 && diff !== 0) {
      const remaining = -diff;
      for (const cid of otherIds) {
        const proportion = weights[cid] / otherTotal;
        const adjustment = Math.round(remaining * proportion * 10) / 10;
        updated[cid] = Math.max(0, Math.round((weights[cid] + adjustment) * 10) / 10);
      }
      const newTotal = Object.values(updated).reduce((sum, w) => sum + w, 0);
      const roundingError = Math.round((100 - newTotal) * 10) / 10;
      if (Math.abs(roundingError) > 0.01) {
        const largest = otherIds.reduce((a, b) => (updated[a] >= updated[b] ? a : b));
        updated[largest] = Math.round((updated[largest] + roundingError) * 10) / 10;
      }
    }

    onChange(updated);

    // Reset sub-factor weights for this category
    const updatedSF = { ...subFactorWeights };
    updatedSF[id] = { ...defaultSubFactorWeights[id] };
    onSubFactorWeightsChange(updatedSF);
  }

  function handleResetAll() {
    onChange({ ...defaults });
    const freshDefaults: Record<string, Record<string, number>> = {};
    for (const key of Object.keys(defaultSubFactorWeights)) {
      freshDefaults[key] = { ...defaultSubFactorWeights[key] };
    }
    onSubFactorWeightsChange(freshDefaults);
  }

  function hasCategoryChanges(id: string): boolean {
    const catId = id as keyof CategoryWeights;
    if (weights[catId] !== defaults[catId]) return true;
    const sfWeights = subFactorWeights[id] || {};
    const sfDefaults = defaultSubFactorWeights[id] || {};
    return Object.keys(sfDefaults).some(
      (name) => (sfWeights[name] ?? sfDefaults[name]) !== sfDefaults[name]
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Category Weights</h2>
        <div className="flex items-center gap-3">
          {!isBalanced && (
            <span className="text-xs text-negative font-medium">
              Total: {total.toFixed(0)}% (should be 100%)
            </span>
          )}
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:bg-border transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {CATEGORY_LABELS.map(({ id, label }) => {
          const isExpanded = expandedCategory === id;
          const sfWeights = subFactorWeights[id] || {};
          const sfDefaults = defaultSubFactorWeights[id] || {};
          const sfNames = Object.keys(sfDefaults);
          const hasChanges = hasCategoryChanges(id);

          return (
            <div
              key={id}
              className="rounded-lg border border-border overflow-hidden"
            >
              {/* Category row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : id)
                  }
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <span className="w-40 text-sm text-foreground shrink-0 truncate">
                  {label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={1}
                  value={weights[id]}
                  onChange={(e) =>
                    handleSliderChange(id, Number(e.target.value))
                  }
                  className="flex-1 h-2 rounded-full appearance-none bg-muted accent-gold cursor-pointer"
                />
                <span className="w-12 text-right text-sm font-mono font-medium text-muted-foreground">
                  {weights[id].toFixed(0)}%
                </span>
                {hasChanges && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetCategory(id);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title={`Reset ${label}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sub-factor rows */}
              {isExpanded && sfNames.length > 0 && (
                <div className="border-t border-border bg-muted/30 px-4 pb-3 pt-2">
                  <p className="text-[10px] text-muted-foreground mb-2 pl-7">
                    Sub-factor weights (relative importance within category)
                  </p>
                  <div className="space-y-2">
                    {sfNames.map((name) => {
                      const value = sfWeights[name] ?? sfDefaults[name];
                      return (
                        <div
                          key={name}
                          className="flex items-center gap-3 pl-7"
                        >
                          <span className="w-40 text-xs text-muted-foreground shrink-0 truncate">
                            {name}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={20}
                            step={0.5}
                            value={value}
                            onChange={(e) =>
                              handleSubFactorChange(
                                id,
                                name,
                                Number(e.target.value)
                              )
                            }
                            className="flex-1 h-1.5 rounded-full appearance-none bg-muted accent-gold-dark cursor-pointer"
                          />
                          <span className="w-10 text-right text-xs font-mono text-muted-foreground">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
