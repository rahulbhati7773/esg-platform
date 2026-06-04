import { BarChart } from "@tremor/react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getFacilityComparison } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { cn } from "../../lib/cn.js";
import { ChartPanel } from "../ui/ChartPanel.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { FacilityComparisonItem, Metric } from "../../types.js";

type FacilityComparisonProps = {
  metrics: Metric[];
};

type SortOrder = "highest" | "lowest";

export function FacilityComparison({ metrics }: FacilityComparisonProps) {
  const { period, facilityId } = usePlatformFilters();
  const [metricId, setMetricId] = useState<number>(0);
  const [comparison, setComparison] = useState<FacilityComparisonItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("highest");
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

  const chartData = useMemo(() => {
    const rows = comparison.map((row) => ({
      facility: row.facility,
      Value: row.value,
    }));
    rows.sort((a, b) =>
      sortOrder === "highest"
        ? Number(b.Value) - Number(a.Value)
        : Number(a.Value) - Number(b.Value),
    );
    return rows;
  }, [comparison, sortOrder]);

  const sortControls = (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      <button
        type="button"
        onClick={() => setSortOrder("highest")}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          sortOrder === "highest"
            ? "bg-white text-teal-800 shadow-sm"
            : "text-slate-600 hover:text-slate-800",
        )}
      >
        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
        Highest first
      </button>
      <button
        type="button"
        onClick={() => setSortOrder("lowest")}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          sortOrder === "lowest"
            ? "bg-white text-teal-800 shadow-sm"
            : "text-slate-600 hover:text-slate-800",
        )}
      >
        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
        Lowest first
      </button>
    </div>
  );

  return (
    <ChartPanel
      title="Compare facilities"
      description="See how each site performs for the metric you choose."
      controls={sortControls}
    >
      <div>
        <label className="label-caps">Metric</label>
        <select
          value={metricId || ""}
          onChange={(event) => setMetricId(Number(event.target.value))}
          className="input-field min-w-[240px]"
        >
          <option value="">Select metric…</option>
          {metrics.map((metric) => (
            <option key={metric.id} value={metric.id}>
              {metric.name} ({metric.unit})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <BarChart
          className="h-72"
          data={chartData}
          index="facility"
          categories={["Value"]}
          colors={["teal"]}
          yAxisWidth={56}
          showAnimation
          showTooltip
          noDataText="No facility data for this metric and period"
        />
      )}
    </ChartPanel>
  );
}
