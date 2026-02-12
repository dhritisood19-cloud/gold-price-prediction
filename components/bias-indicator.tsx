"use client";

import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import type { BiasSignal } from "@/lib/types";

interface BiasIndicatorProps {
  signal: BiasSignal;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const containerStyles = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export default function BiasIndicator({ signal, size = "md" }: BiasIndicatorProps) {
  const iconSize = sizeStyles[size];
  const container = containerStyles[size];

  if (signal === 1) {
    return (
      <div className={`flex ${container} shrink-0 items-center justify-center rounded-full bg-positive/15`}>
        <ArrowUp className={`${iconSize} text-positive`} />
      </div>
    );
  }

  if (signal === -1) {
    return (
      <div className={`flex ${container} shrink-0 items-center justify-center rounded-full bg-negative/15`}>
        <ArrowDown className={`${iconSize} text-negative`} />
      </div>
    );
  }

  return (
    <div className={`flex ${container} shrink-0 items-center justify-center rounded-full bg-muted`}>
      <ArrowRight className={`${iconSize} text-muted-foreground`} />
    </div>
  );
}
