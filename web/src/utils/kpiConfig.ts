import type { DeltaType } from "@tremor/react";
import type { KpiSummaryItem } from "../types.js";

export const KPI_KEYS = [
  "emissions",
  "energy",
  "water",
  "waste",
] as const;

export type KpiKey = (typeof KPI_KEYS)[number];

export type KpiDisplayConfig = {
  key: KpiKey;
  label: string;
  /** When true, a decrease vs prior period is favourable (green). */
  lowerIsBetter: boolean;
};

export const KPI_DISPLAY: Record<KpiKey, KpiDisplayConfig> = {
  emissions: { key: "emissions", label: "Total emissions", lowerIsBetter: true },
  energy: { key: "energy", label: "Energy", lowerIsBetter: true },
  water: { key: "water", label: "Water", lowerIsBetter: true },
  waste: { key: "waste", label: "Waste", lowerIsBetter: true },
};

export function matchKpiItem(
  kpis: KpiSummaryItem[],
  key: KpiKey,
): KpiSummaryItem | undefined {
  if (key === "waste") {
    return kpis.find((item) =>
      item.metric.toLowerCase().includes("waste generated"),
    );
  }
  return kpis.find((item) => item.metric.toLowerCase().includes(key));
}

export function formatKpiValue(value: number, unit: string): string {
  const formatted = Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return `${formatted} ${unit}`;
}

export function formatDeltaPercent(deltaPercent: number | null): string {
  if (deltaPercent === null) {
    return "N/A";
  }
  const sign = deltaPercent > 0 ? "+" : "";
  return `${sign}${deltaPercent.toFixed(1)}%`;
}

export function deltaTypeForChange(
  delta: number,
  deltaPercent: number | null,
): DeltaType {
  if (delta === 0) {
    return "unchanged";
  }
  const magnitude = Math.abs(deltaPercent ?? delta);
  if (delta > 0) {
    return magnitude >= 10 ? "increase" : "moderateIncrease";
  }
  return magnitude >= 10 ? "decrease" : "moderateDecrease";
}

/** Tremor BadgeDelta: isIncreasePositive=false → decreases show green. */
export function isIncreasePositiveForKpi(key: KpiKey): boolean {
  return !KPI_DISPLAY[key].lowerIsBetter;
}
