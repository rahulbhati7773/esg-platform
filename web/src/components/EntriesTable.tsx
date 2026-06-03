import {
  Badge,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
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
  statusBadgeColor,
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
    <Card>
      <Title>Entries</Title>
      <Text className="mt-2 text-gray-600">
        Filter and manage submitted ESG data.
      </Text>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={facilityFilter}
          onChange={(e) => setFacilityFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All facilities</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>

        <select
          value={metricFilter}
          onChange={(e) => setMetricFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All metrics</option>
          {metrics.map((metric) => (
            <option key={metric.id} value={metric.id}>
              {metric.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as EntryStatus | "")
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_FILTER_OPTIONS.map((status) => (
            <option key={status || "all"} value={status}>
              {status ? status : "All statuses"}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={periodStartFilter}
          onChange={(e) => setPeriodStartFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Period from"
          aria-label="Period from"
        />

        <input
          type="date"
          value={periodEndFilter}
          onChange={(e) => setPeriodEndFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Period to"
          aria-label="Period to"
        />
      </div>

      {statusError && (
        <Text className="mt-3 text-sm text-red-600">{statusError}</Text>
      )}

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Facility</TableHeaderCell>
            <TableHeaderCell>Metric</TableHeaderCell>
            <TableHeaderCell>Value</TableHeaderCell>
            <TableHeaderCell>Period</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6}>
                <Text>Loading entries…</Text>
              </TableCell>
            </TableRow>
          )}
          {!loading && entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Text>No entries match the current filters.</Text>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            entries.map((entry) => {
              const next = nextStatus(entry.status);
              const isLocked = entry.status === "locked";

              return (
                <TableRow key={entry.id}>
                  <TableCell>{facilityName(entry.facilityId)}</TableCell>
                  <TableCell>{metricLabel(entry.metricId)}</TableCell>
                  <TableCell>{entry.value}</TableCell>
                  <TableCell>
                    {formatPeriod(entry.periodStart, entry.periodEnd)}
                  </TableCell>
                  <TableCell>
                    <Badge color={statusBadgeColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={isLocked}
                        onClick={() => onEdit(entry)}
                        title={
                          isLocked
                            ? "Locked entries cannot be edited"
                            : "Edit entry value"
                        }
                      >
                        Edit
                      </Button>
                      {next && (
                        <Button
                          size="xs"
                          disabled={advancingId === entry.id}
                          onClick={() => void handleAdvanceStatus(entry)}
                        >
                          {statusAdvanceLabel(next)}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Card>
  );
}
