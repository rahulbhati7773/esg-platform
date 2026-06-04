import { LineChart } from "@tremor/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { getTrend } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { cn } from "../../lib/cn.js";
import { ChartPanel } from "../ui/ChartPanel.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { Metric } from "../../types.js";

type EnvironmentalTrendsProps = {
  metrics: Metric[];
};

const SERIES_KEYS = ["emission", "energy", "water"] as const;

export function EnvironmentalTrends({ metrics }: EnvironmentalTrendsProps) {
  const { period } = usePlatformFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merged, setMerged] = useState<
    Array<Record<string, string | number>>
  >([]);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const seriesMetrics = useMemo(() => {
    return SERIES_KEYS.map((key) =>
      metrics.find((m) => m.name.toLowerCase().includes(key)),
    ).filter((m): m is Metric => m !== undefined);
  }, [metrics]);

  const categoryLabels = useMemo(
    () =>
      seriesMetrics.map((m) => m.name.replace(/\s+/g, " ").slice(0, 24)),
    [seriesMetrics],
  );

  const visibleCategories = categoryLabels.filter(
    (label) => !hiddenSeries.has(label),
  );

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
      seriesMetrics.map((metric) =>
        getTrend(metric.id, {
          start: period.periodStart,
          end: period.periodEnd,
        }).then((points) => ({ metric, points })),
      ),
    )
      .then((results) => {
        if (cancelled) {
          return;
        }

        const byDate = new Map<string, Record<string, string | number>>();

        for (const { metric, points } of results) {
          const label = metric.name.replace(/\s+/g, " ").slice(0, 24);
          for (const point of points) {
            const dateKey = format(new Date(point.periodStart), "MMM yyyy");
            const row = byDate.get(dateKey) ?? { date: dateKey };
            row[label] = point.value;
            byDate.set(dateKey, row);
          }
        }

        setMerged(
          [...byDate.values()].sort((a, b) =>
            String(a.date).localeCompare(String(b.date)),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load trend data for this period.");
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
  }, [period.periodStart, period.periodEnd, seriesMetrics]);

  const toggleSeries = (label: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else if (next.size < categoryLabels.length - 1) {
        next.add(label);
      }
      return next;
    });
  };

  const seriesControls =
    categoryLabels.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {categoryLabels.map((label, index) => {
          const active = !hiddenSeries.has(label);
          const colors = ["bg-teal-600", "bg-blue-600", "bg-sky-500"];
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleSeries(label)}
              className={cn(
                "chip",
                active && "chip-active",
                !active && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  colors[index % colors.length],
                  !active && "bg-slate-300",
                )}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <ChartPanel
      title="Environmental trends"
      description="Emissions, energy, and water over the reporting window."
      controls={seriesControls}
    >
      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && <Skeleton className="h-80 w-full" />}

      {!loading && visibleCategories.length > 0 && (
        <LineChart
          className="h-80"
          data={merged}
          index="date"
          categories={visibleCategories}
          colors={["teal", "blue", "sky"]}
          yAxisWidth={56}
          showAnimation
          showLegend={false}
          showTooltip
          curveType="monotone"
          noDataText="No trend data for this period"
        />
      )}

      {!loading && visibleCategories.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">
          Turn on at least one series to view the chart.
        </p>
      )}

      {!loading && seriesMetrics.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">
          No emission, energy, or water metrics found in the catalogue.
        </p>
      )}
    </ChartPanel>
  );
}
