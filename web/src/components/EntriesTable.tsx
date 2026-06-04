import { motion } from "framer-motion";
import { format } from "date-fns";
import { Lock, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isApiError,
  listEntries,
  updateEntryStatus,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";
import {
  canEditEntry,
  entryPermissionsForRole,
  nextStatusForRole,
} from "../lib/entryPermissions.js";
import { FormDatePicker } from "./ui/FormDatePicker.js";
import { FormSelect } from "./ui/FormSelect.js";
import { PanelCard } from "./ui/PanelCard.js";
import { Skeleton } from "./ui/Skeleton.js";
import { StatusWorkflow } from "./ui/StatusWorkflow.js";
import { cn } from "../lib/cn.js";
import type {
  EntryStatus,
  EsgEntry,
  Facility,
  ListEntriesFilters,
  Metric,
} from "../types.js";
import { statusAdvanceLabel } from "../utils/entryStatus.js";

type EntriesTableProps = {
  facilities: Facility[];
  metrics: Metric[];
  refreshToken: number;
  onEdit: (entry: EsgEntry) => void;
  onEntriesChange?: () => void;
};

const STATUS_FILTER_OPTIONS: Array<EntryStatus | ""> = [
  "",
  "draft",
  "submitted",
  "approved",
  "locked",
];

const ALL_VALUE = "__all__";

export function EntriesTable({
  facilities,
  metrics,
  refreshToken,
  onEdit,
  onEntriesChange,
}: EntriesTableProps) {
  const { user } = useAuth();
  const role = user?.role ?? "data-entry";
  const permissions = entryPermissionsForRole(role);

  const [entries, setEntries] = useState<EsgEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<number | null>(null);
  const [pulseId, setPulseId] = useState<number | null>(null);

  const [facilityFilter, setFacilityFilter] = useState("");
  const [metricFilter, setMetricFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntryStatus | "">("");
  const [periodStartFilter, setPeriodStartFilter] = useState("");
  const [periodEndFilter, setPeriodEndFilter] = useState("");

  const facilityOptions = useMemo(
    () =>
      facilities.map((facility) => ({
        value: String(facility.id),
        label: facility.name,
      })),
    [facilities],
  );

  const metricOptions = useMemo(
    () =>
      metrics.map((metric) => ({
        value: String(metric.id),
        label: metric.name,
      })),
    [metrics],
  );

  const statusOptions = useMemo(
    () =>
      STATUS_FILTER_OPTIONS.filter(Boolean).map((status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })),
    [],
  );

  const facilityName = (id: number) =>
    facilities.find((f) => f.id === id)?.name ?? `Facility #${id}`;

  const metricLabel = (id: number) => {
    const metric = metrics.find((m) => m.id === id);
    return metric ? `${metric.name}` : `Metric #${id}`;
  };

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setStatusError(null);

    const filters: ListEntriesFilters = {};
    if (facilityFilter) {
      filters.facilityId = Number(facilityFilter);
    }
    if (metricFilter) {
      filters.metricId = Number(metricFilter);
    }
    if (statusFilter) {
      filters.status = statusFilter;
    }
    if (periodStartFilter) {
      filters.periodStart = periodStartFilter;
    }
    if (periodEndFilter) {
      filters.periodEnd = periodEndFilter;
    }

    try {
      const data = await listEntries(filters);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [
    facilityFilter,
    metricFilter,
    periodEndFilter,
    periodStartFilter,
    statusFilter,
  ]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries, refreshToken]);

  const handleAdvanceStatus = async (entry: EsgEntry) => {
    const next = nextStatusForRole(entry.status, role);
    if (!next) {
      return;
    }

    setAdvancingId(entry.id);
    setStatusError(null);

    try {
      const updated = await updateEntryStatus(entry.id, { status: next });
      setEntries((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
      setPulseId(updated.id);
      window.setTimeout(() => setPulseId(null), 600);
      onEntriesChange?.();
    } catch (error) {
      if (
        isApiError(error) &&
        (error.response?.status === 409 || error.response?.status === 403)
      ) {
        setStatusError(error.response.data.error);
      } else {
        setStatusError("Failed to update status");
      }
    } finally {
      setAdvancingId(null);
    }
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return `${start} – ${end}`;
    }
    return `${format(startDate, "dd MMM yyyy")} – ${format(endDate, "dd MMM yyyy")}`;
  };

  const renderActions = (entry: EsgEntry) => {
    const next = nextStatusForRole(entry.status, role);
    const isLocked = entry.status === "locked";
    const showEdit = canEditEntry(entry, permissions, role);

    return (
      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        {showEdit && (
          <button
            type="button"
            onClick={() => onEdit(entry)}
            title="Edit entry value"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)]"
          >
            <Pencil className="h-3 w-3 shrink-0" />
            Edit
          </button>
        )}
        {next && (
          <motion.button
            type="button"
            disabled={advancingId === entry.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => void handleAdvanceStatus(entry)}
            className="inline-flex shrink-0 rounded-md bg-[var(--primary)] px-2 py-1 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
          >
            {statusAdvanceLabel(next)}
          </motion.button>
        )}
        {isLocked && (
          <span
            className="inline-flex shrink-0 items-center text-[var(--text-muted)]"
            title="Audit-sealed"
          >
            <Lock className="h-4 w-4" />
          </span>
        )}
      </div>
    );
  };

  return (
    <PanelCard className="flex min-w-0 flex-col">
      <h3 className="text-sm font-semibold text-[var(--text)]">Entries</h3>
      <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
        {role === "data-entry"
          ? "Edit draft records and submit them for review. After submit, only an auditor can approve or lock."
          : role === "auditor"
            ? "Approve submitted records or lock approved records. You cannot edit values or submit drafts."
            : "Filter and browse records across facilities."}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
        <FormSelect
          value={facilityFilter || ALL_VALUE}
          onValueChange={(value) =>
            setFacilityFilter(value === ALL_VALUE ? "" : value)
          }
          placeholder="All facilities"
          aria-label="Filter by facility"
          options={[
            { value: ALL_VALUE, label: "All facilities" },
            ...facilityOptions,
          ]}
        />
        </div>

        <div className="min-w-0">
        <FormSelect
          value={metricFilter || ALL_VALUE}
          onValueChange={(value) =>
            setMetricFilter(value === ALL_VALUE ? "" : value)
          }
          placeholder="All metrics"
          aria-label="Filter by metric"
          options={[
            { value: ALL_VALUE, label: "All metrics" },
            ...metricOptions,
          ]}
        />
        </div>

        <div className="min-w-0">
        <FormSelect
          value={statusFilter || ALL_VALUE}
          onValueChange={(value) =>
            setStatusFilter(
              value === ALL_VALUE ? "" : (value as EntryStatus),
            )
          }
          placeholder="All statuses"
          aria-label="Filter by status"
          options={[
            { value: ALL_VALUE, label: "All statuses" },
            ...statusOptions,
          ]}
        />
        </div>

        <div className="min-w-0 min-[480px]:col-span-2 lg:col-span-1">
        <FormDatePicker
          value={periodStartFilter}
          onChange={setPeriodStartFilter}
          placeholder="Period from"
          aria-label="Period from"
        />
        </div>

        <div className="min-w-0 min-[480px]:col-span-2 lg:col-span-1">
        <FormDatePicker
          value={periodEndFilter}
          onChange={setPeriodEndFilter}
          placeholder="Period to"
          aria-label="Period to"
        />
        </div>
      </div>

      {statusError && (
        <p className="mt-3 break-words text-sm text-red-600 dark:text-red-400">
          {statusError}
        </p>
      )}

      {/* Mobile: card list */}
      <div className="mt-4 space-y-3 md:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}

        {!loading && entries.length === 0 && (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No entries match the current filters.
          </p>
        )}

        {!loading &&
          entries.map((entry) => {
            const isLocked = entry.status === "locked";
            return (
              <article
                key={entry.id}
                className={cn(
                  "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4",
                  isLocked && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-[var(--text)]">
                      {facilityName(entry.facilityId)}
                    </p>
                    <p className="mt-0.5 break-words text-sm text-[var(--text-muted)]">
                      {metricLabel(entry.metricId)}
                    </p>
                  </div>
                  <StatusWorkflow
                    status={entry.status}
                    compact
                    pulse={pulseId === entry.id}
                  />
                </div>
                <p className="mt-2 break-words text-xs text-[var(--text-subtle)]">
                  {formatPeriod(entry.periodStart, entry.periodEnd)}
                </p>
                <p className="mt-2 text-lg font-bold tabular-nums text-[var(--text)]">
                  {entry.value.toLocaleString()}
                </p>
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  {renderActions(entry)}
                </div>
              </article>
            );
          })}
      </div>

      {/* Desktop: table */}
      <div className="scroll-themed mt-4 hidden min-w-0 max-h-[640px] overflow-x-auto overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] md:block">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2.5 text-left">Facility</th>
              <th className="px-3 py-2.5 text-left">Metric</th>
              <th className="px-3 py-2.5 text-right">Value</th>
              <th className="px-3 py-2.5 text-left">Status</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-3 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}

            {!loading && entries.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-[var(--text-muted)]"
                >
                  No entries match the current filters.
                </td>
              </tr>
            )}

            {!loading &&
              entries.map((entry) => {
                const isLocked = entry.status === "locked";

                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "border-t border-[var(--border)] transition-colors hover:bg-[var(--surface-muted)]",
                      isLocked && "opacity-60",
                    )}
                  >
                    <td className="max-w-[10rem] px-3 py-3 font-medium">
                      <span className="block break-words">
                        {facilityName(entry.facilityId)}
                      </span>
                    </td>
                    <td className="max-w-[12rem] px-3 py-3 text-[var(--text-muted)]">
                      <span className="block break-words">
                        {metricLabel(entry.metricId)}
                      </span>
                      <span className="mt-0.5 block break-words text-[11px] text-[var(--text-subtle)]">
                        {formatPeriod(entry.periodStart, entry.periodEnd)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-medium">
                      {entry.value.toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <StatusWorkflow
                        status={entry.status}
                        compact
                        pulse={pulseId === entry.id}
                      />
                    </td>
                    <td className="px-3 py-3">{renderActions(entry)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
