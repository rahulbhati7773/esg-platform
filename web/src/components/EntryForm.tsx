import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FilePlus2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { AnimatedFieldError } from "./ui/AnimatedFieldError.js";
import { FormDatePicker } from "./ui/FormDatePicker.js";
import { FormSelect } from "./ui/FormSelect.js";
import { PanelCard } from "./ui/PanelCard.js";
import { cn } from "../lib/cn.js";
import type { EsgEntry, Facility, Metric } from "../types.js";

type EntryFormProps = {
  facilities: Facility[];
  metrics: Metric[];
  editingEntry: EsgEntry | null;
  prefillFacilityId?: string | null;
  prefillMetricId?: string | null;
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

const textInputClass = "input-field w-full";

export function EntryForm({
  facilities,
  metrics,
  editingEntry,
  prefillFacilityId,
  prefillMetricId,
  onSuccess,
  onError,
  onCancelEdit,
}: EntryFormProps) {
  const isEditMode = editingEntry !== null;
  const isLocked = editingEntry?.status === "locked";

  const metricGroups = useMemo(
    () =>
      [...new Map(
        metrics.map((metric) => [metric.category.name, metric.category.name]),
      ).keys()]
        .sort()
        .map((categoryName) => ({
          label: categoryName,
          options: metrics
            .filter((metric) => metric.category.name === categoryName)
            .map((metric) => ({
              value: String(metric.id),
              label: `${metric.name} (${metric.unit})`,
            })),
        })),
    [metrics],
  );

  const facilityOptions = useMemo(
    () =>
      facilities.map((facility) => ({
        value: String(facility.id),
        label: facility.name,
      })),
    [facilities],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: emptyValues,
  });

  const selectedMetricId = watch("metricId");
  const selectedMetric = metrics.find(
    (metric) => metric.id === Number(selectedMetricId),
  );

  useEffect(() => {
    if (editingEntry) {
      reset(entryToFormValues(editingEntry));
      return;
    }

    const prefill: EntryFormValues = { ...emptyValues };
    if (prefillFacilityId) {
      prefill.facilityId = Number(prefillFacilityId);
    }
    if (prefillMetricId) {
      prefill.metricId = Number(prefillMetricId);
    }
    reset(
      prefillFacilityId || prefillMetricId ? prefill : emptyValues,
    );
  }, [editingEntry, prefillFacilityId, prefillMetricId, reset]);

  const applyFieldErrors = (fieldErrors: Record<string, string[]>) => {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (field in emptyValues) {
        setError(field as keyof EntryFormValues, {
          type: "server",
          message: messages[0],
        });
      }
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (isLocked) {
      return;
    }

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
    <PanelCard className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <FilePlus2 className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">
          {isEditMode ? "Edit entry" : "New entry"}
        </h3>
      </div>

      {isLocked && (
        <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)]">
          This record is locked and cannot be changed.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-caps" htmlFor="entry-facility">
              Facility
            </label>
            <Controller
              name="facilityId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  id="entry-facility"
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                  placeholder="Select facility…"
                  disabled={isEditMode || isLocked}
                  options={facilityOptions}
                />
              )}
            />
            <AnimatedFieldError message={errors.facilityId?.message} />
          </div>

          <div className="sm:col-span-2">
            <label className="label-caps" htmlFor="entry-metric">
              Metric
            </label>
            <Controller
              name="metricId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  id="entry-metric"
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                  placeholder="Select metric…"
                  disabled={isEditMode || isLocked}
                  groups={metricGroups}
                />
              )}
            />
            <AnimatedFieldError message={errors.metricId?.message} />
          </div>

          <div className="sm:col-span-2">
            <label className="label-caps" htmlFor="entry-value">
              Measured value
            </label>
            <div className="relative">
              <input
                id="entry-value"
                type="number"
                step="any"
                {...register("value", {
                  setValueAs: (value) =>
                    value === "" ? NaN : Number(value),
                })}
                disabled={isLocked}
                className={cn(textInputClass, selectedMetric && "pr-14")}
                placeholder="0"
              />
              {selectedMetric && (
                <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-[var(--text-subtle)]">
                  {selectedMetric.unit}
                </span>
              )}
            </div>
            <AnimatedFieldError message={errors.value?.message} />
          </div>

          <div>
            <label className="label-caps" htmlFor="entry-period-start">
              Period start
            </label>
            <Controller
              name="periodStart"
              control={control}
              render={({ field }) => (
                <FormDatePicker
                  id="entry-period-start"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Start date"
                  disabled={isEditMode || isLocked}
                />
              )}
            />
            <AnimatedFieldError message={errors.periodStart?.message} />
          </div>

          <div>
            <label className="label-caps" htmlFor="entry-period-end">
              Period end
            </label>
            <Controller
              name="periodEnd"
              control={control}
              render={({ field }) => (
                <FormDatePicker
                  id="entry-period-end"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="End date"
                  disabled={isEditMode || isLocked}
                />
              )}
            />
            <AnimatedFieldError message={errors.periodEnd?.message} />
          </div>

          <div>
            <label className="label-caps" htmlFor="entry-source">
              Source (optional)
            </label>
            <input
              id="entry-source"
              type="text"
              {...register("source")}
              disabled={isEditMode || isLocked}
              className={textInputClass}
              placeholder="e.g. meter reading, invoice"
            />
          </div>

          <div>
            <label className="label-caps" htmlFor="entry-entered-by">
              Submitted by (optional)
            </label>
            <input
              id="entry-entered-by"
              type="text"
              {...register("enteredBy")}
              disabled={isLocked}
              className={textInputClass}
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            type="submit"
            disabled={isSubmitting || isLocked}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
          >
            {isEditMode ? "Save changes" : "Submit entry"}
          </motion.button>
          {isEditMode && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </PanelCard>
  );
}
