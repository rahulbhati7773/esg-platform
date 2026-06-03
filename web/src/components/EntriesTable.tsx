import { motion } from "framer-motion";
import { format } from "date-fns";
import { Lock, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isApiError,
  listEntries,
  updateEntryStatus,
} from "../api.js";
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
    const next = nextStatus(entry.status);
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
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return `${start} – ${end}`;
    }
    return `${format(startDate, "dd MMM yyyy")} – ${format(endDate, "dd MMM yyyy")}`;
  };

  return (
    <PanelCard className="flex flex-col">
      <h3 className="text-sm font-semibold text-[var(--text)]">Entries</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Filter the list and advance records through the workflow.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
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

        <FormDatePicker
          value={periodStartFilter}
          onChange={setPeriodStartFilter}
          placeholder="Period from"
          aria-label="Period from"
        />

        <FormDatePicker
          value={periodEndFilter}
          onChange={setPeriodEndFilter}
          placeholder="Period to"
          aria-label="Period to"
        />
      </div>

      {statusError && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{statusError}</p>
      )}

      <div className="scroll-themed mt-4 max-h-[640px] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[520px] border-collapse text-sm">
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
                const next = nextStatus(entry.status);
                const isLocked = entry.status === "locked";

                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "border-t border-[var(--border)] transition-colors hover:bg-[var(--surface-muted)]",
                      isLocked && "opacity-60",
                    )}
                  >
                    <td className="px-3 py-3 font-medium">{facilityName(entry.facilityId)}</td>
                    <td className="px-3 py-3 text-[var(--text-muted)]">
                      {metricLabel(entry.metricId)}
                      <span className="mt-0.5 block text-[11px] text-[var(--text-subtle)]">
                        {formatPeriod(entry.periodStart, entry.periodEnd)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium">
                      {entry.value.toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <StatusWorkflow
                        status={entry.status}
                        compact
                        pulse={pulseId === entry.id}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => onEdit(entry)}
                          title={
                            isLocked
                              ? "This record is locked and audit-sealed"
                              : "Edit entry value"
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        {next && (
                          <motion.button
                            type="button"
                            disabled={advancingId === entry.id}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => void handleAdvanceStatus(entry)}
                            className="rounded-md bg-[var(--primary)] px-2 py-1 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
                          >
                            {statusAdvanceLabel(next)}
                          </motion.button>
                        )}
                        {isLocked && (
                          <span
                            className="inline-flex items-center text-[var(--text-muted)]"
                            title="Audit-sealed"
                          >
                            <Lock className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
