import { Text, Title } from "@tremor/react";
import { useEffect, useState } from "react";
import { getMetrics } from "../api.js";
import { DataQuality } from "../components/dashboard/DataQuality.js";
import { FacilityComparison } from "../components/dashboard/FacilityComparison.js";
import { KpiCards } from "../components/dashboard/KpiCards.js";
import { PeriodSelector } from "../components/dashboard/PeriodSelector.js";
import { TargetStatus } from "../components/dashboard/TargetStatus.js";
import { TrendChart } from "../components/dashboard/TrendChart.js";
import { DashboardPeriodProvider } from "../context/DashboardPeriodContext.js";
import type { Metric } from "../types.js";

function DashboardContent() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void getMetrics()
      .then(setMetrics)
      .catch(() => setLoadError("Failed to load metrics for chart selectors."));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Title>Dashboard</Title>
        <Text className="mt-2">
          KPIs, trends, facility comparison, targets, and data quality for the
          selected reporting period.
        </Text>
      </div>

      {loadError && <Text className="text-red-600">{loadError}</Text>}

      <PeriodSelector />
      <KpiCards />
      <TrendChart metrics={metrics} />
      <FacilityComparison metrics={metrics} />
      <TargetStatus />
      <DataQuality />
    </div>
  );
}

export function Dashboard() {
  return (
    <DashboardPeriodProvider>
      <DashboardContent />
    </DashboardPeriodProvider>
  );
}
