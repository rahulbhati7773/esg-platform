import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { getMetrics } from "../api.js";
import { CompareMetricsPanel } from "../components/dashboard/CompareMetricsPanel.js";
import { DataQuality } from "../components/dashboard/DataQuality.js";
import { EnvironmentalPerformance } from "../components/dashboard/EnvironmentalPerformance.js";
import { FacilityComparisonPanel } from "../components/dashboard/FacilityComparisonPanel.js";
import { GhgStackedChart } from "../components/dashboard/GhgStackedChart.js";
import { HeroKpiRow } from "../components/dashboard/HeroKpiRow.js";
import { MetricTrendPanel } from "../components/dashboard/MetricTrendPanel.js";
import { TargetStatusPanel } from "../components/dashboard/TargetStatusPanel.js";
import { GlobalControllerPanel } from "../components/layout/GlobalControllerPanel.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { Metric } from "../types.js";

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void getMetrics()
      .then(setMetrics)
      .catch(() => setLoadError("Could not load metrics."));
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px] space-y-5 sm:space-y-6"
    >
      {/* Page header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
          <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Environmental performance, trends & targets
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <GlobalControllerPanel />
      </motion.div>

      {loadError && (
        <motion.p variants={staggerItem} className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </motion.p>
      )}

      <motion.div variants={staggerItem}>
        <HeroKpiRow />
      </motion.div>

      <motion.div variants={staggerItem}>
        <EnvironmentalPerformance metrics={metrics} />
      </motion.div>

      <motion.div variants={staggerItem}>
        <MetricTrendPanel metrics={metrics} />
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <GhgStackedChart metrics={metrics} />
        <FacilityComparisonPanel metrics={metrics} />
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 gap-5 min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] min-[1000px]:gap-6"
      >
        <TargetStatusPanel />
        <CompareMetricsPanel />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DataQuality />
      </motion.div>
    </motion.div>
  );
}
