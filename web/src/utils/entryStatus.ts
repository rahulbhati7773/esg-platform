import type { EntryStatus } from "../types.js";

export const STATUS_ORDER: EntryStatus[] = [
  "draft",
  "submitted",
  "approved",
  "locked",
];

export function nextStatus(current: EntryStatus): EntryStatus | null {
  const index = STATUS_ORDER.indexOf(current);
  if (index < 0 || index >= STATUS_ORDER.length - 1) {
    return null;
  }
  return STATUS_ORDER[index + 1];
}

export function statusBadgeColor(
  status: EntryStatus,
): "gray" | "blue" | "emerald" | "red" {
  switch (status) {
    case "draft":
      return "gray";
    case "submitted":
      return "blue";
    case "approved":
      return "emerald";
    case "locked":
      return "red";
    default:
      return "gray";
  }
}

export function statusAdvanceLabel(next: EntryStatus): string {
  switch (next) {
    case "submitted":
      return "Submit";
    case "approved":
      return "Approve";
    case "locked":
      return "Lock";
    default:
      return "Advance";
  }
}
