import { useEffect, useState } from "react";
import { getKpis } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { KpiSummaryItem } from "../../types.js";
import {
  formatDeltaPercent,
  formatKpiValue,
  isIncreasePositiveForKpi,
  KPI_DISPLAY,
  KPI_KEYS,
  matchKpiItem,
} from "../../utils/kpiConfig.js";

const KPI_ICONS: Record<string, React.ReactNode> = {
  ghg_emissions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-2.76 1.12-5.26 2.93-7.07" />
      <path d="M12 6v6l4 2" />
      <path d="M8 2.5C9.3 2.18 10.63 2 12 2" />
    </svg>
  ),
  energy_consumption: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  water_usage: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 8 4 12 4 14a8 8 0 0 0 16 0c0-2-2-6-8-12z" />
    </svg>
  ),
  waste_generated: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
};

function DeltaIndicator({
  delta,
  deltaPercent,
  isIncreasePositive,
}: {
  delta: number;
  deltaPercent: number | null;
  isIncreasePositive: boolean;
}) {
  const isPositive = delta >= 0;
  const isGood = isIncreasePositive ? isPositive : !isPositive;
  const label = formatDeltaPercent(deltaPercent);

  if (!label || label === "—") return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
        isGood
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200",
      ].join(" ")}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: isPositive ? "rotate(0deg)" : "rotate(180deg)" }}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="gov-card kpi-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="gov-skeleton h-3 w-28 rounded" />
        <div className="gov-skeleton w-10 h-10 rounded-lg" />
      </div>
      <div className="gov-skeleton h-8 w-20 rounded mb-2" />
      <div className="gov-skeleton h-5 w-16 rounded-full" />
    </div>
  );
}

export function KpiCards() {
  const { period, facilityId } = useDashboardPeriod();
  const [kpis, setKpis] = useState<KpiSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getKpis(period, facilityId)
      .then((data) => { if (!cancelled) setKpis(data); })
      .catch(() => { if (!cancelled) setError("Failed to load KPI summary"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [period, facilityId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_KEYS.map((key) => <SkeletonCard key={key} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPI_KEYS.map((key, index) => {
        const config = KPI_DISPLAY[key];
        const item = matchKpiItem(kpis, key);

        return (
          <div
            key={key}
            className="gov-card kpi-card p-5 cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase text-[--text-muted]">
                {config.label}
              </span>
              <div className="w-10 h-10 rounded-lg bg-gov-50 flex items-center justify-center text-gov-600 flex-shrink-0 border border-gov-100">
                {KPI_ICONS[key] ?? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                )}
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : item ? (
              <>
                <div className="font-display text-2xl font-semibold text-gov-900 leading-none mb-2 animate-countUp">
                  {formatKpiValue(item.total, item.unit)}
                </div>
                <div className="flex items-center gap-2">
                  <DeltaIndicator
                    delta={item.delta}
                    deltaPercent={item.deltaPercent}
                    isIncreasePositive={isIncreasePositiveForKpi(key)}
                  />
                  <span className="text-xs text-[--text-muted]">vs prev.</span>
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-2xl font-semibold text-gov-300 leading-none mb-2">
                  —
                </div>
                <span className="text-xs text-[--text-muted]">No data for period</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
