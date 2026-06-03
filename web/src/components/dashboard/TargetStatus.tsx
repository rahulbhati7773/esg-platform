import { useEffect, useState } from "react";
import { getTargets } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { RagStatus, TargetStatusItem } from "../../types.js";

function RagBadge({ status }: { status: RagStatus }) {
  const configs = {
    green: { cls: "gov-badge-green", label: "On Target", dot: "bg-green-500" },
    amber: { cls: "gov-badge-amber", label: "Near Limit", dot: "bg-amber-500" },
    red: { cls: "gov-badge-red", label: "Off Target", dot: "bg-red-500" },
  };
  const { cls, label, dot } = configs[status];
  return (
    <span className={`gov-badge ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
      {label}
    </span>
  );
}

export function TargetStatus() {
  const { period, facilityId } = useDashboardPeriod();
  const [targets, setTargets] = useState<TargetStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getTargets(period, facilityId)
      .then((data) => { if (!cancelled) setTargets(data); })
      .catch(() => { if (!cancelled) setError("Failed to load target status"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, facilityId]);

  return (
    <div className="gov-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gov-accent">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <h3 className="text-sm font-bold text-gov-800 tracking-wide">Target vs Actual</h3>
      </div>
      <p className="text-xs text-[--text-muted] mb-4">
        RAG status: green = on target · amber = within 10% · red = beyond threshold
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-3 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>
          {error}
        </p>
      )}

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Facility</th>
              <th>Actual</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-[--text-muted] text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-gov-accent border-t-transparent animate-spin" />
                    Loading targets…
                  </div>
                </td>
              </tr>
            )}
            {!loading && targets.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-[--text-muted] text-sm">
                  No targets configured for this period.
                </td>
              </tr>
            )}
            {!loading && targets.map((row) => (
              <tr key={`${row.metric}-${row.facility ?? "all"}`}>
                <td className="font-medium text-gov-800">{row.metric}</td>
                <td className="text-[--text-secondary]">{row.facility ?? "All facilities"}</td>
                <td className="font-semibold text-gov-900">{row.actual.toLocaleString()}</td>
                <td className="text-[--text-muted]">{row.target.toLocaleString()}</td>
                <td><RagBadge status={row.rag} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
