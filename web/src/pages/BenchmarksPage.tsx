import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFacilityComparison, getMetrics } from "../api.js";
import { GlobalControllerPanel } from "../components/layout/GlobalControllerPanel.js";
import { PanelCard } from "../components/ui/PanelCard.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { usePlatformFilters } from "../context/PlatformContext.js";
import { cn } from "../lib/cn.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { FacilityComparisonItem, Metric } from "../types.js";

const FACILITY_COLORS = ["#2d9c72", "#7c3aed", "#d97706"];

const CATEGORY_ORDER = ["Environmental", "Social", "Governance"];

export function BenchmarksPage() {
  const { period, facilityId } = usePlatformFilters();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [comparison, setComparison] = useState<FacilityComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group metrics by category
  const grouped = useMemo(() => {
    const map = new Map<string, Metric[]>();
    for (const m of metrics) {
      const cat = m.category.name;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      metrics: map.get(c)!,
    }));
  }, [metrics]);

  const selectedMetric = metrics.find((m) => m.id === selectedMetricId);

  // Load metrics on mount
  useEffect(() => {
    setLoading(true);
    getMetrics()
      .then((ms) => {
        setMetrics(ms);
        if (ms.length > 0) setSelectedMetricId(ms[0].id);
      })
      .catch(() => setError("Could not load metrics."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch comparison whenever metric or period changes
  useEffect(() => {
    if (!selectedMetricId) return;
    setChartLoading(true);
    getFacilityComparison(selectedMetricId, period, facilityId)
      .then((data) => {
        setComparison(data);
        setError(null);
      })
      .catch(() => setError("Could not load comparison data."))
      .finally(() => setChartLoading(false));
  }, [selectedMetricId, period, facilityId]);

  const maxVal = comparison.length > 0 ? Math.max(...comparison.map((c) => c.value)) : 1;
  const minVal = comparison.length > 0 ? Math.min(...comparison.map((c) => c.value)) : 0;

  const rankedData = [...comparison]
    .sort((a, b) => a.value - b.value)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1100px] space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-400/10">
          <GitCompare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Facility Benchmarks</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Compare ESG performance across all facilities for any metric
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <GlobalControllerPanel />
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Metric selector */}
        <PanelCard className="h-fit p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Select metric
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ category, metrics: catMetrics }) => (
                <div key={category}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {catMetrics.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMetricId(m.id)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                          selectedMetricId === m.id
                            ? "bg-[var(--primary)] font-semibold text-white"
                            : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
                        )}
                      >
                        <span className="block truncate">{m.name}</span>
                        <span className={cn(
                          "text-[10px]",
                          selectedMetricId === m.id ? "text-white/70" : "text-[var(--text-subtle)]"
                        )}>
                          {m.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        {/* Chart + rankings */}
        <div className="space-y-4">
          {/* Bar chart */}
          <PanelCard className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--text)]">
                  {selectedMetric?.name ?? "—"}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Total per facility · {selectedMetric?.unit}
                </p>
              </div>
            </div>

            {chartLoading ? (
              <Skeleton className="h-52 w-full rounded-xl" />
            ) : comparison.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-[var(--text-muted)]">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={comparison.map((item, i) => ({ ...item, color: FACILITY_COLORS[i % FACILITY_COLORS.length] }))}
                  margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="facility"
                    tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}M`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}k`
                          : String(v)
                    }
                  />
                  <Tooltip
                    formatter={(v: number) => [
                      v.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                      selectedMetric?.unit ?? "",
                    ]}
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
                    {comparison.map((_, i) => (
                      <Cell key={i} fill={FACILITY_COLORS[i % FACILITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </PanelCard>

          {/* Ranking cards */}
          {!chartLoading && rankedData.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {rankedData.map((item, i) => {
                const isLowest = item.value === minVal;
                const isHighest = item.value === maxVal;
                const pctOfMax = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                return (
                  <PanelCard key={item.facility} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        #{item.rank}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${FACILITY_COLORS[i]}22`, color: FACILITY_COLORS[i] }}
                      >
                        {isLowest ? "Lowest" : isHighest ? "Highest" : "Mid"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)]">{item.facility}</p>
                    <p className="mt-0.5 text-lg font-bold text-[var(--text)]">
                      {item.value >= 1_000_000
                        ? `${(item.value / 1_000_000).toFixed(2)}M`
                        : item.value >= 1000
                          ? `${(item.value / 1000).toFixed(1)}k`
                          : item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
                        {selectedMetric?.unit}
                      </span>
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: FACILITY_COLORS[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pctOfMax}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </PanelCard>
                );
              })}
            </div>
          )}

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
