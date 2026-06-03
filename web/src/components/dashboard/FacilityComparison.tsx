import { BarChart, Card, Text, Title } from "@tremor/react";
import { useEffect, useMemo, useState } from "react";
import { getFacilityComparison } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { FacilityComparisonItem, Metric } from "../../types.js";

type FacilityComparisonProps = {
  metrics: Metric[];
};

export function FacilityComparison({ metrics }: FacilityComparisonProps) {
  const { period, facilityId } = useDashboardPeriod();
  const [metricId, setMetricId] = useState<number>(0);
  const [comparison, setComparison] = useState<FacilityComparisonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (metrics.length > 0 && metricId === 0) {
      const emissionsMetric = metrics.find((metric) =>
        metric.name.toLowerCase().includes("emission"),
      );
      setMetricId(emissionsMetric?.id ?? metrics[0].id);
    }
  }, [metrics, metricId]);

  useEffect(() => {
    if (!metricId) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getFacilityComparison(metricId, period, facilityId)
      .then((data) => {
        if (!cancelled) {
          setComparison(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load facility comparison");
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

  const chartData = useMemo(
    () =>
      comparison.map((row) => ({
        facility: row.facility,
        Value: row.value,
      })),
    [comparison],
  );

  return (
    <Card>
      <Title>Facility comparison</Title>
      <Text className="mt-1 text-gray-600">
        Compare sites for a selected metric in the reporting period.
      </Text>

      <div className="mt-4">
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

      {error && <Text className="mt-3 text-sm text-red-600">{error}</Text>}

      <BarChart
        className="mt-6 h-72"
        data={chartData}
        index="facility"
        categories={["Value"]}
        colors={["cyan"]}
        yAxisWidth={56}
        showAnimation
        noDataText={
          loading ? "Loading…" : "No facility data for this metric and period"
        }
      />
    </Card>
  );
}
