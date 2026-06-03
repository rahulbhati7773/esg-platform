import { format } from "date-fns";
import { motion } from "framer-motion";
import { BarChart3, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getTrend } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import {
  trendSeriesToChartPoints,
  type ChartPoint,
} from "../../lib/chartData.js";
import { formatPeriodBadge } from "../../lib/periodPresets.js";
import { fadeIn } from "../../lib/motion.js";
import type { Metric } from "../../types.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import { EnvPerformanceAreaChart } from "./EnvPerformanceAreaChart.js";

const CHART_COLORS = {
  light: { stroke: "#2d9c72", fill: "#2d9c72" },
  dark: { stroke: "#3ecf8e", fill: "#3ecf8e" },
} as const;

type EnvironmentalPerformanceProps = {
  metrics: Metric[];
};

function findEmissionsMetric(metrics: Metric[]): Metric | undefined {
  return metrics.find(
    (metric) =>
      metric.name.toLowerCase().includes("co2e") ||
      metric.name.toLowerCase().includes("emission"),
  );
}

export function EnvironmentalPerformance({ metrics }: EnvironmentalPerformanceProps) {
  const { period, facilityId } = usePlatformFilters();
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const emissionsMetric = useMemo(
    () => findEmissionsMetric(metrics),
    [metrics],
  );

  useEffect(() => {
    if (!emissionsMetric) {
      setChartData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getTrend(emissionsMetric.id, {
      start: period.periodStart,
      end: period.periodEnd,
    })
      .then((series) => {
        if (!cancelled) {
          setChartData(trendSeriesToChartPoints(series));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load emissions trend.");
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
  }, [emissionsMetric, period, facilityId]);

  const periodLabel = useMemo(() => formatPeriodBadge(period), [period]);
  const colors = CHART_COLORS[theme];

  return (
    <motion.div {...fadeIn}>
      <PanelCard className="chart-themed p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <BarChart3 className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">
                Environmental performance
              </h2>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                {emissionsMetric
                  ? `${emissionsMetric.name} (${emissionsMetric.unit}) from ESG entries`
                  : "CO2e emissions from seeded ESG entries"}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)]">
            <Calendar className="h-4 w-4 shrink-0" aria-hidden />
            {periodLabel}
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <Skeleton className="mt-6 h-[320px] w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <p className="mt-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No emissions entries for {format(new Date(period.periodStart), "yyyy-MM-dd")} –{" "}
            {format(new Date(period.periodEnd), "yyyy-MM-dd")}.
          </p>
        ) : (
          <EnvPerformanceAreaChart
            data={chartData}
            strokeColor={colors.stroke}
            fillColorTop={colors.fill}
            unit={emissionsMetric?.unit ?? "tonnes"}
          />
        )}
      </PanelCard>
    </motion.div>
  );
}
