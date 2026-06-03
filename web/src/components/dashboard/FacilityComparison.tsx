import { BarChart } from "@tremor/react";
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
      const emissionsMetric = metrics.find((m) =>
        m.name.toLowerCase().includes("emission"),
      );
      setMetricId(emissionsMetric?.id ?? metrics[0].id);
    }
  }, [metrics, metricId]);

  useEffect(() => {
    if (!metricId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getFacilityComparison(metricId, period, facilityId)
      .then((data) => { if (!cancelled) setComparison(data); })
      .catch(() => { if (!cancelled) setError("Failed to load facility comparison"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [metricId, period, facilityId]);

  const chartData = useMemo(
    () => comparison.map((row) => ({ facility: row.facility, Value: row.value })),
    [comparison],
  );

  return (
    <div className="gov-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gov-accent">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h3 className="text-sm font-bold text-gov-800 tracking-wide">Facility Comparison</h3>
          </div>
          <p className="text-xs text-[--text-muted]">Compare sites for the selected metric</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="gov-label">Metric</label>
        <select
          value={metricId || ""}
          onChange={(e) => setMetricId(Number(e.target.value))}
          className="gov-select max-w-xs"
        >
          <option value="">Select metric…</option>
          {metrics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.unit})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </p>
      )}

      <BarChart
        className="h-60"
        data={chartData}
        index="facility"
        categories={["Value"]}
        colors={["green"]}
        yAxisWidth={56}
        showAnimation
        noDataText={loading ? "Loading…" : "No facility data for this metric and period"}
      />
    </div>
  );
}
