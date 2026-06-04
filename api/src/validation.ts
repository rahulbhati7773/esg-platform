import { z } from "zod";

export const entryStatusSchema = z.enum([
  "draft",
  "submitted",
  "approved",
  "locked",
]);

export const createEntrySchema = z
  .object({
    facilityId: z.number().int().positive(),
    metricId: z.number().int().positive(),
    value: z.number().finite(),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    source: z.string().optional(),
    enteredBy: z.string().optional(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "periodEnd must be on or after periodStart",
    path: ["periodEnd"],
  });

export const updateEntrySchema = z.object({
  value: z.number().finite(),
  changedBy: z.string().optional(),
});

export const updateEntryStatusSchema = z.object({
  status: entryStatusSchema,
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listEntriesQuerySchema = z.object({
  facilityId: z.coerce.number().int().positive().optional(),
  metricId: z.coerce.number().int().positive().optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  status: entryStatusSchema.optional(),
});

export const periodRangeSchema = z
  .object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "periodEnd must be on or after periodStart",
    path: ["periodEnd"],
  });

function parseCommaSeparatedDates(
  value: string,
  fieldName: string,
): { start: string; end: string } {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new z.ZodError([
      {
        code: "custom",
        message: `${fieldName} must be "start,end" ISO dates`,
        path: [fieldName],
      },
    ]);
  }
  return { start: parts[0], end: parts[1] };
}

export const periodQuerySchema = z
  .string()
  .min(1, "period is required")
  .transform((value) => {
    const { start, end } = parseCommaSeparatedDates(value, "period");
    return periodRangeSchema.parse({ periodStart: start, periodEnd: end });
  });

export const dateRangeSchema = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((data) => data.end >= data.start, {
    message: "range end must be on or after start",
    path: ["end"],
  });

export const trendQuerySchema = z.object({
  metricId: z.coerce.number().int().positive(),
  range: z
    .string()
    .min(1, "range is required")
    .transform((value) => {
      const { start, end } = parseCommaSeparatedDates(value, "range");
      return dateRangeSchema.parse({ start, end });
    }),
});

const optionalFacilityIdSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

export const facilityComparisonQuerySchema = z.object({
  metricId: z.coerce.number().int().positive(),
  period: periodQuerySchema,
  facilityId: optionalFacilityIdSchema,
});

export const reportQuerySchema = z.object({
  period: periodQuerySchema,
  facilityId: optionalFacilityIdSchema,
});

export const analyticsPeriodQuerySchema = z.object({
  period: periodQuerySchema,
  facilityId: optionalFacilityIdSchema,
});

export type EntryStatus = z.infer<typeof entryStatusSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type UpdateEntryStatusInput = z.infer<typeof updateEntryStatusSchema>;
export type PeriodRange = z.infer<typeof periodRangeSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
