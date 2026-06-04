export type EntryStatus = "draft" | "submitted" | "approved" | "locked";

export type Facility = {
  id: number;
  name: string;
  type: string;
  location: string | null;
};

export type MetricCategory = {
  id: number;
  name: string;
};

export type Metric = {
  id: number;
  categoryId: number;
  name: string;
  unit: string;
  category: MetricCategory;
};

export type EntryAudit = {
  id: number;
  entryId: number;
  action: string;
  oldValue: number | null;
  newValue: number | null;
  changedBy: string | null;
  changedAt: string;
};

export type EsgEntry = {
  id: number;
  facilityId: number;
  metricId: number;
  value: number;
  periodStart: string;
  periodEnd: string;
  source: string | null;
  enteredBy: string | null;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
  audits: EntryAudit[];
};

export type CreateEntryPayload = {
  facilityId: number;
  metricId: number;
  value: number;
  periodStart: string;
  periodEnd: string;
  source?: string;
  enteredBy?: string;
};

export type UpdateEntryPayload = {
  value: number;
  changedBy?: string;
};

export type UpdateEntryStatusPayload = {
  status: EntryStatus;
};

export type ListEntriesFilters = {
  facilityId?: number;
  metricId?: number;
  periodStart?: string;
  periodEnd?: string;
  status?: EntryStatus;
};

export type PeriodQuery = {
  periodStart: string;
  periodEnd: string;
};

export type KpiSummaryItem = {
  metric: string;
  unit: string;
  total: number;
  previousTotal: number;
  delta: number;
  deltaPercent: number | null;
};

export type TrendPoint = {
  periodStart: string;
  value: number;
};

export type FacilityComparisonItem = {
  facility: string;
  value: number;
};

export type RagStatus = "green" | "amber" | "red";

export type TargetStatusItem = {
  metric: string;
  facility: string | null;
  actual: number;
  target: number;
  rag: RagStatus;
};

export type DataQualitySummary = {
  countsByStatus: Record<string, number>;
  missing: Array<{
    facilityId: number;
    facility: string;
    metricId: number;
    metric: string;
  }>;
};

export type FieldErrorsResponse = {
  fieldErrors: Record<string, string[]>;
};

export type ApiErrorResponse = {
  error: string;
  code?: string;
};
