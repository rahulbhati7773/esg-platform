import { prisma } from "../db.js";

export type PeriodRange = {
  periodStart: Date;
  periodEnd: Date;
  facilityId?: number;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export type KpiSummaryItem = {
  metric: string;
  unit: string;
  total: number;
  previousTotal: number;
  delta: number;
  deltaPercent: number | null;
};

export type TrendPoint = {
  periodStart: Date;
  value: number;
};

export type FacilityComparisonItem = {
  facility: string;
  value: number;
};

export type RagStatus = "green" | "amber" | "red";

export type TargetStatusItem = {
  metric: string;
  facility: string | null;
  actual: number;
  target: number;
  rag: RagStatus;
};

export type DataQualitySummary = {
  countsByStatus: Record<string, number>;
  missing: Array<{
    facilityId: number;
    facility: string;
    metricId: number;
    metric: string;
  }>;
};

const KPI_METRIC_NAMES = ["emissions", "energy", "water", "waste"] as const;

function previousPeriod(period: PeriodRange): PeriodRange {
  const durationMs =
    period.periodEnd.getTime() - period.periodStart.getTime();
  const previousEnd = new Date(period.periodStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return {
    periodStart: previousStart,
    periodEnd: previousEnd,
  };
}

function entriesInPeriodWhere(period: PeriodRange) {
  return {
    periodStart: { lte: period.periodEnd },
    periodEnd: { gte: period.periodStart },
    ...(period.facilityId !== undefined
      ? { facilityId: period.facilityId }
      : {}),
  };
}

function sumEntryValues(
  entries: Array<{ value: number }>,
): number {
  return entries.reduce((total, entry) => total + entry.value, 0);
}

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
}

function ragForActual(actual: number, target: number): RagStatus {
  if (actual <= target) {
    return "green";
  }
  if (actual <= target * 1.1) {
    return "amber";
  }
  return "red";
}

export async function kpiSummary(period: PeriodRange): Promise<KpiSummaryItem[]> {
  const previous = previousPeriod(period);
  const metrics = await prisma.metric.findMany({
    where: {
      OR: KPI_METRIC_NAMES.map((name) => ({
        name: { contains: name },
      })),
    },
  });

  const summaries: KpiSummaryItem[] = [];

  for (const metric of metrics) {
    const [currentEntries, previousEntries] = await Promise.all([
      prisma.esgEntry.findMany({
        where: {
          metricId: metric.id,
          ...entriesInPeriodWhere(period),
        },
      }),
      prisma.esgEntry.findMany({
        where: {
          metricId: metric.id,
          ...entriesInPeriodWhere(previous),
        },
      }),
    ]);

    const total = sumEntryValues(currentEntries);
    const previousTotal = sumEntryValues(previousEntries);

    summaries.push({
      metric: metric.name,
      unit: metric.unit,
      total,
      previousTotal,
      delta: total - previousTotal,
      deltaPercent: deltaPercent(total, previousTotal),
    });
  }

  return summaries.sort((a, b) => a.metric.localeCompare(b.metric));
}

export async function trend(
  metricId: number,
  range: DateRange,
): Promise<TrendPoint[]> {
  const entries = await prisma.esgEntry.findMany({
    where: {
      metricId,
      periodStart: { gte: range.start, lte: range.end },
    },
    orderBy: { periodStart: "asc" },
    select: {
      periodStart: true,
      value: true,
    },
  });

  return entries.map((entry) => ({
    periodStart: entry.periodStart,
    value: entry.value,
  }));
}

export async function facilityComparison(
  metricId: number,
  period: PeriodRange,
): Promise<FacilityComparisonItem[]> {
  const entries = await prisma.esgEntry.findMany({
    where: {
      metricId,
      ...entriesInPeriodWhere(period),
    },
    include: {
      facility: {
        select: { name: true },
      },
    },
  });

  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(
      entry.facility.name,
      (totals.get(entry.facility.name) ?? 0) + entry.value,
    );
  }

  return [...totals.entries()]
    .map(([facility, value]) => ({ facility, value }))
    .sort((a, b) => a.facility.localeCompare(b.facility));
}

export async function targetStatus(
  period: PeriodRange,
): Promise<TargetStatusItem[]> {
  const targets = await prisma.target.findMany({
    where:
      period.facilityId !== undefined
        ? {
            OR: [
              { facilityId: period.facilityId },
              { facilityId: null },
            ],
          }
        : undefined,
    include: {
      metric: { select: { name: true } },
      facility: { select: { name: true } },
    },
  });

  const results: TargetStatusItem[] = [];

  for (const target of targets) {
    const entries = await prisma.esgEntry.findMany({
      where: {
        metricId: target.metricId,
        ...(target.facilityId !== null
          ? { facilityId: target.facilityId }
          : period.facilityId !== undefined
            ? { facilityId: period.facilityId }
            : {}),
        ...entriesInPeriodWhere(period),
      },
    });

    const actual = sumEntryValues(entries);

    results.push({
      metric: target.metric.name,
      facility: target.facility?.name ?? null,
      actual,
      target: target.targetValue,
      rag: ragForActual(actual, target.targetValue),
    });
  }

  return results.sort((a, b) =>
    `${a.metric}:${a.facility ?? "all"}`.localeCompare(
      `${b.metric}:${b.facility ?? "all"}`,
    ),
  );
}

export async function dataQuality(
  period: PeriodRange,
): Promise<DataQualitySummary> {
  const entries = await prisma.esgEntry.findMany({
    where: entriesInPeriodWhere(period),
    select: {
      status: true,
      facilityId: true,
      metricId: true,
    },
  });

  const countsByStatus: Record<string, number> = {};
  const present = new Set<string>();

  for (const entry of entries) {
    countsByStatus[entry.status] = (countsByStatus[entry.status] ?? 0) + 1;
    present.add(`${entry.facilityId}:${entry.metricId}`);
  }

  const [facilities, metrics] = await Promise.all([
    prisma.facility.findMany({
      where:
        period.facilityId !== undefined
          ? { id: period.facilityId }
          : undefined,
      select: { id: true, name: true },
    }),
    prisma.metric.findMany({ select: { id: true, name: true } }),
  ]);

  const missing: DataQualitySummary["missing"] = [];
  for (const facility of facilities) {
    for (const metric of metrics) {
      const key = `${facility.id}:${metric.id}`;
      if (!present.has(key)) {
        missing.push({
          facilityId: facility.id,
          facility: facility.name,
          metricId: metric.id,
          metric: metric.name,
        });
      }
    }
  }

  return {
    countsByStatus,
    missing: missing.sort((a, b) =>
      `${a.facility}:${a.metric}`.localeCompare(`${b.facility}:${b.metric}`),
    ),
  };
}
