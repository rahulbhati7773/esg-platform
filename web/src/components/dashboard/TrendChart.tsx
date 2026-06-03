import { LineChart } from "@tremor/react";
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
    if (!metricId || !rangeStart || !rangeEnd) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getTrend(metricId, { start: rangeStart, end: rangeEnd })
      .then((data) => { if (!cancelled) setSeries(data); })
      .catch(() => { if (!cancelled) setError("Failed to load trend data"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [metricId, rangeStart, rangeEnd]);

  const chartData = useMemo(
    () => series.map((point) => ({
      date: format(new Date(point.periodStart), "MMM yyyy"),
      Value: point.value,
    })),
    [series],
  );

  const selectedMetric = metrics.find((m) => m.id === metricId);

  return (
    <div className="gov-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gov-accent">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3 className="text-sm font-bold text-gov-800 tracking-wide">Trend Analysis</h3>
          </div>
          <p className="text-xs text-[--text-muted]">Metric values over the selected range</p>
        </div>
        {selectedMetric && (
          <span className="text-xs text-gov-600 bg-gov-50 border border-gov-100 rounded-full px-2.5 py-1">
            {selectedMetric.unit}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[160px]">
          <label className="gov-label">Metric</label>
          <select
            value={metricId || ""}
            onChange={(e) => setMetricId(Number(e.target.value))}
            className="gov-select"
          >
            <option value="">Select metric…</option>
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.unit})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="gov-label">Range start</label>
          <input
            type="date"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            className="gov-input"
          />
        </div>
        <div>
          <label className="gov-label">Range end</label>
          <input
            type="date"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            className="gov-input"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </p>
      )}

      <LineChart
        className="h-60"
        data={chartData}
        index="date"
        categories={["Value"]}
        colors={["emerald"]}
        yAxisWidth={56}
        showAnimation
        noDataText={loading ? "Loading…" : "No trend data for this range"}
        curveType="monotone"
      />
    </div>
  );
}
