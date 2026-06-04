import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTrend } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import {
  formatChartAxisValue,
  trendSeriesToChartPoints,
} from "../../lib/chartData.js";
import { fadeIn } from "../../lib/motion.js";
import { FormSelect } from "../ui/FormSelect.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { Metric } from "../../types.js";

type MetricTrendPanelProps = {
  metrics: Metric[];
};

export function MetricTrendPanel({ metrics }: MetricTrendPanelProps) {
  const { period, facilityId } = usePlatformFilters();
  const [metricId, setMetricId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<
    Array<{ label: string; value: number }>
  >([]);

  const metricOptions = useMemo(
    () =>
      metrics.map((metric) => ({
        value: String(metric.id),
        label: `${metric.name} (${metric.unit})`,
      })),
    [metrics],
  );

  useEffect(() => {
    if (metrics.length === 0) {
      return;
    }
    if (!metricId) {
      const emissions = metrics.find((m) =>
        m.name.toLowerCase().includes("emission"),
      );
      setMetricId(String(emissions?.id ?? metrics[0].id));
    }
  }, [metrics, metricId]);

  useEffect(() => {
    if (!metricId) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getTrend(Number(metricId), {
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
          setError("Could not load trend data.");
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
  }, [metricId, period.periodStart, period.periodEnd, facilityId]);

  const selectedMetric = metrics.find((m) => String(m.id) === metricId);

  return (
    <motion.div {...fadeIn}>
      <PanelCard className="chart-themed p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Trend</h2>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                Monthly totals for a selected metric
              </p>
            </div>
          </div>
          <div className="w-full min-w-[220px] sm:w-64">
            <FormSelect
              value={metricId}
              onValueChange={setMetricId}
              placeholder="Select metric…"
              aria-label="Trend metric"
              options={metricOptions}
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <Skeleton className="mt-6 h-[280px] w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <p className="mt-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No trend data for this period.
          </p>
        ) : (
          <div className="mt-6 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  horizontal
                  vertical={false}
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={52}
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
                  formatter={(value: number) => [
                    `${value.toLocaleString()} ${selectedMetric?.unit ?? ""}`.trim(),
                    selectedMetric?.name ?? "Value",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </PanelCard>
    </motion.div>
  );
}
