import { format, parseISO } from "date-fns";
import type { EsgEntry } from "../types.js";

/** Matches api/prisma/seed.ts coverage. */
export const SEED_DATA_YEAR = 2025;

export type ChartPoint = {
  label: string;
  value: number;
};

export function aggregateEntriesByPeriod(entries: EsgEntry[]): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const entry of entries) {
    const key = entry.periodStart.slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + entry.value);
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodStart, value]) => ({
      label: format(parseISO(periodStart), "MMM yyyy"),
      value,
    }));
}

export function mergeStackedSeries(
  series: Array<{ seriesLabel: string; points: ChartPoint[] }>,
): Array<Record<string, string | number>> {
  const byMonth = new Map<string, Record<string, string | number>>();

  for (const { seriesLabel, points } of series) {
    for (const point of points) {
      const row = byMonth.get(point.label) ?? { month: point.label };
      row[seriesLabel] = (Number(row[seriesLabel]) || 0) + point.value;
      byMonth.set(point.label, row);
    }
  }

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return [...byMonth.values()].sort((a, b) => {
    const parse = (label: string) => {
      const [mon, year] = label.split(" ");
      return Number(year) * 12 + monthOrder.indexOf(mon);
    };
    return parse(String(a.month)) - parse(String(b.month));
  });
}

export function formatChartAxisValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return value.toLocaleString();
}

/** Sum trend API points by calendar month (matches base app chart behaviour). */
export function trendSeriesToChartPoints(
  series: Array<{ periodStart: string; value: number }>,
): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const point of series) {
    const monthKey = point.periodStart.slice(0, 7);
    totals.set(monthKey, (totals.get(monthKey) ?? 0) + point.value);
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, value]) => ({
      label: format(parseISO(`${monthKey}-01`), "MMM yyyy"),
      value,
    }));
}
