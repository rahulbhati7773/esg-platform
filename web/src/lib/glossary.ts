export type GlossaryCategory =
  | "core"
  | "environmental"
  | "workflow"
  | "analytics"
  | "technical";

export type GlossaryEntry = {
  term: string;
  fullForm: string;
  definition: string;
  category: GlossaryCategory;
  /** Extra tokens matched by search (abbreviations, synonyms). */
  keywords?: string[];
};

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  core: "Core ESG",
  environmental: "Environmental metrics",
  workflow: "Data & workflow",
  analytics: "Analytics & reporting",
  technical: "Platform & technical",
};

/**
 * In-app glossary (searchable from TopBar ? button).
 * Keep in sync with ESG-PLATFORM-GUIDE.md §15 where noted.
 */
export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: "ESG",
    fullForm: "Environmental, Social, and Governance",
    definition:
      "A framework for measuring company performance beyond finance: environmental impact, social outcomes, and governance quality.",
    category: "core",
    keywords: ["environmental social governance", "sustainability"],
  },
  {
    term: "GHG",
    fullForm: "Greenhouse Gas",
    definition:
      "Gases that trap heat in the atmosphere. Operational reporting often focuses on CO₂e as a single comparable unit.",
    category: "environmental",
    keywords: ["greenhouse gas", "emissions"],
  },
  {
    term: "CO₂e",
    fullForm: "Carbon Dioxide Equivalent",
    definition:
      "A standard unit that expresses all greenhouse gases in terms of the warming impact of CO₂. Shown in tonnes on dashboards.",
    category: "environmental",
    keywords: ["co2e", "carbon", "emissions", "co2"],
  },
  {
    term: "RAG",
    fullForm: "Red, Amber, Green",
    definition:
      "Traffic-light status for targets: green = at or below target; amber = up to 10% over target; red = more than 10% over.",
    category: "analytics",
    keywords: ["traffic light", "on track", "at risk", "off track"],
  },
  {
    term: "KPI",
    fullForm: "Key Performance Indicator",
    definition:
      "A headline metric summarizing performance (e.g. total emissions or energy) for the selected reporting period.",
    category: "analytics",
  },
  {
    term: "LTIFR",
    fullForm: "Lost Time Injury Frequency Rate",
    definition:
      "Social safety metric: injuries causing lost work time, normalized per hours worked (demo unit: rate).",
    category: "environmental",
    keywords: ["safety", "injury", "social"],
  },
  {
    term: "PM",
    fullForm: "Particulate Matter",
    definition:
      "Air quality metric (fine particles), reported in µg/m³ in this platform.",
    category: "environmental",
    keywords: ["particulate", "air quality"],
  },
  {
    term: "Facility",
    fullForm: "Site / location",
    definition:
      "A plant, mine, office, or other site where ESG readings are captured. Filters and charts can scope to one or all facilities.",
    category: "workflow",
    keywords: ["site", "plant", "location"],
  },
  {
    term: "Metric",
    fullForm: "ESG metric",
    definition:
      "A measurable item (e.g. Water Withdrawal) with a unit. Belongs to Environmental, Social, or Governance category.",
    category: "workflow",
  },
  {
    term: "Entry",
    fullForm: "ESG entry / record",
    definition:
      "One reading: facility + metric + numeric value + reporting period + workflow status, with an audit history.",
    category: "workflow",
    keywords: ["esg entry", "record", "reading"],
  },
  {
    term: "Reporting period",
    fullForm: "Date range for analysis",
    definition:
      "Start and end dates used by dashboards and analytics. All KPIs and target comparisons sum entries that overlap this range.",
    category: "analytics",
    keywords: ["period", "date range", "rolling 12", "annual"],
  },
  {
    term: "Target",
    fullForm: "Performance target",
    definition:
      "Goal value for a metric (often per facility). Compared to actual summed entry values to compute RAG status.",
    category: "analytics",
  },
  {
    term: "Actual",
    fullForm: "Actual performance value",
    definition:
      "Sum of approved entry values for a metric/facility in the selected reporting period. Shown next to target in Target vs actual.",
    category: "analytics",
  },
  {
    term: "Draft",
    fullForm: "Entry status — draft",
    definition:
      "Initial state. Data entry can edit values and submit. Not yet in the auditor review queue.",
    category: "workflow",
  },
  {
    term: "Submitted",
    fullForm: "Entry status — submitted",
    definition:
      "Sent for review. Data entry cannot edit; auditor can approve or (after approval) lock.",
    category: "workflow",
  },
  {
    term: "Approved",
    fullForm: "Entry status — approved",
    definition:
      "Auditor accepted the record. Can be locked for audit seal; values are not edited by data entry.",
    category: "workflow",
  },
  {
    term: "Locked",
    fullForm: "Entry status — locked",
    definition:
      "Audit-sealed record. No further edits or status changes through normal workflow.",
    category: "workflow",
    keywords: ["sealed", "final"],
  },
  {
    term: "Audit trail",
    fullForm: "Entry audit log",
    definition:
      "History of create, update, and status changes on an entry (who, when, old/new values).",
    category: "workflow",
    keywords: ["entryaudit", "changelog"],
  },
  {
    term: "Data entry",
    fullForm: "Data entry role",
    definition:
      "User role that creates drafts, edits drafts only, and submits records for review.",
    category: "workflow",
  },
  {
    term: "Auditor",
    fullForm: "Auditor role",
    definition:
      "User role that approves submitted entries and locks approved ones. Cannot submit or edit values.",
    category: "workflow",
  },
  {
    term: "Admin",
    fullForm: "Administrator role",
    definition:
      "User role with full navigation including benchmarks and people & governance views.",
    category: "workflow",
  },
  {
    term: "Delta",
    fullForm: "Period-over-period change",
    definition:
      "Difference between current period total and previous period total for a KPI (absolute and %).",
    category: "analytics",
    keywords: ["change", "trend", "variance"],
  },
  {
    term: "Data quality",
    fullForm: "Completeness & approval coverage",
    definition:
      "Shows % of entries submitted/approved and lists facility×metric combinations with no data in the period.",
    category: "analytics",
  },
  {
    term: "Compliance score",
    fullForm: "Target compliance percentage",
    definition:
      "On the Targets page: share of metric/facility targets in green RAG status for the selected period.",
    category: "analytics",
  },
  {
    term: "Benchmark",
    fullForm: "Facility benchmark",
    definition:
      "Admin view comparing facilities against reference performance (demo benchmarks in seed data).",
    category: "analytics",
  },
  {
    term: "BRSR",
    fullForm: "Business Responsibility and Sustainability Report",
    definition:
      "India regulatory sustainability disclosure framework (listed in architecture as a future template direction).",
    category: "core",
  },
  {
    term: "GRI",
    fullForm: "Global Reporting Initiative",
    definition:
      "Widely used sustainability reporting standards for disclosures.",
    category: "core",
  },
  {
    term: "CDP",
    fullForm: "Carbon Disclosure Project",
    definition:
      "Global environmental disclosure system for climate, water, and forests.",
    category: "core",
  },
  {
    term: "API",
    fullForm: "Application Programming Interface",
    definition:
      "Express REST backend on port 5000. The web app calls /entries, /analytics, /report, etc.",
    category: "technical",
  },
  {
    term: "Live",
    fullForm: "API connectivity — online",
    definition:
      "TopBar indicator when GET /health succeeds. Offline means dashboards may show errors or empty data.",
    category: "technical",
    keywords: ["online", "offline", "connected"],
  },
  {
    term: "PoC",
    fullForm: "Proof of Concept",
    definition:
      "Local SQLite database and demo login; intended path to MySQL and real authentication in production.",
    category: "technical",
  },
  {
    term: "Prisma",
    fullForm: "Prisma ORM",
    definition:
      "Type-safe database layer in the API: schema, migrations, and queries for facilities, metrics, entries, targets.",
    category: "technical",
  },
  {
    term: "Environmental (E)",
    fullForm: "Environmental pillar",
    definition:
      "Metrics about planet impact: emissions, energy, water, waste, air quality.",
    category: "core",
  },
  {
    term: "Social (S)",
    fullForm: "Social pillar",
    definition:
      "Metrics about people: safety, training, diversity, community.",
    category: "core",
  },
  {
    term: "Governance (G)",
    fullForm: "Governance pillar",
    definition:
      "Metrics about how the organization is run: compliance, audit findings, oversight.",
    category: "core",
  },
];

export function searchGlossary(
  entries: GlossaryEntry[],
  query: string,
): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return entries;
  }
  return entries.filter((entry) => {
    const haystack = [
      entry.term,
      entry.fullForm,
      entry.definition,
      GLOSSARY_CATEGORY_LABELS[entry.category],
      ...(entry.keywords ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
