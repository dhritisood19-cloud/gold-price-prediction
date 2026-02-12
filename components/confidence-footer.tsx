"use client";

interface ConfidenceFooterProps {
  confidence: number;
  lastUpdated: Date;
}

export default function ConfidenceFooter({
  confidence,
  lastUpdated,
}: ConfidenceFooterProps) {
  const timeStr = lastUpdated.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mt-8 mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* Confidence bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Model Confidence
        </span>
        <div className="flex-1 h-2.5 rounded-full bg-muted">
          <div
            className="h-2.5 rounded-full transition-all"
            style={{
              width: `${confidence}%`,
              backgroundColor:
                confidence >= 70
                  ? "var(--positive)"
                  : confidence >= 50
                  ? "var(--warning)"
                  : "var(--negative)",
            }}
          />
        </div>
        <span className="text-sm font-bold w-10 text-right">{confidence}%</span>
      </div>

      {/* Timestamp + disclaimer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>Last updated: {timeStr} &middot; Auto-refreshes every 5 min</span>
        <span>
          Simulated data for educational purposes only. Not financial advice.
        </span>
      </div>
    </div>
  );
}
