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

/** Redistribute other category weights to keep total at 100 when one changes. */
function redistributeWeights(
  changedId: keyof CategoryWeights,
  newValue: number,
  currentWeights: CategoryWeights
): CategoryWeights {
  const diff = newValue - currentWeights[changedId];
  if (diff === 0) return { ...currentWeights, [changedId]: newValue };

  const otherIds = CATEGORY_LABELS.map((c) => c.id).filter((cid) => cid !== changedId);
  const otherTotal = otherIds.reduce((sum, cid) => sum + currentWeights[cid], 0);
  const updated = { ...currentWeights, [changedId]: newValue };

  if (otherTotal > 0) {
    const remaining = -diff;
    for (const cid of otherIds) {
      const proportion = currentWeights[cid] / otherTotal;
      const adjustment = Math.round(remaining * proportion * 10) / 10;
      updated[cid] = Math.max(0, Math.round((currentWeights[cid] + adjustment) * 10) / 10);
    }
    const newTotal = Object.values(updated).reduce((sum, w) => sum + w, 0);
    const roundingError = Math.round((100 - newTotal) * 10) / 10;
    if (Math.abs(roundingError) > 0.01) {
      const largest = otherIds.reduce((a, b) => (updated[a] >= updated[b] ? a : b));
      updated[largest] = Math.round((updated[largest] + roundingError) * 10) / 10;
    }
  }

  return updated;
}

/** Scale subfactors within a category so they sum to the new category weight. */
function scaleSubFactors(
  categoryId: string,
  newCategoryWeight: number,
  currentSfWeights: Record<string, Record<string, number>>,
  sfDefaults: Record<string, Record<string, number>>
): Record<string, Record<string, number>> {
  const sfWeights = currentSfWeights[categoryId] || {};
  const catDefaults = sfDefaults[categoryId] || {};
  const sfNames = Object.keys(catDefaults);

  const currentSum = sfNames.reduce(
    (sum, name) => sum + (sfWeights[name] ?? catDefaults[name]),
    0
  );

  const updatedSF = { ...currentSfWeights };

  if (currentSum > 0 && newCategoryWeight > 0) {
    const scale = newCategoryWeight / currentSum;
    const newSfWeights: Record<string, number> = {};

    for (const name of sfNames) {
      const currentVal = sfWeights[name] ?? catDefaults[name];
      newSfWeights[name] = Math.max(0, Math.min(20, Math.round(currentVal * scale * 2) / 2));
    }

    // Fix rounding error by adjusting the largest subfactor
    const scaledSum = Object.values(newSfWeights).reduce((s, v) => s + v, 0);
    const sfError = Math.round((newCategoryWeight - scaledSum) * 2) / 2;
    if (Math.abs(sfError) >= 0.5) {
      const largestSf = sfNames.reduce((a, b) =>
        newSfWeights[a] >= newSfWeights[b] ? a : b
      );
      newSfWeights[largestSf] = Math.max(
        0,
        Math.min(20, newSfWeights[largestSf] + sfError)
      );
    }

    updatedSF[categoryId] = newSfWeights;
  } else if (newCategoryWeight === 0) {
    const newSfWeights: Record<string, number> = {};
    for (const name of sfNames) {
      newSfWeights[name] = 0;
    }
    updatedSF[categoryId] = newSfWeights;
  }

  return updatedSF;
}

/** Compute the sum of subfactor weights for a category. */
function subFactorSum(
  categoryId: string,
  sfWeights: Record<string, Record<string, number>>,
  sfDefaults: Record<string, Record<string, number>>
): number {
  const catDefaults = sfDefaults[categoryId] || {};
  const catWeights = sfWeights[categoryId] || {};
  return Object.keys(catDefaults).reduce(
    (sum, name) => sum + (catWeights[name] ?? catDefaults[name]),
    0
  );
}

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
    if (newValue === weights[id]) return;

    // 1. Redistribute other category weights to keep total at 100
    const updated = redistributeWeights(id, newValue, weights);
    onChange(updated);

    // 2. Scale this category's subfactors proportionally to match new weight
    const updatedSF = scaleSubFactors(
      id,
      newValue,
      subFactorWeights,
      defaultSubFactorWeights
    );
    onSubFactorWeightsChange(updatedSF);
  }

  function handleSubFactorChange(categoryId: string, name: string, value: number) {
    // 1. Update the individual subfactor weight
    const updatedSF = { ...subFactorWeights };
    updatedSF[categoryId] = { ...updatedSF[categoryId], [name]: value };
    onSubFactorWeightsChange(updatedSF);

    // 2. Category weight = sum of its subfactors
    const newCatWeight = Math.round(
      subFactorSum(categoryId, updatedSF, defaultSubFactorWeights) * 10
    ) / 10;

    const catId = categoryId as keyof CategoryWeights;
    if (Math.abs(newCatWeight - weights[catId]) >= 0.1) {
      // Redistribute other categories to keep total at 100
      const updated = redistributeWeights(catId, newCatWeight, weights);
      onChange(updated);
    }
  }

  function handleResetCategory(id: string) {
    const catId = id as keyof CategoryWeights;
    const defaultWeight = defaults[catId];

    // Reset category weight and redistribute others
    const updated = redistributeWeights(catId, defaultWeight, weights);
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
          const sfSum = sfNames.reduce(
            (sum, name) => sum + (sfWeights[name] ?? sfDefaults[name]),
            0
          );

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
                  <div className="flex items-center justify-between mb-2 pl-7">
                    <p className="text-[10px] text-muted-foreground">
                      Sub-factor weights (sum = category weight)
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Sum: {Math.round(sfSum * 10) / 10}
                    </span>
                  </div>
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
