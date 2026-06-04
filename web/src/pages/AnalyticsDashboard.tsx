import { motion } from "framer-motion";
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
import { staggerContainer } from "../lib/motion.js";
import type { Metric } from "../types.js";

export function AnalyticsDashboard() {
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
      <GlobalControllerPanel />

      {loadError && (
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      )}

      <HeroKpiRow />
      <EnvironmentalPerformance metrics={metrics} />
      <MetricTrendPanel metrics={metrics} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <GhgStackedChart metrics={metrics} />
        <FacilityComparisonPanel metrics={metrics} />
      </div>

      <div className="grid grid-cols-1 gap-5 min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] min-[1000px]:gap-6">
        <TargetStatusPanel />
        <CompareMetricsPanel />
      </div>

      <DataQuality />
    </motion.div>
  );
}
