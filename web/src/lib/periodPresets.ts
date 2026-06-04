import {
  endOfMonth,
  endOfQuarter,
  format,
  startOfMonth,
  startOfQuarter,
  subMonths,
} from "date-fns";
import { SEED_DATA_YEAR } from "./chartData.js";
import type { PeriodQuery } from "../types.js";

export type PeriodPreset =
  | "rolling12"
  | "monthly"
  | "quarterly"
  | "annual"
  | "custom";

/** Matches the base app default: last 12 calendar months ending this month. */
export function defaultReportingPeriod(): PeriodQuery {
  const end = startOfMonth(new Date());
  const start = subMonths(end, 11);
  return {
    periodStart: format(start, "yyyy-MM-dd"),
    periodEnd: format(end, "yyyy-MM-dd"),
  };
}

export function periodFromPreset(preset: PeriodPreset): PeriodQuery {
  switch (preset) {
    case "rolling12":
      return defaultReportingPeriod();
    case "monthly": {
      const start = startOfMonth(new Date(Date.UTC(SEED_DATA_YEAR, 7, 1)));
      const end = endOfMonth(new Date(Date.UTC(SEED_DATA_YEAR, 7, 1)));
      return {
        periodStart: format(start, "yyyy-MM-dd"),
        periodEnd: format(end, "yyyy-MM-dd"),
      };
    }
    case "quarterly": {
      const start = startOfQuarter(new Date(Date.UTC(SEED_DATA_YEAR, 6, 1)));
      const end = endOfQuarter(new Date(Date.UTC(SEED_DATA_YEAR, 6, 1)));
      return {
        periodStart: format(start, "yyyy-MM-dd"),
        periodEnd: format(end, "yyyy-MM-dd"),
      };
    }
    case "annual":
    default: {
      return {
        periodStart: `${SEED_DATA_YEAR}-01-01`,
        periodEnd: `${SEED_DATA_YEAR}-12-31`,
      };
    }
  }
}

export function formatPeriodBadge(period: PeriodQuery): string {
  const start = parsePeriodDate(period.periodStart);
  const end = parsePeriodDate(period.periodEnd);
  if (!start || !end) {
    return "—";
  }

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  if (start.getUTCMonth() === end.getUTCMonth() && sameYear) {
    return format(start, "MMMM yyyy");
  }
  if (sameYear) {
    return `${format(start, "MMMM")} – ${format(end, "MMMM")}`;
  }
  return `${format(start, "MMM yyyy")} – ${format(end, "MMM yyyy")}`;
}

function parsePeriodDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
