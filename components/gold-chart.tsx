"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { PricePoint, PredictionPoint } from "@/lib/mock-data";

interface GoldChartProps {
  historicalData: PricePoint[];
  predictions: PredictionPoint[];
}

interface ChartDataPoint {
  date: string;
  price?: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
  confidenceRange?: [number, number];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const priceEntry = payload.find((p) => p.dataKey === "price");
  const predictedEntry = payload.find((p) => p.dataKey === "predicted");
  const confidenceEntry = payload.find((p) => p.dataKey === "confidenceRange");

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {priceEntry && (
        <p className="font-semibold text-gold-dark">
          Price: ${priceEntry.value.toFixed(2)}
        </p>
      )}
      {predictedEntry && (
        <p className="font-semibold text-gold">
          Predicted: ${predictedEntry.value.toFixed(2)}
        </p>
      )}
      {confidenceEntry && Array.isArray(confidenceEntry.value) && (
        <p className="text-xs text-muted-foreground">
          Range: ${confidenceEntry.value[0].toFixed(2)} - $
          {confidenceEntry.value[1].toFixed(2)}
        </p>
      )}
    </div>
  );
}

export default function GoldChart({
  historicalData,
  predictions,
}: GoldChartProps) {
  // Build unified chart data
  const lastHistorical = historicalData[historicalData.length - 1];
  const todayDate = lastHistorical.date;

  const chartData: ChartDataPoint[] = [
    ...historicalData.map((d) => ({
      date: d.date,
      price: d.price,
    })),
    // Bridge point: last historical price also starts predictions
    {
      date: todayDate,
      price: lastHistorical.price,
      predicted: lastHistorical.price,
      upperBound: lastHistorical.price,
      lowerBound: lastHistorical.price,
      confidenceRange: [lastHistorical.price, lastHistorical.price] as [number, number],
    },
    ...predictions.map((d) => ({
      date: d.date,
      predicted: d.predicted,
      upperBound: d.upperBound,
      lowerBound: d.lowerBound,
      confidenceRange: [d.lowerBound, d.upperBound] as [number, number],
    })),
  ];

  // Remove duplicate bridge point if dates match
  const seen = new Set<string>();
  const deduped = chartData.filter((d) => {
    if (seen.has(d.date) && d.date !== todayDate) return false;
    seen.add(d.date);
    return true;
  });

  // Format date for axis
  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Calculate tick interval based on data length
  const tickInterval = Math.max(1, Math.floor(deduped.length / 8));

  return (
    <div className="w-full">
      <div className="h-[280px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={deduped}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--gold)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              interval={tickInterval}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={todayDate}
              stroke="var(--gold)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Today",
                position: "top",
                fill: "var(--gold)",
                fontSize: 11,
              }}
            />
            {/* Confidence interval band */}
            <Area
              type="monotone"
              dataKey="confidenceRange"
              fill="var(--gold)"
              fillOpacity={0.1}
              stroke="none"
            />
            {/* Historical price area */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--gold-dark)"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={false}
              connectNulls={false}
            />
            {/* Prediction line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--gold)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
