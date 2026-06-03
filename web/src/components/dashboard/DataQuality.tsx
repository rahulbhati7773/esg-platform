import { useEffect, useMemo, useState } from "react";
import { getDataQuality } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { DataQualitySummary } from "../../types.js";

function percent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function ProgressRing({ value, color }: { value: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2ede8" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-gov-900">{value}%</span>
    </div>
  );
}

export function DataQuality() {
  const { period, facilityId } = useDashboardPeriod();
  const [quality, setQuality] = useState<DataQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getDataQuality(period, facilityId)
      .then((data) => { if (!cancelled) setQuality(data); })
      .catch(() => { if (!cancelled) setError("Failed to load data quality"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, facilityId]);

  const stats = useMemo(() => {
    if (!quality) return null;
    const total = Object.values(quality.countsByStatus).reduce((s, c) => s + c, 0);
    const submitted = quality.countsByStatus.submitted ?? 0;
    const approved = quality.countsByStatus.approved ?? 0;
    return { total, submittedPct: percent(submitted, total), approvedPct: percent(approved, total) };
  }, [quality]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Submitted card */}
        <div className="gov-card p-5 flex items-center gap-5">
          <div className="flex-shrink-0">
            {loading ? (
              <div className="gov-skeleton w-20 h-20 rounded-full" />
            ) : (
              <ProgressRing value={stats?.submittedPct ?? 0} color="#b8892a" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide uppercase text-[--text-muted] mb-1">
              Submitted
            </p>
            {loading ? (
              <div className="gov-skeleton h-6 w-20 rounded" />
            ) : (
              <>
                <div className="font-display text-2xl font-semibold text-gov-900">
                  {stats?.submittedPct ?? 0}%
                </div>
                <p className="text-xs text-[--text-muted] mt-1">of total entries</p>
              </>
            )}
          </div>
        </div>

        {/* Approved card */}
        <div className="gov-card p-5 flex items-center gap-5">
          <div className="flex-shrink-0">
            {loading ? (
              <div className="gov-skeleton w-20 h-20 rounded-full" />
            ) : (
              <ProgressRing value={stats?.approvedPct ?? 0} color="#2d7d65" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide uppercase text-[--text-muted] mb-1">
              Approved
            </p>
            {loading ? (
              <div className="gov-skeleton h-6 w-20 rounded" />
            ) : (
              <>
                <div className="font-display text-2xl font-semibold text-gov-900">
                  {stats?.approvedPct ?? 0}%
                </div>
                <p className="text-xs text-[--text-muted] mt-1">of total entries</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Missing data */}
      <div className="gov-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h3 className="text-sm font-bold text-gov-800 tracking-wide">Missing Data</h3>
        </div>
        <p className="text-xs text-[--text-muted] mb-4">
          Facility × metric combinations with no entry in the reporting period
        </p>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gov-skeleton h-4 rounded" style={{ width: `${60 + i * 10}%` }} />
            ))}
          </div>
        )}

        {!loading && quality && quality.missing.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            No missing combinations for this period
          </div>
        )}

        {!loading && quality && quality.missing.length > 0 && (
          <ul className="max-h-48 overflow-y-auto space-y-1.5">
            {quality.missing.map((item) => (
              <li
                key={`${item.facilityId}-${item.metricId}`}
                className="flex items-center gap-2 text-sm text-[--text-secondary] py-1.5 px-3 rounded-md bg-amber-50 border border-amber-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="font-medium text-gov-800">{item.facility}</span>
                <span className="text-[--text-muted]">—</span>
                <span>{item.metric}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
