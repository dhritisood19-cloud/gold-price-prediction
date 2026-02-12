"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import type { PricePoint, TechnicalIndicators } from "@/lib/types";

interface GoldChartProps {
  historicalData: PricePoint[];
  technicalIndicators?: TechnicalIndicators;
  maStartIndex?: number;
}

interface ChartDataPoint {
  date: string;
  price?: number;
  ma5?: number | null;
  ma20?: number | null;
  ma50?: number | null;
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
  const ma5Entry = payload.find((p) => p.dataKey === "ma5");
  const ma20Entry = payload.find((p) => p.dataKey === "ma20");
  const ma50Entry = payload.find((p) => p.dataKey === "ma50");

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {priceEntry && (
        <p className="font-semibold text-gold-dark">
          Price: ${priceEntry.value.toFixed(2)}
        </p>
      )}
      {ma5Entry && ma5Entry.value != null && (
        <p className="text-xs" style={{ color: "#ef4444" }}>MA5: ${ma5Entry.value.toFixed(2)}</p>
      )}
      {ma20Entry && ma20Entry.value != null && (
        <p className="text-xs" style={{ color: "#3b82f6" }}>MA20: ${ma20Entry.value.toFixed(2)}</p>
      )}
      {ma50Entry && ma50Entry.value != null && (
        <p className="text-xs" style={{ color: "#8b5cf6" }}>MA50: ${ma50Entry.value.toFixed(2)}</p>
      )}
    </div>
  );
}

interface TogglePillProps {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}

function TogglePill({ label, active, color, onClick }: TogglePillProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
        active
          ? "text-white shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-border"
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  );
}

export default function GoldChart({
  historicalData,
  technicalIndicators,
  maStartIndex = 0,
}: GoldChartProps) {
  const [showMA5, setShowMA5] = useState(false);
  const [showMA20, setShowMA20] = useState(false);
  const [showMA50, setShowMA50] = useState(false);
  const [showSR, setShowSR] = useState(false);

  const lastHistorical = historicalData[historicalData.length - 1];

  const chartData: ChartDataPoint[] = historicalData.map((d, i) => {
    const fullIndex = maStartIndex + i;
    return {
      date: d.date,
      price: d.price,
      ma5: technicalIndicators?.ma5[fullIndex] ?? undefined,
      ma20: technicalIndicators?.ma20[fullIndex] ?? undefined,
      ma50: technicalIndicators?.ma50[fullIndex] ?? undefined,
    };
  });

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const tickInterval = Math.max(1, Math.floor(chartData.length / 8));

  return (
    <div className="w-full">
      <div className="h-[280px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
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

            {/* Support / Resistance lines */}
            {showSR && technicalIndicators && (
              <>
                <ReferenceLine
                  y={technicalIndicators.support}
                  stroke="var(--positive)"
                  strokeDasharray="6 3"
                  strokeWidth={1}
                  label={{
                    value: `Support $${technicalIndicators.support.toFixed(0)}`,
                    position: "left",
                    fill: "var(--positive)",
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={technicalIndicators.resistance}
                  stroke="var(--negative)"
                  strokeDasharray="6 3"
                  strokeWidth={1}
                  label={{
                    value: `Resistance $${technicalIndicators.resistance.toFixed(0)}`,
                    position: "left",
                    fill: "var(--negative)",
                    fontSize: 10,
                  }}
                />
              </>
            )}

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

            {/* Moving average lines */}
            {showMA5 && (
              <Line
                type="monotone"
                dataKey="ma5"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            )}
            {showMA20 && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            )}
            {showMA50 && (
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            )}

            {/* Current price dot */}
            <ReferenceDot
              x={lastHistorical.date}
              y={lastHistorical.price}
              r={5}
              fill="var(--gold)"
              stroke="var(--card)"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Toggle pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        <TogglePill label="MA5" active={showMA5} color="#ef4444" onClick={() => setShowMA5(!showMA5)} />
        <TogglePill label="MA20" active={showMA20} color="#3b82f6" onClick={() => setShowMA20(!showMA20)} />
        <TogglePill label="MA50" active={showMA50} color="#8b5cf6" onClick={() => setShowMA50(!showMA50)} />
        <TogglePill label="S/R" active={showSR} color="var(--gold-dark)" onClick={() => setShowSR(!showSR)} />
      </div>
    </div>
  );
}
