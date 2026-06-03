import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import {
  isApiError,
  listEntries,
  updateEntryStatus,
} from "../api.js";
import type {
  EntryStatus,
  EsgEntry,
  Facility,
  ListEntriesFilters,
  Metric,
} from "../types.js";
import {
  nextStatus,
  statusAdvanceLabel,
} from "../utils/entryStatus.js";

type EntriesTableProps = {
  facilities: Facility[];
  metrics: Metric[];
  refreshToken: number;
  onEdit: (entry: EsgEntry) => void;
  onEntriesChange?: () => void;
};

const STATUS_FILTER_OPTIONS: Array<EntryStatus | ""> = [
  "", "draft", "submitted", "approved", "locked",
];

function StatusBadge({ status }: { status: EntryStatus }) {
  const cls = {
    draft: "gov-badge-draft",
    submitted: "gov-badge-submitted",
    approved: "gov-badge-approved",
    locked: "gov-badge-locked",
  }[status];
  const dots = {
    draft: "bg-blue-400",
    submitted: "bg-amber-400",
    approved: "bg-green-400",
    locked: "bg-gray-400",
  }[status];
  return (
    <span className={`gov-badge ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dots}`} />
      {status}
    </span>
  );
}

export function EntriesTable({
  facilities,
  metrics,
  refreshToken,
  onEdit,
  onEntriesChange,
}: EntriesTableProps) {
  const [entries, setEntries] = useState<EsgEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<number | null>(null);

  const [facilityFilter, setFacilityFilter] = useState("");
  const [metricFilter, setMetricFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntryStatus | "">("");
  const [periodStartFilter, setPeriodStartFilter] = useState("");
  const [periodEndFilter, setPeriodEndFilter] = useState("");

  const facilityName = (id: number) =>
    facilities.find((f) => f.id === id)?.name ?? `Facility #${id}`;

  const metricLabel = (id: number) => {
    const metric = metrics.find((m) => m.id === id);
    return metric ? `${metric.name} (${metric.unit})` : `Metric #${id}`;
  };

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setStatusError(null);
    const filters: ListEntriesFilters = {};
    if (facilityFilter) filters.facilityId = Number(facilityFilter);
    if (metricFilter) filters.metricId = Number(metricFilter);
    if (statusFilter) filters.status = statusFilter;
    if (periodStartFilter) filters.periodStart = periodStartFilter;
    if (periodEndFilter) filters.periodEnd = periodEndFilter;
    try {
      const data = await listEntries(filters);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [facilityFilter, metricFilter, periodEndFilter, periodStartFilter, statusFilter]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries, refreshToken]);

  const handleAdvanceStatus = async (entry: EsgEntry) => {
    const next = nextStatus(entry.status);
    if (!next) return;
    setAdvancingId(entry.id);
    setStatusError(null);
    try {
      const updated = await updateEntryStatus(entry.id, { status: next });
      setEntries((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
      onEntriesChange?.();
    } catch (error) {
      if (isApiError(error) && error.response?.status === 409) {
        setStatusError(error.response.data.error);
      } else {
        setStatusError("Failed to update status");
      }
    } finally {
      setAdvancingId(null);
    }
  };

  const formatPeriod = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return `${start} – ${end}`;
    }
    return `${format(s, "dd MMM yyyy")} – ${format(e, "dd MMM yyyy")}`;
  };

  const activeFilters = [facilityFilter, metricFilter, statusFilter, periodStartFilter, periodEndFilter].filter(Boolean).length;

  return (
    <div className="gov-card p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gov-accent">
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
            <h2 className="section-title text-lg">ESG Entries</h2>
            {!loading && (
              <span className="text-xs bg-gov-100 text-gov-700 rounded-full px-2 py-0.5 font-medium">
                {entries.length}
              </span>
            )}
          </div>
          <p className="text-xs text-[--text-muted]">Filter and manage submitted ESG data entries</p>
        </div>
        {activeFilters > 0 && (
          <button
            className="text-xs text-gov-600 hover:text-gov-800 flex items-center gap-1 transition-colors"
            onClick={() => {
              setFacilityFilter("");
              setMetricFilter("");
              setStatusFilter("");
              setPeriodStartFilter("");
              setPeriodEndFilter("");
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 mb-4">
        <div>
          <label className="gov-label text-[0.65rem]">Facility</label>
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="gov-select text-xs"
          >
            <option value="">All facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="gov-label text-[0.65rem]">Metric</label>
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="gov-select text-xs"
          >
            <option value="">All metrics</option>
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="gov-label text-[0.65rem]">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EntryStatus | "")}
            className="gov-select text-xs"
          >
            {STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s : "All statuses"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="gov-label text-[0.65rem]">Period from</label>
          <input
            type="date"
            value={periodStartFilter}
            onChange={(e) => setPeriodStartFilter(e.target.value)}
            className="gov-input text-xs"
            aria-label="Period from"
          />
        </div>
        <div>
          <label className="gov-label text-[0.65rem]">Period to</label>
          <input
            type="date"
            value={periodEndFilter}
            onChange={(e) => setPeriodEndFilter(e.target.value)}
            className="gov-input text-xs"
            aria-label="Period to"
          />
        </div>
      </div>

      {statusError && (
        <div className="mb-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>
          {statusError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Facility</th>
              <th>Metric</th>
              <th>Value</th>
              <th>Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-[--text-muted] text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-gov-accent border-t-transparent animate-spin" />
                    Loading entries…
                  </div>
                </td>
              </tr>
            )}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2 text-[--text-muted]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="text-sm">No entries match the current filters</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && entries.map((entry) => {
              const next = nextStatus(entry.status);
              const isLocked = entry.status === "locked";

              return (
                <tr key={entry.id} className={isLocked ? "opacity-75" : ""}>
                  <td className="font-medium text-gov-800">{facilityName(entry.facilityId)}</td>
                  <td className="text-[--text-secondary] max-w-[160px] truncate" title={metricLabel(entry.metricId)}>
                    {metricLabel(entry.metricId)}
                  </td>
                  <td className="font-semibold text-gov-900 tabular-nums">{entry.value.toLocaleString()}</td>
                  <td className="text-[--text-muted] text-xs whitespace-nowrap">
                    {formatPeriod(entry.periodStart, entry.periodEnd)}
                  </td>
                  <td><StatusBadge status={entry.status} /></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        className={[
                          "gov-btn gov-btn-xs",
                          isLocked ? "gov-btn-ghost opacity-50 cursor-not-allowed" : "gov-btn-secondary",
                        ].join(" ")}
                        disabled={isLocked}
                        onClick={() => !isLocked && onEdit(entry)}
                        title={isLocked ? "Locked entries cannot be edited" : "Edit entry value"}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                        Edit
                      </button>
                      {next && (
                        <button
                          className="gov-btn gov-btn-xs gov-btn-primary"
                          disabled={advancingId === entry.id}
                          onClick={() => void handleAdvanceStatus(entry)}
                        >
                          {advancingId === entry.id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          )}
                          {statusAdvanceLabel(next)}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
