import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFacilityComparison } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { formatChartAxisValue } from "../../lib/chartData.js";
import { fadeIn } from "../../lib/motion.js";
import { FormSelect } from "../ui/FormSelect.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { Metric } from "../../types.js";

type FacilityComparisonPanelProps = {
  metrics: Metric[];
};

export function FacilityComparisonPanel({
  metrics,
}: FacilityComparisonPanelProps) {
  const { period, facilityId } = usePlatformFilters();
  const [metricId, setMetricId] = useState("");
  const [comparison, setComparison] = useState<
    Array<{ facility: string; value: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    void getFacilityComparison(Number(metricId), period, facilityId)
      .then((data) => {
        if (!cancelled) {
          setComparison(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load facility comparison.");
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
  }, [metricId, period, facilityId]);

  const selectedMetric = metrics.find((m) => String(m.id) === metricId);

  return (
    <motion.div {...fadeIn}>
      <PanelCard className="chart-themed p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Building2 className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">
                Facility comparison
              </h2>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                Compare sites for the selected metric
              </p>
            </div>
          </div>
          <div className="w-full min-w-[220px] sm:w-64">
            <FormSelect
              value={metricId}
              onValueChange={setMetricId}
              placeholder="Select metric…"
              aria-label="Comparison metric"
              options={metricOptions}
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <Skeleton className="mt-6 h-[280px] w-full rounded-xl" />
        ) : comparison.length === 0 ? (
          <p className="mt-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No facility data for this metric and period.
          </p>
        ) : (
          <div className="mt-6 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparison}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  vertical
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  tickFormatter={formatChartAxisValue}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="facility"
                  width={100}
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
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
                <Bar
                  dataKey="value"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </PanelCard>
    </motion.div>
  );
}
