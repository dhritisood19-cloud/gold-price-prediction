import type { RiskEvent } from "./types";

/** Generate ~12 risk events relative to the last data point date */
export function generateRiskEvents(lastDateStr: string): RiskEvent[] {
  const base = new Date(lastDateStr);

  const offsets: {
    days: number;
    title: string;
    category: string;
    impact: "high" | "medium" | "low";
    description: string;
  }[] = [
    { days: 2, title: "US CPI Release", category: "Economic", impact: "high", description: "Consumer Price Index data — key inflation gauge for Fed policy" },
    { days: 5, title: "Fed FOMC Minutes", category: "Monetary", impact: "high", description: "Federal Reserve meeting minutes may signal rate path changes" },
    { days: 7, title: "US Retail Sales", category: "Economic", impact: "medium", description: "Monthly consumer spending report impacts growth outlook" },
    { days: 10, title: "RBI Policy Decision", category: "Monetary", impact: "high", description: "Reserve Bank of India rate decision affects INR gold prices" },
    { days: 12, title: "China PMI Data", category: "Economic", impact: "medium", description: "Manufacturing activity in world's largest gold consumer" },
    { days: 14, title: "US PPI Release", category: "Economic", impact: "medium", description: "Producer Price Index — upstream inflation indicator" },
    { days: 18, title: "ECB Rate Decision", category: "Monetary", impact: "high", description: "European Central Bank rate decision affects EUR/USD and gold" },
    { days: 21, title: "US GDP (Q4)", category: "Economic", impact: "high", description: "Quarterly GDP growth — broad economic health indicator" },
    { days: 25, title: "BoJ Policy Meeting", category: "Monetary", impact: "medium", description: "Bank of Japan policy — yen carry trade impact on gold" },
    { days: 28, title: "US PCE Inflation", category: "Economic", impact: "high", description: "Fed's preferred inflation measure — critical for rate expectations" },
    { days: 30, title: "India Gold Import Data", category: "Supply", impact: "low", description: "Monthly physical gold import figures from India" },
    { days: 35, title: "OPEC+ Meeting", category: "Geopolitical", impact: "medium", description: "Oil supply decisions indirectly affect inflation and gold demand" },
  ];

  return offsets.map(({ days, ...rest }) => {
    const date = new Date(base);
    date.setDate(base.getDate() + days);
    return {
      date: date.toISOString().split("T")[0],
      ...rest,
    };
  });
}
