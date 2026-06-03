import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Text, Title } from "@tremor/react";
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
  const selectedMetric = metrics.find(
    (metric) => metric.id === Number(selectedMetricId),
  );

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
    <Card>
      <Title>{isEditMode ? "Edit entry" : "New entry"}</Title>
      {isLocked && (
        <Text className="mt-2 text-red-600">
          This entry is locked and cannot be edited.
        </Text>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Facility
            </label>
            <select
              {...register("facilityId", {
                setValueAs: (value) =>
                  value === "" || value === "0" ? NaN : Number(value),
              })}
              disabled={isEditMode || isLocked}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value={0}>Select facility…</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
            {errors.facilityId && (
              <Text className="mt-1 text-sm text-red-600">
                {errors.facilityId.message}
              </Text>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Metric
            </label>
            <select
              {...register("metricId", {
                setValueAs: (value) =>
                  value === "" || value === "0" ? NaN : Number(value),
              })}
              disabled={isEditMode || isLocked}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value={0}>Select metric…</option>
              {metricsByCategory.map((group) => (
                <optgroup key={group.categoryName} label={group.categoryName}>
                  {group.metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.name} ({metric.unit})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedMetric && (
              <Text className="mt-1 text-sm text-gray-500">
                Unit: {selectedMetric.unit}
              </Text>
            )}
            {errors.metricId && (
              <Text className="mt-1 text-sm text-red-600">
                {errors.metricId.message}
              </Text>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Value
              {selectedMetric ? ` (${selectedMetric.unit})` : ""}
            </label>
            <input
              type="number"
              step="any"
              {...register("value", {
                setValueAs: (value) =>
                  value === "" ? NaN : Number(value),
              })}
              disabled={isLocked}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            />
            {errors.value && (
              <Text className="mt-1 text-sm text-red-600">
                {errors.value.message}
              </Text>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Period start
              </label>
              <input
                type="date"
                {...register("periodStart")}
                disabled={isEditMode || isLocked}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
              {errors.periodStart && (
                <Text className="mt-1 text-sm text-red-600">
                  {errors.periodStart.message}
                </Text>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Period end
              </label>
              <input
                type="date"
                {...register("periodEnd")}
                disabled={isEditMode || isLocked}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
              {errors.periodEnd && (
                <Text className="mt-1 text-sm text-red-600">
                  {errors.periodEnd.message}
                </Text>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Source (optional)
            </label>
            <input
              type="text"
              {...register("source")}
              disabled={isEditMode || isLocked}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Entered by (optional)
            </label>
            <input
              type="text"
              {...register("enteredBy")}
              disabled={isLocked}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting || isLocked}>
            {isEditMode ? "Save changes" : "Create entry"}
          </Button>
          {isEditMode && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
