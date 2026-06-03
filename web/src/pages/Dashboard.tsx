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
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-gold-400" />
            <span className="text-xs font-bold tracking-[0.1em] uppercase text-gov-600">
              Analytics Dashboard
            </span>
          </div>
          <h1 className="section-title text-2xl sm:text-3xl">
            ESG Performance Overview
          </h1>
          <p className="mt-1.5 text-sm text-[--text-muted] max-w-xl">
            Key performance indicators, trend analytics, and data quality metrics
            for the selected reporting period.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gov-600 bg-gov-50 border border-gov-200 rounded-lg px-3 py-2 self-start sm:self-auto">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Updated live
        </div>
      </div>

      {loadError && (
        <div className="gov-card p-4 border-red-200 bg-red-50 text-red-800 text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {loadError}
        </div>
      )}

      <PeriodSelector />
      <KpiCards />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TrendChart metrics={metrics} />
        <FacilityComparison metrics={metrics} />
      </div>

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
