import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  createEntry,
  isApiError,
  isFieldErrorsError,
  updateEntry,
} from "../api.js";
import {
  entryFormSchema,
  entryToFormValues,
  formValuesToCreatePayload,
  type EntryFormValues,
} from "../schemas/entryForm.js";
import type { EsgEntry, Facility, Metric } from "../types.js";

type EntryFormProps = {
  facilities: Facility[];
  metrics: Metric[];
  editingEntry: EsgEntry | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onCancelEdit: () => void;
};

const emptyValues: EntryFormValues = {
  facilityId: 0,
  metricId: 0,
  value: 0,
  periodStart: "",
  periodEnd: "",
  source: "",
  enteredBy: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="gov-error">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </p>
  );
}

export function EntryForm({
  facilities,
  metrics,
  editingEntry,
  onSuccess,
  onError,
  onCancelEdit,
}: EntryFormProps) {
  const isEditMode = editingEntry !== null;
  const isLocked = editingEntry?.status === "locked";

  const metricsByCategory = useMemo(() => {
    const groups = new Map<string, { categoryName: string; metrics: Metric[] }>();
    for (const metric of metrics) {
      const key = metric.category.name;
      const existing = groups.get(key);
      if (existing) {
        existing.metrics.push(metric);
      } else {
        groups.set(key, { categoryName: key, metrics: [metric] });
      }
    }
    return [...groups.values()].sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName),
    );
  }, [metrics]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: emptyValues,
  });

  const selectedMetricId = watch("metricId");
  const selectedMetric = metrics.find((m) => m.id === Number(selectedMetricId));

  useEffect(() => {
    if (editingEntry) {
      reset(entryToFormValues(editingEntry));
      return;
    }
    reset(emptyValues);
  }, [editingEntry, reset]);

  const applyFieldErrors = (fieldErrors: Record<string, string[]>) => {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (field in emptyValues) {
        setError(field as keyof EntryFormValues, { type: "server", message: messages[0] });
      }
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (isLocked) return;
    try {
      if (isEditMode && editingEntry) {
        await updateEntry(editingEntry.id, {
          value: values.value,
          changedBy: values.enteredBy || undefined,
        });
        onSuccess("Entry updated successfully");
        onCancelEdit();
        return;
      }
      await createEntry(formValuesToCreatePayload(values));
      reset(emptyValues);
      onSuccess("Entry created successfully");
    } catch (error) {
      if (isFieldErrorsError(error)) {
        applyFieldErrors(error.response!.data.fieldErrors);
        return;
      }
      if (isApiError(error)) {
        onError(error.response?.data.error ?? "Request failed");
        return;
      }
      throw error;
    }
  });

  return (
    <div className={["gov-card p-6", isEditMode ? "gov-card-accent ring-1 ring-gov-accent/20" : ""].join(" ")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gov-50 border border-gov-100 flex items-center justify-center text-gov-600">
            {isEditMode ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="section-title text-lg">
              {isEditMode ? "Edit Entry" : "New Entry"}
            </h2>
            {isEditMode && editingEntry && (
              <p className="text-xs text-[--text-muted] mt-0.5">
                Entry #{editingEntry.id} · Status: <span className="font-medium capitalize">{editingEntry.status}</span>
              </p>
            )}
          </div>
        </div>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-[--text-muted] hover:text-gov-800 transition-colors p-1.5 rounded-md hover:bg-gov-50"
            title="Cancel editing"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {isLocked && (
        <div className="mb-5 flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          This entry is locked and cannot be edited.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="gov-label">Facility</label>
            <select
              {...register("facilityId", {
                setValueAs: (v) => (v === "" || v === "0" ? NaN : Number(v)),
              })}
              disabled={isEditMode || isLocked}
              className="gov-select"
            >
              <option value={0}>Select facility…</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <FieldError message={errors.facilityId?.message} />
          </div>

          <div>
            <label className="gov-label">Metric</label>
            <select
              {...register("metricId", {
                setValueAs: (v) => (v === "" || v === "0" ? NaN : Number(v)),
              })}
              disabled={isEditMode || isLocked}
              className="gov-select"
            >
              <option value={0}>Select metric…</option>
              {metricsByCategory.map((group) => (
                <optgroup key={group.categoryName} label={group.categoryName}>
                  {group.metrics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedMetric && (
              <p className="text-xs text-gov-600 mt-1.5 flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Unit: {selectedMetric.unit}
              </p>
            )}
            <FieldError message={errors.metricId?.message} />
          </div>

          <div>
            <label className="gov-label">
              Value{selectedMetric ? ` (${selectedMetric.unit})` : ""}
            </label>
            <input
              type="number"
              step="any"
              {...register("value", {
                setValueAs: (v) => (v === "" ? NaN : Number(v)),
              })}
              disabled={isLocked}
              className="gov-input"
              placeholder="Enter numeric value"
            />
            <FieldError message={errors.value?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="gov-label">Period Start</label>
              <input
                type="date"
                {...register("periodStart")}
                disabled={isEditMode || isLocked}
                className="gov-input"
              />
              <FieldError message={errors.periodStart?.message} />
            </div>
            <div>
              <label className="gov-label">Period End</label>
              <input
                type="date"
                {...register("periodEnd")}
                disabled={isEditMode || isLocked}
                className="gov-input"
              />
              <FieldError message={errors.periodEnd?.message} />
            </div>
          </div>

          <div>
            <label className="gov-label">Source <span className="text-[--text-muted] normal-case font-normal">(optional)</span></label>
            <input
              type="text"
              {...register("source")}
              disabled={isEditMode || isLocked}
              className="gov-input"
              placeholder="e.g. Meter Reading, Invoice"
            />
          </div>

          <div>
            <label className="gov-label">Entered By <span className="text-[--text-muted] normal-case font-normal">(optional)</span></label>
            <input
              type="text"
              {...register("enteredBy")}
              disabled={isLocked}
              className="gov-input"
              placeholder="Official name or ID"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1 border-t border-[--border-color]">
          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="gov-btn gov-btn-primary"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Saving…" : "Creating…"}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {isEditMode
                    ? <><polyline points="20 6 9 17 4 12" /></>
                    : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>
                  }
                </svg>
                {isEditMode ? "Save Changes" : "Create Entry"}
              </>
            )}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="gov-btn gov-btn-ghost"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
