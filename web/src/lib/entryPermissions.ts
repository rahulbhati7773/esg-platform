import type { AppRole } from "../context/AuthContext.js";
import type { EntryStatus, EsgEntry } from "../types.js";

export type EntryPermissions = {
  canCreate: boolean;
  canEdit: boolean;
  /** Role may advance status along its allowed transitions (submit / approve / lock). */
  canChangeStatus: boolean;
};

export function entryPermissionsForRole(role: AppRole): EntryPermissions {
  switch (role) {
    case "data-entry":
      return {
        canCreate: true,
        canEdit: true,
        canChangeStatus: true,
      };
    case "auditor":
      return {
        canCreate: false,
        canEdit: false,
        canChangeStatus: true,
      };
    case "admin":
      return {
        canCreate: false,
        canEdit: false,
        canChangeStatus: false,
      };
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function canEditEntry(
  entry: EsgEntry,
  permissions: EntryPermissions,
  role: AppRole,
): boolean {
  if (!permissions.canEdit) {
    return false;
  }
  if (entry.status === "locked") {
    return false;
  }
  if (role === "data-entry" && entry.status !== "draft") {
    return false;
  }
  return true;
}

/** Next status this role may set, or null if no action is available. */
export function nextStatusForRole(
  current: EntryStatus,
  role: AppRole,
): EntryStatus | null {
  switch (role) {
    case "data-entry":
      return current === "draft" ? "submitted" : null;
    case "auditor":
      if (current === "submitted") {
        return "approved";
      }
      if (current === "approved") {
        return "locked";
      }
      return null;
    default:
      return null;
  }
}
