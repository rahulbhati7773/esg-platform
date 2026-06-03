import { z } from "zod";

export const entryFormSchema = z
  .object({
    facilityId: z
      .number({ message: "Select a facility" })
      .int()
      .positive("Select a facility"),
    metricId: z
      .number({ message: "Select a metric" })
      .int()
      .positive("Select a metric"),
    value: z
      .number({ message: "Value is required" })
      .finite("Value must be a valid number"),
    periodStart: z.string().min(1, "Period start is required"),
    periodEnd: z.string().min(1, "Period end is required"),
    source: z.string().optional(),
    enteredBy: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.periodStart);
      const end = new Date(data.periodEnd);
      return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());
    },
    {
      message: "Invalid date",
      path: ["periodStart"],
    },
  )
  .refine(
    (data) => new Date(data.periodEnd) >= new Date(data.periodStart),
    {
      message: "Period end must be on or after period start",
      path: ["periodEnd"],
    },
  )
  .refine((data) => Number.isFinite(data.facilityId), {
    message: "Select a facility",
    path: ["facilityId"],
  })
  .refine((data) => Number.isFinite(data.metricId), {
    message: "Select a metric",
    path: ["metricId"],
  })
  .refine((data) => Number.isFinite(data.value), {
    message: "Value is required",
    path: ["value"],
  });

export type EntryFormValues = z.infer<typeof entryFormSchema>;

export function entryToFormValues(entry: {
  facilityId: number;
  metricId: number;
  value: number;
  periodStart: string;
  periodEnd: string;
  source: string | null;
  enteredBy: string | null;
}): EntryFormValues {
  return {
    facilityId: entry.facilityId,
    metricId: entry.metricId,
    value: entry.value,
    periodStart: entry.periodStart.slice(0, 10),
    periodEnd: entry.periodEnd.slice(0, 10),
    source: entry.source ?? undefined,
    enteredBy: entry.enteredBy ?? undefined,
  };
}

export function formValuesToCreatePayload(
  values: EntryFormValues,
): {
  facilityId: number;
  metricId: number;
  value: number;
  periodStart: string;
  periodEnd: string;
  source?: string;
  enteredBy?: string;
} {
  return {
    facilityId: values.facilityId,
    metricId: values.metricId,
    value: values.value,
    periodStart: values.periodStart,
    periodEnd: values.periodEnd,
    source: values.source || undefined,
    enteredBy: values.enteredBy || undefined,
  };
}
