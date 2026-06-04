export type AppRole = "data-entry" | "auditor" | "admin";

const ROLES: AppRole[] = ["data-entry", "auditor", "admin"];

export function parseAppRole(header: string | undefined): AppRole | null {
  if (!header) {
    return null;
  }
  const role = header.trim().toLowerCase();
  return ROLES.includes(role as AppRole) ? (role as AppRole) : null;
}

export class EntryPermissionError extends Error {
  readonly code = "FORBIDDEN";

  constructor(message: string) {
    super(message);
    this.name = "EntryPermissionError";
  }
}

export function assertCanCreate(role: AppRole | null): void {
  if (role !== "data-entry") {
    throw new EntryPermissionError(
      "Only data-entry users can create new entries",
    );
  }
}

export function assertCanUpdate(role: AppRole | null): void {
  if (role !== "data-entry") {
    throw new EntryPermissionError(
      "Only data-entry users can edit entry values",
    );
  }
}

import type { EntryStatus } from "../validation.js";

export function assertStatusTransitionAllowed(
  role: AppRole | null,
  from: EntryStatus,
  to: EntryStatus,
): void {
  if (role === "data-entry") {
    if (from === "draft" && to === "submitted") {
      return;
    }
    throw new EntryPermissionError(
      "Data-entry users can only submit draft entries",
    );
  }

  if (role === "auditor") {
    if (
      (from === "submitted" && to === "approved") ||
      (from === "approved" && to === "locked")
    ) {
      return;
    }
    throw new EntryPermissionError(
      "Auditors can only approve submitted entries or lock approved entries",
    );
  }

  throw new EntryPermissionError("You cannot change entry status");
}

export function assertCanEditEntryValue(
  role: AppRole | null,
  status: string,
): void {
  assertCanUpdate(role);
  if (role === "data-entry" && status !== "draft") {
    throw new EntryPermissionError(
      "Data-entry users can only edit draft entries",
    );
  }
}
