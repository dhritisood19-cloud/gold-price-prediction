"use client";

import { Calendar, AlertTriangle, AlertCircle, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { RiskEvent, VolatilityPoint } from "@/lib/types";

interface RiskCalendarProps {
  events: RiskEvent[];
  volatilityHistory: VolatilityPoint[];
}

const impactConfig = {
  high: { icon: AlertTriangle, color: "text-negative", bg: "bg-negative/10", label: "High" },
  medium: { icon: AlertCircle, color: "text-warning", bg: "bg-warning-muted", label: "Med" },
  low: { icon: Info, color: "text-info", bg: "bg-info/10", label: "Low" },
};

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function VolTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-lg">
      <p className="mb-1 text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === "historical" ? "Historical" : "Implied"}: {p.value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

export default function RiskCalendar({
  events,
  volatilityHistory,
}: RiskCalendarProps) {
  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-semibold">Risk Calendar</h2>
      </div>

      {/* Event list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {sortedEvents.map((event) => {
          const cfg = impactConfig[event.impact];
          const ImpactIcon = cfg.icon;
          return (
            <div
              key={event.title}
              className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
            >
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${cfg.bg}`}>
                <ImpactIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{event.title}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{event.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatEventDate(event.date)} &middot; {event.category}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Volatility mini-chart */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Volatility (30-day)</p>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volatilityHistory} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                interval={6}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                stroke="var(--border)"
              />
              <YAxis
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                stroke="var(--border)"
                width={35}
              />
              <Tooltip content={<VolTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historical"
                stroke="var(--gold)"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="implied"
                name="Implied"
                stroke="var(--info)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
