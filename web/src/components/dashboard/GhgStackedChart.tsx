import { format } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listEntries } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import {
  aggregateEntriesByPeriod,
  formatChartAxisValue,
  mergeStackedSeries,
} from "../../lib/chartData.js";
import { cn } from "../../lib/cn.js";
import { fadeIn } from "../../lib/motion.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { Metric } from "../../types.js";

type GhgStackedChartProps = {
  metrics: Metric[];
};

const SERIES = [
  {
    key: "emission",
    label: "Emissions",
    color: "#0ea5e9",
    swatch: "bg-sky-400",
  },
  {
    key: "energy",
    label: "Energy",
    color: "#f97316",
    swatch: "bg-orange-400",
  },
  {
    key: "water",
    label: "Water",
    color: "#22c55e",
    swatch: "bg-green-400",
  },
] as const;

export function GhgStackedChart({ metrics }: GhgStackedChartProps) {
  const { period, facilityId } = usePlatformFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merged, setMerged] = useState<Array<Record<string, string | number>>>(
    [],
  );
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const seriesMetrics = useMemo(() => {
    return SERIES.map((series) => ({
      ...series,
      metric: metrics.find((metric) =>
        metric.name.toLowerCase().includes(series.key),
      ),
    })).filter(
      (series): series is typeof series & { metric: Metric } =>
        series.metric !== undefined,
    );
  }, [metrics]);

  const labels = seriesMetrics.map((series) => series.label);
  const visibleLabels = labels.filter((label) => !hidden.has(label));

  useEffect(() => {
    if (seriesMetrics.length === 0) {
      setMerged([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all(
      seriesMetrics.map(({ metric, label }) =>
        listEntries({
          metricId: metric.id,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          ...(facilityId !== undefined ? { facilityId } : {}),
        }).then((entries) => ({
          seriesLabel: label,
          points: aggregateEntriesByPeriod(entries),
        })),
      ),
    )
      .then((results) => {
        if (!cancelled) {
          setMerged(mergeStackedSeries(results));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load resource mix.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period.periodStart, period.periodEnd, facilityId, seriesMetrics]);

  const toggle = (label: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else if (next.size < labels.length - 1) {
        next.add(label);
      }
      return next;
    });
  };

  const periodLabel = `${format(new Date(period.periodStart), "d MMM yyyy")} – ${format(new Date(period.periodEnd), "d MMM yyyy")}`;

  return (
    <motion.div {...fadeIn}>
      <PanelCard className="chart-themed flex h-full flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              GHG & resource mix
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              CO2e, energy, and water entries ({periodLabel})
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          {seriesMetrics.map((series) => {
            const active = !hidden.has(series.label);
            return (
              <label
                key={series.label}
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--text-muted)]"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(series.label)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className={cn("h-2.5 w-2.5 rounded-sm", series.swatch)} />
                {series.label}
              </label>
            );
          })}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <Skeleton className="mt-4 h-[280px] flex-1 rounded-xl" />
        ) : visibleLabels.length > 0 && merged.length > 0 ? (
          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={merged} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  horizontal
                  vertical={false}
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={48}
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  tickFormatter={formatChartAxisValue}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--text)",
                  }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }}
                />
                {seriesMetrics
                  .filter((series) => !hidden.has(series.label))
                  .map((series) => (
                    <Bar
                      key={series.label}
                      dataKey={series.label}
                      stackId="resources"
                      fill={series.color}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-[var(--text-muted)]">
            No environmental entries for this period.
          </p>
        )}
      </PanelCard>
    </motion.div>
  );
}
