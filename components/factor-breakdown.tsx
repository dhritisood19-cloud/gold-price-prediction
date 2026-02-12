"use client";

import FactorCategoryCard from "./factor-category";
import type { FactorCategory, TimeHorizon } from "@/lib/types";

interface FactorBreakdownProps {
  categories: FactorCategory[];
  timeHorizon: TimeHorizon;
}

export default function FactorBreakdown({ categories, timeHorizon }: FactorBreakdownProps) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold">Factor Analysis</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <FactorCategoryCard key={cat.id} category={cat} timeHorizon={timeHorizon} />
        ))}
      </div>
    </div>
  );
}
