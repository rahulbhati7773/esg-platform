/** Rules match `ragForActual` in api/src/services/analytics.ts */
export const RAG_STATUS_RULES = [
  {
    status: "green" as const,
    label: "On track",
    formula: "Actual ≤ Target",
  },
  {
    status: "amber" as const,
    label: "At risk",
    formula: "Target < Actual ≤ Target × 1.1",
  },
  {
    status: "red" as const,
    label: "Off track",
    formula: "Actual > Target × 1.1",
  },
] as const;
