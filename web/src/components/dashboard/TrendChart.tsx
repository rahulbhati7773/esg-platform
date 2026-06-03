import { Card, LineChart, Text, Title } from "@tremor/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { getTrend } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { Metric, TrendPoint } from "../../types.js";

type TrendChartProps = {
  metrics: Metric[];
};

export function TrendChart({ metrics }: TrendChartProps) {
  const { period } = useDashboardPeriod();
  const [metricId, setMetricId] = useState<number>(0);
  const [rangeStart, setRangeStart] = useState(period.periodStart);
  const [rangeEnd, setRangeEnd] = useState(period.periodEnd);
  const [series, setSeries] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRangeStart(period.periodStart);
    setRangeEnd(period.periodEnd);
  }, [period.periodStart, period.periodEnd]);

  useEffect(() => {
    if (metrics.length > 0 && metricId === 0) {
      setMetricId(metrics[0].id);
    }
  }, [metrics, metricId]);

  useEffect(() => {
    if (!metricId || !rangeStart || !rangeEnd) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getTrend(metricId, { start: rangeStart, end: rangeEnd })
      .then((data) => {
        if (!cancelled) {
          setSeries(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load trend data");
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
  }, [metricId, rangeStart, rangeEnd]);

  const chartData = useMemo(
    () =>
      series.map((point) => ({
        date: format(new Date(point.periodStart), "MMM yyyy"),
        Value: point.value,
      })),
    [series],
  );

  const selectedMetric = metrics.find((metric) => metric.id === metricId);

  return (
    <Card>
      <Title>Trend</Title>
      <Text className="mt-1 text-gray-600">
        Metric values over the selected range.
      </Text>

      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Metric
          </label>
          <select
            value={metricId || ""}
            onChange={(event) => setMetricId(Number(event.target.value))}
            className="min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select metric…</option>
            {metrics.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.name} ({metric.unit})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Range start
          </label>
          <input
            type="date"
            value={rangeStart}
            onChange={(event) => setRangeStart(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Range end
          </label>
          <input
            type="date"
            value={rangeEnd}
            onChange={(event) => setRangeEnd(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <Text className="mt-3 text-sm text-red-600">{error}</Text>}

      <LineChart
        className="mt-6 h-72"
        data={chartData}
        index="date"
        categories={["Value"]}
        colors={["blue"]}
        yAxisWidth={56}
        showAnimation
        noDataText={loading ? "Loading…" : "No trend data for this range"}
      />

      {selectedMetric && (
        <Text className="mt-2 text-sm text-gray-500">
          Unit: {selectedMetric.unit}
        </Text>
      )}
    </Card>
  );
}
