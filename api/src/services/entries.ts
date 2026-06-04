import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { EntryServiceError } from "../errors.js";
import {
  createEntrySchema,
  type CreateEntryInput,
  type EntryStatus,
  type UpdateEntryInput,
  entryStatusSchema,
  updateEntryStatusSchema,
} from "../validation.js";

const STATUS_ORDER: EntryStatus[] = [
  "draft",
  "submitted",
  "approved",
  "locked",
];

export type ListEntriesFilters = {
  facilityId?: number;
  metricId?: number;
  periodStart?: Date;
  periodEnd?: Date;
  status?: EntryStatus;
};

const entryWithAudits = Prisma.validator<Prisma.EsgEntryDefaultArgs>()({
  include: { audits: { orderBy: { changedAt: "asc" } } },
});

export type EntryWithAudits = Prisma.EsgEntryGetPayload<typeof entryWithAudits>;

function parseStatus(status: string): EntryStatus {
  return entryStatusSchema.parse(status);
}

function assertForwardTransition(from: EntryStatus, to: EntryStatus): void {
  const fromIndex = STATUS_ORDER.indexOf(from);
  const toIndex = STATUS_ORDER.indexOf(to);

  if (toIndex !== fromIndex + 1) {
    throw new EntryServiceError(
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from "${from}" to "${to}"`,
    );
  }
}

function buildListWhere(
  filters: ListEntriesFilters,
): Prisma.EsgEntryWhereInput {
  const where: Prisma.EsgEntryWhereInput = {};

  if (filters.facilityId !== undefined) {
    where.facilityId = filters.facilityId;
  }
  if (filters.metricId !== undefined) {
    where.metricId = filters.metricId;
  }
  if (filters.status !== undefined) {
    where.status = filters.status;
  }
  if (filters.periodStart !== undefined) {
    where.periodEnd = { gte: filters.periodStart };
  }
  if (filters.periodEnd !== undefined) {
    where.periodStart = { lte: filters.periodEnd };
  }

  return where;
}

export async function createEntry(
  input: CreateEntryInput,
): Promise<EntryWithAudits> {
  const data = createEntrySchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const entry = await tx.esgEntry.create({
      data: {
        facilityId: data.facilityId,
        metricId: data.metricId,
        value: data.value,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        source: data.source,
        enteredBy: data.enteredBy,
      },
    });

    await tx.entryAudit.create({
      data: {
        entryId: entry.id,
        action: "create",
        newValue: data.value,
        changedBy: data.enteredBy,
      },
    });

    return tx.esgEntry.findUniqueOrThrow({
      where: { id: entry.id },
      include: { audits: { orderBy: { changedAt: "asc" } } },
    });
  });
}

export async function getEntryById(id: number): Promise<EntryWithAudits | null> {
  return prisma.esgEntry.findUnique({
    where: { id },
    include: { audits: { orderBy: { changedAt: "asc" } } },
  });
}

export async function updateEntry(
  id: number,
  input: UpdateEntryInput,
): Promise<EntryWithAudits> {
  if (!Number.isFinite(input.value)) {
    throw new Error("value must be a finite number");
  }

  const existing = await prisma.esgEntry.findUnique({ where: { id } });
  if (!existing) {
    throw new EntryServiceError("NOT_FOUND", `Entry ${id} not found`);
  }
  if (existing.status === "locked") {
    throw new EntryServiceError(
      "LOCKED",
      `Entry ${id} is locked and cannot be edited`,
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.esgEntry.update({
      where: { id },
      data: { value: input.value },
    });

    await tx.entryAudit.create({
      data: {
        entryId: id,
        action: "update",
        oldValue: existing.value,
        newValue: input.value,
        changedBy: input.changedBy,
      },
    });

    return tx.esgEntry.findUniqueOrThrow({
      where: { id },
      include: { audits: { orderBy: { changedAt: "asc" } } },
    });
  });
}

export async function setStatus(
  id: number,
  status: EntryStatus,
): Promise<EntryWithAudits> {
  const { status: nextStatus } = updateEntryStatusSchema.parse({ status });

  const existing = await prisma.esgEntry.findUnique({ where: { id } });
  if (!existing) {
    throw new EntryServiceError("NOT_FOUND", `Entry ${id} not found`);
  }

  const currentStatus = parseStatus(existing.status);
  assertForwardTransition(currentStatus, nextStatus);

  return prisma.esgEntry.update({
    where: { id },
    data: { status: nextStatus },
    include: { audits: { orderBy: { changedAt: "asc" } } },
  });
}

export async function listEntries(
  filters: ListEntriesFilters = {},
): Promise<EntryWithAudits[]> {
  return prisma.esgEntry.findMany({
    where: buildListWhere(filters),
    include: { audits: { orderBy: { changedAt: "asc" } } },
    orderBy: [{ periodStart: "desc" }, { id: "desc" }],
  });
}
