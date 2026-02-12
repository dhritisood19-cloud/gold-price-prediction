"use client";

import type { TimeHorizon } from "@/lib/types";

interface TimeHorizonSelectorProps {
  selected: TimeHorizon;
  onChange: (horizon: TimeHorizon) => void;
}

const HORIZONS: { value: TimeHorizon; label: string; sub: string }[] = [
  { value: "intraday", label: "Intraday", sub: "Today" },
  { value: "swing", label: "Swing", sub: "2-6 Weeks" },
  { value: "longterm", label: "Long-term", sub: "3M+" },
];

export default function TimeHorizonSelector({ selected, onChange }: TimeHorizonSelectorProps) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold">Time Horizon</h2>
      <div className="flex gap-2">
        {HORIZONS.map((h) => (
          <button
            key={h.value}
            onClick={() => onChange(h.value)}
            className={`flex flex-col items-center rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
              selected === h.value
                ? "bg-gold text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            <span>{h.label}</span>
            <span className={`text-[10px] ${selected === h.value ? "text-white/70" : "text-muted-foreground"}`}>
              {h.sub}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
