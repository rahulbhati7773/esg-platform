import axios, { type AxiosError } from "axios";
import type {
  ApiErrorResponse,
  CreateEntryPayload,
  DataQualitySummary,
  EsgEntry,
  Facility,
  FacilityComparisonItem,
  FieldErrorsResponse,
  KpiSummaryItem,
  ListEntriesFilters,
  Metric,
  MetricCategory,
  PeriodQuery,
  TargetStatusItem,
  TrendPoint,
  UpdateEntryPayload,
  UpdateEntryStatusPayload,
} from "./types.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function formatPeriod({ periodStart, periodEnd }: PeriodQuery): string {
  return `${periodStart},${periodEnd}`;
}

function analyticsParams(
  period: PeriodQuery,
  facilityId?: number,
): { period: string; facilityId?: number } {
  const params: { period: string; facilityId?: number } = {
    period: formatPeriod(period),
  };
  if (facilityId !== undefined) {
    params.facilityId = facilityId;
  }
  return params;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatRange({ start, end }: { start: string; end: string }): string {
  return `${start},${end}`;
}

export function isFieldErrorsError(
  error: unknown,
): error is AxiosError<FieldErrorsResponse> {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 400 &&
    error.response.data !== undefined &&
    "fieldErrors" in error.response.data
  );
}

export function isApiError(
  error: unknown,
): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError(error) && error.response?.data !== undefined;
}

export async function getFacilities(): Promise<Facility[]> {
  const { data } = await apiClient.get<Facility[]>("/facilities");
  return data;
}

export async function getCategories(): Promise<MetricCategory[]> {
  const { data } = await apiClient.get<MetricCategory[]>("/categories");
  return data;
}

export async function getMetrics(): Promise<Metric[]> {
  const { data } = await apiClient.get<Metric[]>("/metrics");
  return data;
}

export async function listEntries(
  filters: ListEntriesFilters = {},
): Promise<EsgEntry[]> {
  const { data } = await apiClient.get<EsgEntry[]>("/entries", {
    params: filters,
  });
  return data;
}

export async function createEntry(
  payload: CreateEntryPayload,
): Promise<EsgEntry> {
  const { data } = await apiClient.post<EsgEntry>("/entries", payload);
  return data;
}

export async function updateEntry(
  id: number,
  payload: UpdateEntryPayload,
): Promise<EsgEntry> {
  const { data } = await apiClient.put<EsgEntry>(`/entries/${id}`, payload);
  return data;
}

export async function updateEntryStatus(
  id: number,
  payload: UpdateEntryStatusPayload,
): Promise<EsgEntry> {
  const { data } = await apiClient.patch<EsgEntry>(
    `/entries/${id}/status`,
    payload,
  );
  return data;
}

export async function getKpis(
  period: PeriodQuery,
  facilityId?: number,
): Promise<KpiSummaryItem[]> {
  const { data } = await apiClient.get<KpiSummaryItem[]>("/analytics/kpis", {
    params: analyticsParams(period, facilityId),
  });
  return data;
}

export async function getTrend(
  metricId: number,
  range: { start: string; end: string },
): Promise<TrendPoint[]> {
  const { data } = await apiClient.get<TrendPoint[]>("/analytics/trend", {
    params: {
      metricId,
      range: formatRange(range),
    },
  });
  return data;
}

export async function getFacilityComparison(
  metricId: number,
  period: PeriodQuery,
  facilityId?: number,
): Promise<FacilityComparisonItem[]> {
  const { data } = await apiClient.get<FacilityComparisonItem[]>(
    "/analytics/facility-comparison",
    {
      params: {
        metricId,
        ...analyticsParams(period, facilityId),
      },
    },
  );
  return data;
}

export async function getTargets(
  period: PeriodQuery,
  facilityId?: number,
): Promise<TargetStatusItem[]> {
  const { data } = await apiClient.get<TargetStatusItem[]>(
    "/analytics/targets",
    {
      params: analyticsParams(period, facilityId),
    },
  );
  return data;
}

export async function getDataQuality(
  period: PeriodQuery,
  facilityId?: number,
): Promise<DataQualitySummary> {
  const { data } = await apiClient.get<DataQualitySummary>(
    "/analytics/data-quality",
    {
      params: analyticsParams(period, facilityId),
    },
  );
  return data;
}

export async function downloadExcelReport(
  period: PeriodQuery,
  facilityId?: number,
): Promise<void> {
  const params: { period: string; facilityId?: number } = {
    period: formatPeriod(period),
  };
  if (facilityId !== undefined) {
    params.facilityId = facilityId;
  }

  const { data } = await apiClient.get<Blob>("/report/excel", {
    params,
    responseType: "blob",
  });

  triggerBlobDownload(
    data,
    `esg-report-${period.periodStart}-${period.periodEnd}.xlsx`,
  );
}
