# ESG Meteor — Platform Guide

This document explains what ESG is, why this project exists, how the platform works, and what each page, component, chart, and tab does.

### Guide coverage (read this first)

| Document | Best for |
| -------- | -------- |
| **This file (`ESG-PLATFORM-GUIDE.md`)** | Product behaviour: pages, UI regions, charts, roles, workflows, field meanings |
| **`esg-platform-architecture.md`** | Technical architecture, schema diagrams, deployment shape |
| **`README.md`** | Clone, install, run, demo logins |
| **In-app ? (TopBar)** | Searchable acronyms — data in `web/src/lib/glossary.ts` |

**Fully documented in this guide:** all routed pages (§6), active dashboard building blocks on Analytics/Targets/Benchmarks (§6–7), data entry flow (§8), app shell (§9), API surface used by the UI (§10).

**Also documented below (§15–17):** hooks, permission headers, export/report contents, help UI (`GlossarySidebar`, `RagStatusHelp`), toasts/validation, period presets, and **legacy components** that exist in the repo but are **not** mounted on current routes.

---

## 1. What is ESG?

**ESG** stands for **Environmental, Social, and Governance**. It is a framework used by companies, investors, regulators, and communities to measure how an organization performs beyond financial results.


| Pillar                | What it covers              | Examples                                                                         |
| --------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| **Environmental (E)** | Impact on the natural world | Greenhouse gas (GHG) emissions, energy use, water withdrawal, waste, air quality |
| **Social (S)**        | People and communities      | Safety (LTIFR), training, diversity, community investment                        |
| **Governance (G)**    | How the organization is run | Compliance incidents, audit findings, board oversight                            |


Organizations collect ESG **metrics** (numbers with units, e.g. CO₂e in tonnes, water in kL) per **facility** (plant, mine, office) over a **reporting period** (month, quarter, year). That data feeds sustainability reports, regulatory filings (e.g. BRSR, GRI, CDP), investor disclosures, and internal improvement programs.

---

## 2. Why do we need this project?

### The problem

Many organizations still capture ESG data in **spreadsheets, emails, and local files**. That leads to:

- **No single source of truth** — the same metric may differ between sites or teams.
- **Poor audit trail** — hard to prove who entered what and when.
- **Slow reporting** — consolidating data for dashboards or annual reports is manual and error-prone.
- **Weak quality control** — no standard workflow from draft data to approved, locked records.

This project addresses **Problem #25 (Environment & Sustainability): “Unavailability of centralized platform to capture ESG data.”**

### What this platform provides

**ESG Meteor** is a centralized ESG data platform that:

1. **Captures** readings at facility level through structured forms.
2. **Validates** input (types, dates, required fields) before saving.
3. **Stores** data in a relational database with a full **audit log**.
4. **Workflows** entries through **draft → submitted → approved → locked**.
5. **Visualizes** KPIs, trends, facility comparisons, and target compliance on dashboards.
6. **Exports** Excel reports for stakeholders and auditors.

### Why it matters

- **Operations** — site teams enter meter readings and operational data once, in one place.
- **ESG / sustainability teams** — see trends and gaps without rebuilding spreadsheets.
- **Auditors** — review status, approve, and lock records with traceability.
- **Leadership** — compare facilities, track targets (RAG: red / amber / green), and export reports.

---

## 3. What is in this project?

The repository is a **monorepo** with two main applications:

```
esg-platform/
├── api/          # Backend: Express + Prisma + SQLite (PoC) / MySQL (production)
├── web/          # Frontend: React + Vite + Tailwind + Recharts
├── prisma/       # (under api/) Database schema, migrations, seed data
└── docs          # Architecture and user-story references
```

### Tech stack (summary)


| Layer      | Technology                            | Purpose                                |
| ---------- | ------------------------------------- | -------------------------------------- |
| Frontend   | React 18, Vite, TypeScript            | Single-page app, fast dev/build        |
| UI         | Tailwind CSS, Radix UI, Framer Motion | Layout, forms, animations              |
| Charts     | Recharts                              | Line, bar, area, stacked charts        |
| Backend    | Node.js, Express, TypeScript          | REST API                               |
| Database   | SQLite (local PoC), MySQL (prod path) | Relational ESG storage                 |
| ORM        | Prisma                                | Schema, migrations, type-safe queries  |
| Validation | Zod                                   | Shared rules on API (and forms on web) |
| Export     | ExcelJS (API)                         | Downloadable ESG reports               |


### Data model (core entities)


| Entity             | What it stores                                                       |
| ------------------ | -------------------------------------------------------------------- |
| **Facility**       | Sites where data is collected (name, type, location)                 |
| **MetricCategory** | Environmental, Social, or Governance                                 |
| **Metric**         | Measurable item (e.g. CO₂e, Water) with unit                         |
| **EsgEntry**       | One reading: facility + metric + value + period + status             |
| **EntryAudit**     | History of create/update/status changes                              |
| **Target**         | Target value per metric (and optionally facility) for RAG comparison |


### Seeded demo data

Running `npm run prisma:seed` in `api/` loads:

- **3 facilities** (e.g. plants and a mine site)
- **12+ metrics** across E, S, and G
- **12 months of entries** with realistic patterns
- **Targets** for key environmental metrics
- Mixed **statuses** (draft, submitted, approved, locked)

---

## 4. How the platform works (end-to-end)

```
┌─────────────────┐     REST (JSON)      ┌─────────────────┐     Prisma      ┌──────────────┐
│  React Web App  │ ◄──────────────────► │  Express API    │ ◄──────────────►│   Database   │
│  (port 5173)    │                      │  (port 5000/1)  │                 │ SQLite/MySQL │
└─────────────────┘                      └─────────────────┘                 └──────────────┘
        │                                         │
        │  Login (demo roles)                     │  Zod validation
        │  Global period/facility filters         │  Business rules (status workflow)
        │  Charts ← analytics endpoints           │  Audit log on every change
        │  Forms → POST/PUT entries               │  Aggregations for KPIs/trends
        └─────────────────────────────────────────┘
```

### Typical user flows

**Data entry specialist**

1. Log in → Dashboard shows entry counts and recent records.
2. **New entry** wizard → pick facility, metric, period, value → saved as **draft**.
3. Edit the draft if needed, then click **Submit** on **My entries** → status becomes **submitted**.
4. After submit, the record is read-only for data entry until an auditor acts.

**Auditor**

1. Dashboard shows **approval queue** (submitted + approved awaiting lock).
2. **Approve** submitted entries → **approved** (cannot edit values or submit drafts).
3. **Lock** approved entries → **locked** (no further edits by anyone).

**Administrator**

1. Full navigation: Dashboard, Analytics, Targets, Benchmarks, People & Gov, Entries.
2. Uses **Report filters** to set period and facilities.
3. **Export Report** downloads Excel for the selected scope.

### Global filters (period & facility)

Many pages share **Report filters** (`GlobalControllerPanel`):

- **Period presets:** Last 12 months, monthly, quarterly, annual (2025), or custom dates.
- **Facilities:** Multi-select chips; analytics APIs filter when one facility is selected.
- **Export:** Excel report for the current period/facility selection.

Filter state lives in `PlatformContext` so Dashboard, Analytics, Targets, and Benchmarks stay in sync.

### Entry status workflow

```
draft ──► submitted ──► approved ──► locked
```

- **Draft** — editable by data entry; not yet in official reporting.
- **Submitted** — waiting for auditor approval.
- **Approved** — validated; can still be locked for audit finality.
- **Locked** — immutable; edits and value changes are blocked.

Every create, update, and status change writes an **EntryAudit** row.

### Role permissions on entries

Each role may only perform specific actions. The UI and API enforce the same rules (`web/src/lib/entryPermissions.ts`, `api/src/lib/entryPermissions.ts`).


| Action                                 | Data entry | Auditor | Admin |
| -------------------------------------- | ---------- | ------- | ----- |
| Create new entry (starts as **draft**) | Yes        | No      | No    |
| Edit entry **value** (draft only)      | Yes        | No      | No    |
| **Submit** (draft → submitted)         | Yes        | No      | No    |
| **Approve** (submitted → approved)     | No         | Yes     | No    |
| **Lock** (approved → locked)           | No         | Yes     | No    |
| Browse / filter entries                | Yes        | Yes     | Yes   |


**Data entry users** capture readings, fix mistakes while still in **draft**, then click **Submit** to send the record for review. They cannot approve, lock, or edit after submit.

**Auditors** review the queue: **Approve** on submitted entries, then **Lock** on approved entries to seal them for audit. They cannot create entries, edit values, or submit drafts.

**Administrators** view analytics and all entries read-only; they do not change entry data or workflow status in this demo.

The `X-App-Role` request header (set from the logged-in session) is sent on every API call so the backend rejects forbidden actions with `403`.

---

## 5. User roles and navigation

The app uses **role-based navigation** (demo auth on the Login page).


| Role           | Login (demo)                              | Sidebar items                                                    |
| -------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| **Data entry** | `rahul.sharma@esgmeteor.in` / `entry123` (Rahul Sharma)     | Dashboard, Analytics, New entry, My entries                      |
| **Auditor**    | `shresht.gupta@esgmeteor.in` / `audit123` (Shresht Gupta) | Dashboard, Analytics, Targets, All entries                       |
| **Admin**      | `hitesh.singh@esgmeteor.in` / `admin123` (Hitesh Singh)    | Dashboard, Analytics, Targets, Benchmarks, People & Gov, Entries |


Routes are defined in `web/src/App.tsx`. Some routes are restricted by role (e.g. Benchmarks admin-only, New entry data-entry-only).

---

## 6. Pages — what, why, how

Each page section below includes a **Layout (top to bottom)** breakdown: every major screen region, what it shows, and why it exists — not just component names.

### 6.1 Login (`/login`)


|          |                                                                                       |
| -------- | ------------------------------------------------------------------------------------- |
| **What** | Role-based demo sign-in.                                                              |
| **Why**  | Shows how different personas see different home screens and permissions.              |
| **How**  | `AuthContext` stores user + role in session; unauthenticated users redirect to login. |


**Layout (top to bottom):**

1. **Branded panel** — Product name, short description of ESG Meteor.
  **Why:** Context for first-time demo users.
2. **Role selector** (three cards: Data Entry / Auditor / Administrator)
  Clicking a role auto-fills email and password from `AuthContext` mock credentials.  
  **Why:** Demo personas (Rahul / Shresht / Hitesh) map 1:1 to roles without memorizing logins.
3. **Sign-in form** — Email, password (show/hide), submit, inline error on failure.
  **Why:** Single gate before `AppShell`; session stored in `sessionStorage` (`esg-auth-session`).
4. **Theme toggle** (top-right of login screen)
  **Why:** Same light/dark tokens as the main app (`ThemeContext`).

**Demo accounts (see §5):** passwords stay `entry123` / `audit123` / `admin123`.

*Login is outside `AppShell` — no sidebar, TopBar, or glossary until authenticated.*

---

### 6.2 Dashboard (`/dashboard`)


|          |                                                         |
| -------- | ------------------------------------------------------- |
| **What** | Role-specific home page (not one shared layout).        |
| **Why**  | Each persona needs a different “start here” experience. |
| **How**  | `Dashboard.tsx` switches on `user.role`:                |


#### Data Entry Home (`DataEntryHome`)

**Layout (top to bottom):**

1. **Welcome header** (`surface-card`)
  Shows today’s date, a personalized greeting, and a “Data Entry Specialist” badge.  
   **Why:** Confirms who is logged in and sets context for the day’s work without opening another screen.
2. **Status count cards** (Draft / Submitted / Approved / Locked)
  Four small panels with live counts from `listEntries`.  
   **Why:** Operators see at a glance how much work is still draft vs already in the approval pipeline.
3. **New Entry CTA** (dashed card with link to `/entries/new`)
  Prominent shortcut to the entry wizard.  
   **Why:** The most common action for this role should be one click away from the home page.
4. **Recent entries list** (`PanelCard` table-style rows)
  Last eight entries with facility, metric, value, period, and status badge; “View all” links to `/entries`.  
   **Why:** Quick sanity check on what was entered recently without loading the full filtered table.

**How:** Calls `listEntries`, `getFacilities`, `getMetrics`; no global report filters on this page (operational focus, not analytics).

#### Auditor Home (`AuditorHome`)

**Layout (top to bottom):**

1. **Welcome header + refresh control**
  Greeting, queue summary (“N entries need your attention”), Auditor badge, and refresh button.  
   **Why:** Auditors need an immediate sense of backlog size and a way to reload after actions.
2. **Queue stats row** (3 columns)
  - **Awaiting approval** — count of `submitted` entries  
  - **Awaiting lock** — count of `approved` entries  
  - **All entries** — link card to the full entries table  
   **Why:** Separates the two auditor actions (approve vs lock) so nothing is missed.
3. **Two-column review queue** (stacks on mobile)
  - **Needs Approval** — cards for submitted entries with **Approve** button  
  - **Needs Lock** — cards for approved entries with **Lock** button  
   Each card shows facility, metric, value, period, and role-allowed action only.  
   **Why:** Prioritized work surface; auditors do not edit values or submit drafts here.

**How:** Loads `listEntries` filtered by status; **Approve** / **Lock** call `updateEntryStatus` with auditor-only transitions.

#### Admin Home (`AdminHome`)

**Layout (top to bottom):**

1. **Welcome header**
  Date, greeting, “Platform Administrator” badge.  
   **Why:** Leadership landing zone distinct from operator/auditor homes.
2. **Hero KPI row** (`HeroKpiRow` — four stat cards)
  Emissions, energy, water, waste with period-over-period delta. Uses default platform period (Last 12 months).  
   **Why:** Executives get headline environmental numbers without navigating to Analytics first.
3. **Two-column section** (quick links + data quality)
  - **Quick navigation** — links to Analytics, All Entries, Target Status  
  - **Data quality** (`DataQuality` panel) — submission/approval % rings and missing-data hints  
   **Why:** Combines “where to go next” with “is our data ready to report?” on one screen.

**How:** Embeds shared dashboard widgets; quick links route to `/analytics`, `/entries`, and a third link labelled **Target Status** that currently also goes to **`/analytics`** (the dedicated targets page is **`/targets`** via the sidebar).

---

### 6.3 Analytics (`/analytics`)


|          |                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| **What** | Full environmental and operational analytics dashboard.                                                            |
| **Why**  | Central place for charts, KPIs, targets, and data quality for reporting periods.                                   |
| **How**  | `AnalyticsPage.tsx` stacks shared dashboard components; all data-driven panels react to `PlatformContext` filters. |


**Layout (top to bottom):**

1. **Page header**
  Title “Analytics”, subtitle, and icon.  
   **Why:** Orients the user on a long scroll page with many charts.
2. **Report filters** (`GlobalControllerPanel`)
  Period preset (Last 12 months, monthly, quarterly, annual, custom dates), facility chips, active date range display, and **Export report** (Excel).  
   **Why:** Every chart and KPI below uses the same period and site scope — change filters once, refresh everything. Export uses the same scope for auditor-ready spreadsheets.
3. **Hero KPI row** (`HeroKpiRow` + `KpiStatCard`)
  Four cards: **Emissions**, **Energy**, **Water**, **Waste** — each shows total for the period, unit, and % change vs the prior period (colour indicates good/bad direction).  
   **Why:** Answers “how are we doing overall?” in seconds before drilling into charts. Sourced from `/analytics/kpis`.
4. **Environmental performance** (`EnvironmentalPerformance` + `EnvPerformanceAreaChart`)
  Area chart of **CO₂e / GHG emissions** over time for the selected period.  
   **Why:** Emissions are the primary regulatory and investor metric; this is the default trend view. Uses `/analytics/trend` for the emissions metric from the catalogue.
5. **Metric trend panel** (`MetricTrendPanel`)
  Dropdown to pick any metric + line chart of its trend over the period.  
   **Why:** Lets analysts go beyond emissions (e.g. water, waste) without leaving Analytics. Same trend API, user-chosen metric.
6. **GHG stacked chart + Facility comparison** (two columns on large screens)
  - **Left — `GhgStackedChart`:** Stacked bars per month for emissions, energy, and water together.  
   **Why:** Shows how the environmental footprint mix shifts over time.  
  - **Right — `FacilityComparisonPanel`:** Bar chart comparing sites for a selected metric.  
  **Why:** Answers “which facility is driving this number?” Uses `/analytics/facility-comparison`.
7. **Target status + Compare metrics** (responsive grid; full-width target panel + sidebar compare below 1000px)
  - **Left — `TargetStatusPanel`:** Table of actual vs target with RAG (green/amber/red) badges per metric/facility.  
   **Why:** Links performance to commitments — critical for compliance reporting.  
  - **Right — `CompareMetricsPanel`:** Compact list of key metrics with actual vs target % variance and up/down indicators.  
  **Why:** Quick scan of over/under-target metrics without reading the full table.
8. **Data quality** (`DataQuality`)
  Circular rings for % entries **submitted** and **approved**, plus a scrollable list of missing facility×metric combinations for the period.  
   **Why:** A dashboard is misleading if data is incomplete; this surfaces gaps before export or board reporting. Uses `/analytics/data-quality`.

---

### 6.4 Targets & Compliance (`/targets`)


|          |                                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| **What** | Dedicated target vs actual performance with RAG status and compliance score.                                           |
| **Why**  | Sustainability teams must know which metrics are on track before year-end; deeper than the summary table on Analytics. |
| **How**  | `getTargets(period, facilityId)`; grouped by metric with animated progress bars.                                       |


**Layout (top to bottom):**

1. **Page header** — Title, subtitle, target icon.
  **Why:** Clear separation from Analytics; this page is for compliance depth, not general trends.
2. **Report filters** (`GlobalControllerPanel`) — Same period/facility/export controls as Analytics.
  **Why:** Target comparisons must align with the reporting window used elsewhere.
3. **Compliance summary row** (4 tiles)
  - **Compliance score** — donut showing % of targets met (green RAG count ÷ total)  
  - **On track / At risk / Off track** — counts for green, amber, red targets  
   **Why:** Single-glance health check before drilling into per-metric cards.
4. **Per-metric groups** (repeated sections)
  For each metric (e.g. CO₂e, Water): section header with RAG dot per facility, then a grid of **TargetRow** cards. Each card shows facility, actual vs target, progress bar, % of target, and variance.  
   **Why:** Facility-level accountability — leadership sees which site missed which target.

**RAG rules (API — `ragForActual` in `api/src/services/analytics.ts`):**

| Status | Condition | Meaning |
| ------ | --------- | ------- |
| **green** | `actual ≤ target` | On or below target |
| **amber** | `target < actual ≤ target × 1.1` | Over target but not more than 10% |
| **red** | `actual > target × 1.1` | More than 10% above target |

**Note:** Targets in seed data are **annual** values; if the global period is “Last 12 months”, actual may be a partial sum — many rows can look green. Use **Annual (2025)** in report filters for demo RAG variety.

---

### 6.5 Facility Benchmarks (`/benchmarks`) — Admin only


|          |                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| **What** | Compare all facilities for any selected metric.                                                                    |
| **Why**  | Identify best and worst performing sites for the same KPI — supports capital allocation and best-practice sharing. |
| **How**  | Metric sidebar + bar chart + ranking cards from `getFacilityComparison`.                                           |


**Layout (top to bottom):**

1. **Page header** — “Facility Benchmarks” title and description.
  **Why:** Admin-only benchmarking is a distinct workflow from the Analytics facility chart.
2. **Report filters** (`GlobalControllerPanel`) — Period and facility scope.
  **Why:** Benchmarks must use the same reporting window as other leadership views.
3. **Two-column main area** (sidebar + chart on desktop; stacks on mobile)
  - **Left — Metric selector** (`PanelCard`): Metrics grouped by Environmental / Social / Governance; click to select. Shows unit under each name.  
   **Why:** One metric at a time keeps the comparison fair (same unit, same definition).  
  - **Right — Bar chart** (`Recharts`): Total per facility for the selected metric.  
  **Why:** Visual ranking of sites.  
  - **Below chart — Ranking cards** (one per facility): Rank #, Highest/Lowest/Mid badge, value, and % bar vs max.  
  **Why:** Numeric detail and labels for presentations without reading chart axes.

---

### 6.6 People & Governance (`/social`) — Admin & Auditor


|          |                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **What** | Social and governance metrics with sparkline-style area charts.                                                                            |
| **Why**  | ESG is not only environmental; workforce safety, training, diversity, community spend, and governance incidents need dedicated visibility. |
| **How**  | `SparkCard` per metric; trends from `getTrend` for calendar year 2025.                                                                     |


**Layout (top to bottom):**

1. **Page header** — “People & Governance” title and subtitle.
  **Why:** Signals S+G focus separate from the environmental-heavy Analytics page.
2. **Social section** (section divider + grid of cards)
  Metrics: **LTIFR**, **Training Hours**, **Diversity**, **Community Spend**. Each **SparkCard** includes icon, description, period total, month-over-month % badge (green/red by whether lower-is-better), and mini area chart.  
   **Why:** Social KPIs are tracked by HR and HSE teams; sparklines show direction without a full dashboard per metric.
3. **Governance section** (section divider + grid of cards)
  Metrics: **Compliance Incidents**, **Audit Findings**. Same **SparkCard** pattern.  
   **Why:** Governance metrics are lower volume but high severity; dedicated cards avoid burying them under environmental charts.

*Note:* This page uses a fixed 2025 trend range internally and does not include `GlobalControllerPanel` — it is a thematic overview of S/G metrics.

---

### 6.7 Entries (`/entries`)


|          |                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------ |
| **What** | List, filter, edit, and advance status of ESG entries.                                                 |
| **Why**  | Primary operational screen for managing the data lake and workflow.                                    |
| **How**  | Role-based actions via `entryPermissions.ts` (data entry submits drafts; auditor approves/locks only). |


**Layout (top to bottom):**

1. **Page header row**
  Title (“My Entries” or “All Entries”), description of allowed actions, and **New entry** button (data entry only).  
   **Why:** Role-specific copy sets expectations before users interact with the table.
2. **Inline edit form** (`EntryForm`) — Shown only when editing a draft (data entry) and an entry is selected.
  **Why:** Edit in context without a separate page; disappears after save or cancel.
3. **Entries table** (`EntriesTable` inside `PanelCard`)
  - **Filter row:** Facility, metric, status, period from/to (`FormSelect` + `FormDatePicker`).  
  - **Data area:** Mobile card list / desktop scrollable table (`max-h 640px`) with facility, metric, value, status workflow badge, and actions.  
  - **Actions (role-based):** Data entry — **Edit** (draft only) + **Submit**; Auditor — **Approve** or **Lock** only; Admin — browse only.  
   **Why:** Single place to find records, filter large datasets, and perform the one allowed workflow step per role.

---

### 6.8 New Entry Wizard (`/entries/new`) — Data entry User only


|          |                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| **What** | Three-step guided flow to create a new ESG reading.                                                               |
| **Why**  | Reduces errors for occasional users vs one long form; validates each step before continuing.                      |
| **How**  | Animated stepper; final step calls `createEntry` → **draft** status; user **Submits** from My entries when ready. |


**Layout (top to bottom):**

1. **Wizard header** — Back link, title, step indicator (1 → 2 → 3).
  **Why:** Progress visibility reduces abandonment on multi-step forms.
2. **Step 1 — Facility & metric**
  Pick site from facility list; pick metric (grouped by category with unit shown).  
   **Why:** Establishes *where* and *what* is being measured before values are entered.
3. **Step 2 — Period & value**
  Period start/end date pickers, numeric value, optional source and entered-by fields.  
   **Why:** Captures the reading itself with date validation (end ≥ start).
4. **Step 3 — Review & save**
  Summary of all choices; confirm creates the record as **draft** (not submitted).  
   **Why:** Final sanity check; submission is a deliberate second action on the entries page.

---

### 6.9 Data Entry (`/data-entry`)

Redirects to `/entries`. Legacy route kept for bookmarks.

---

## 7. Dashboard & analytics components

These are the **building blocks** used inside page layouts (especially Analytics and Admin Dashboard). Section **6.3** describes how they are stacked on the Analytics page; this section documents each component in isolation.

### 7.1 `GlobalControllerPanel`


|          |                                                                                    |
| -------- | ---------------------------------------------------------------------------------- |
| **What** | Shared filter bar: period preset, custom dates, facility chips, **Export Report**. |
| **Why**  | One place to control what period and sites all analytics reflect.                  |
| **How**  | Reads/writes `PlatformContext`; export calls `downloadExcelReport`.                |


---

### 7.2 `HeroKpiRow` + `KpiStatCard`


|          |                                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | Four headline KPIs: **Emissions**, **Energy**, **Water**, **Waste**.                                                                                                 |
| **Why**  | Executives expect top-line environmental numbers first.                                                                                                              |
| **How**  | `getKpis(period, facilityId)`; matches API metrics via `kpiConfig.ts`; shows value, unit, and period-over-period delta (green/red based on whether lower is better). |


---

### 7.3 `EnvironmentalPerformance` + `EnvPerformanceAreaChart`


|          |                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | Area chart of **CO₂e / emissions** over the selected period.                                                                                   |
| **Why**  | Emissions are the most tracked environmental KPI.                                                                                              |
| **How**  | Finds emissions metric from catalogue; `getTrend` → `trendSeriesToChartPoints` → Recharts area chart. Theme-aware stroke colors for dark mode. |


---

### 7.4 `MetricTrendPanel`


|          |                                                                        |
| -------- | ---------------------------------------------------------------------- |
| **What** | User-selectable metric trend line chart.                               |
| **Why**  | Lets analysts drill into any metric beyond the default emissions view. |
| **How**  | Metric dropdown + `getTrend`; line chart with formatted axes.          |


---

### 7.5 `GhgStackedChart`


|          |                                                                                            |
| -------- | ------------------------------------------------------------------------------------------ |
| **What** | Stacked bar chart of **Emissions**, **Energy**, and **Water** by period.                   |
| **Why**  | Shows combined environmental footprint shape over time.                                    |
| **How**  | `listEntries` for period → aggregates by month in the client via `chartData.ts` (no dedicated stacked-chart API) → Recharts stacked bars. |


---

### 7.6 `FacilityComparisonPanel` / `FacilityComparison`


|          |                                                        |
| -------- | ------------------------------------------------------ |
| **What** | Bar chart comparing facilities for a selected metric.  |
| **Why**  | Answers “which site is driving this number?”           |
| **How**  | `getFacilityComparison(metricId, period, facilityId)`. |


---

### 7.7 `TargetStatusPanel`


|          |                                                                     |
| -------- | ------------------------------------------------------------------- |
| **What** | Table of metrics with actual vs target and RAG badges.              |
| **Why**  | Compact target view inside Analytics (full detail on Targets page). |
| **How**  | `getTargets(period, facilityId)` → `/analytics/targets`; tabular layout. |


**Table columns**


| Column | API field | Meaning |
| ------ | --------- | ------- |
| Metric | `metric` | Target metric name |
| Facility | `facility` | Site name or “All facilities” |
| Actual | `actual` | Sum of entry values overlapping report period |
| Target | `target` | Configured `targetValue` |
| Status | `rag` | green / amber / red (not draft/submitted) |

**`RagStatusHelp` (? next to Status header):** Hover/focus popover explains RAG and the three formulas (see §6.4). Implemented in `web/src/components/ui/RagStatusHelp.tsx` using `web/src/lib/ragStatus.ts`.


---

### 7.8 `CompareMetricsPanel`


|          |                                                                                          |
| -------- | ---------------------------------------------------------------------------------------- |
| **What** | Sidebar “Compare” list beside `TargetStatusPanel` on Analytics (top 6 target rows).       |
| **Why**  | Quick scan of over/under-target metrics without reading the full table.                   |
| **How**  | Same `getTargets` API; shows cards with % variance vs target.                           |


**Each compare card (fields)**


| UI label | Source | Meaning |
| -------- | ------ | ------- |
| Title | `metric` (uppercased) | Which KPI |
| Large number | `actual` | Period total |
| Subtitle | `facility` | Site or “All facilities” |
| Badge | `(actual − target) / target × 100` | % vs target; arrow up if over target |
| Card colour | `rag === "green"` | Green-tinted if on track, red-tinted otherwise |

**Why only six items:** `targets.slice(0, 6)` keeps the sidebar compact on narrow layouts.


---

### 7.9 `DataQuality`


|          |                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| **What** | Circular progress rings (% **submitted**, % **approved**) and list of **missing** facility×metric combinations.      |
| **Why**  | Reporting is only as good as complete, approved data.                                                                |
| **How**  | `getDataQuality(period, facilityId)`; rings use SVG animation; missing rows link toward data entry where applicable. |


---

### 7.10 In-app help: `GlossarySidebar` + `RagStatusHelp`

| Component | What | Why | How |
| --------- | ---- | --- | --- |
| **`GlossarySidebar`** | Right-side panel (macOS-style slide-in) with searchable definitions | Operators should decode ESG jargon without leaving the app | Opened from TopBar **?**; data from `web/src/lib/glossary.ts`; `ShellContext.glossaryOpen`; Esc or backdrop closes |
| **`RagStatusHelp`** | Small **?** beside “Status” in `TargetStatusPanel` | Explains RAG vs workflow status and calculation rules | CSS `group-hover` popover; rules in `web/src/lib/ragStatus.ts` |

---

### 7.11 Legacy / alternate dashboard modules (not on current routes)

These files exist in `web/src` but are **not** imported by `AnalyticsPage` or `App.tsx` today. Documented so you know they are not missing from the live app by accident.

| Component | What it would do | Status |
| --------- | ---------------- | ------ |
| `AnalyticsTabs` | Tabbed Analytics (Overview / Compliance / Trends) wrapping `ComplianceRagPanel`, `EnvironmentalTrends`, etc. | Unused — `AnalyticsPage` uses a single scroll layout instead |
| `AnalyticsDashboard` | Older combined analytics layout | Unused |
| `ComplianceRagPanel` | Target vs actual table using `RagIndicator` dots (older styling) | Only referenced from `AnalyticsTabs` |
| `KpiCards` | Alternate KPI grid | Unused — replaced by `HeroKpiRow` |
| `EnvironmentalTrends` | Multi-metric trend section | Unused on current Analytics page |
| `AuditorQueue` | Standalone queue page component | **Not routed** — auditor work happens on `AuditorHome` + `/entries` instead |
| `DataEntry.tsx` | Legacy page | Redirect only → `/entries` (§6.9) |

---

## 8. Data entry components

### 8.1 `EntryForm`


|          |                                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| **What** | Create or edit an entry: facility, metric, value, period, optional source/entered-by.                                      |
| **Why**  | Structured capture with validation beats free-text spreadsheets.                                                           |
| **How**  | React Hook Form + Zod (`entryForm.ts`); `FormSelect` and `FormDatePicker`; POST or PUT to API. Locked entries cannot edit. |


---

### 8.2 `EntriesTable`


|          |                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | Scrollable table of entries with filters (facility, metric, status, period range).                                                                                                          |
| **Why**  | Operations need to find and act on many records.                                                                                                                                            |
| **How**  | `listEntries(filters)`; sticky header; status badges; **Advance status** and **Edit** actions per role; `max-h-[640px] overflow-auto` for vertical scroll (works with Lenis nested scroll). |


**Role actions (mirrors `web/src/lib/entryPermissions.ts`)**


| Role | Edit values | Advance status |
| ---- | ----------- | -------------- |
| Data entry | Draft only | draft → submitted |
| Auditor | — | submitted → approved; approved → locked |
| Admin | — | — |

On viewports below `md`, the same rows render as **cards** instead of a table (same actions).

---

### 8.3 `FormSelect` / `FormDatePicker`


|          |                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **What** | Accessible dropdown and calendar controls (Radix + react-day-picker).                                                        |
| **Why**  | Native selects/date inputs were inconsistent across browsers and themes.                                                     |
| **How**  | Styled via `index.css` (`.form-trigger`, `.form-dropdown`, `.form-calendar`). Used in forms, filters, and global controller. |


---

### 8.4 `StatusWorkflow` / `RagIndicator` / `DeltaPill`


|          |                                                                          |
| -------- | ------------------------------------------------------------------------ |
| **What** | Small UI primitives for status badges, RAG dots, and KPI delta pills.    |
| **Why**  | Consistent visual language across tables and cards.                      |
| **How**  | Pure presentation; driven by entry status or analytics RAG/delta values. |


**Field behaviour**

| Component | Used for | Key props / output |
| --------- | -------- | ------------------ |
| `StatusWorkflow` | Entry pipeline badge in tables | Maps `draft` → `submitted` → `approved` → `locked` with colours |
| `RagIndicator` | Dot + label for target RAG | `status`: green \| amber \| red |
| `DeltaPill` | KPI card footer | `trendText`, `trendPositive` from `KpiSummaryItem` |

---

### 8.5 `Toast`

|          |                                                                 |
| -------- | --------------------------------------------------------------- |
| **What** | Temporary success/error message (e.g. after save on Entries page). |
| **Why**  | Confirms actions without modal dialogs.                         |
| **How**  | `EntriesPage` local state; auto-dismiss; used for edit lock errors and save confirmation. |

---

### 8.6 `entryForm.ts` (Zod schema)

| Field | Validation | Why |
| ----- | ---------- | --- |
| `facilityId` | Required number | Must link to a real site |
| `metricId` | Required number | Must link to catalogue metric |
| `value` | Positive number | Readings must be numeric and > 0 |
| `periodStart` / `periodEnd` | ISO dates; end ≥ start | Valid reporting window |
| `source`, `enteredBy` | Optional strings | Audit metadata |

Wizard and `EntryForm` share this schema so API and UI reject the same bad input.

---

## 9. Layout & shell components

The authenticated app uses a **persistent shell** on every page (except Login). Page content renders inside the main area; the shell provides navigation, theme, connectivity, and scroll behaviour.

### App layout structure

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar (nav)  │  TopBar (menu, API status, theme, user)   │
│                 ├────────────────────────────────────────────┤
│  Logo + user    │  <main> — page content (Outlet)            │
│  Role nav links │  (Dashboard, Analytics, Entries, etc.)     │
│                 │                                             │
└──────────────────────────────────────────────────────────────┘
```

**Why this structure:** Sidebar holds primary navigation (always visible on desktop); TopBar holds global controls that apply to every page; `<main>` is the only region that changes per route — familiar dashboard pattern for enterprise apps.

---

### 9.1 `AppShell`


|          |                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| **What** | Root layout wrapper: `SmoothScrollProvider` → `ShellProvider` → flex row (Sidebar + column with TopBar + main).      |
| **Why**  | One place to mount providers and consistent chrome so individual pages only define their inner content.              |
| **How**  | React Router `<Outlet />` renders the active page inside `<main>`. Padding and scroll styling applied at main level. |


**Regions it defines:**

- **Outer flex container** — full viewport height, background token.  
- **Main content column** — grows to fill space; prevents horizontal overflow on small screens (`min-w-0`, `overflow-x-hidden`).

---

### 9.2 `Sidebar`


|          |                                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | Left navigation: logo, user card (desktop expanded), role-based links, collapse on desktop, slide-in drawer on mobile.                                               |
| **Why**  | Each role sees only relevant destinations (data entry does not see Benchmarks; admin sees full set). Reduces clutter and mistaken access.                            |
| **How**  | `NAV_BY_ROLE` maps role → links; `NavLink` with animated active indicator (`layoutId="sidebarActive"`); mobile uses backdrop + drawer via `ShellContext.mobileOpen`. |


**Layout pieces inside the sidebar:**

1. **Logo block** — “ESG Meteor” branding + globe icon; collapses to icon-only when sidebar is narrow.
2. **User card** (expanded mode) — Avatar initials, name, role badge (Data Entry / Auditor / Admin).
3. **Nav links** — Icon + label per route; tap closes mobile drawer.

---

### 9.3 `TopBar`


|          |                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | Sticky header: menu, title, theme, glossary help, API status, profile menu.                                                                       |
| **Why**  | Global actions reachable on every authenticated page.                                                                                              |
| **How**  | `useApiConnectivity` (30s poll of `/health`); `ThemeContext`; `ShellContext` for sidebar + glossary.                                                |


**Layout (left → right):**

1. **Menu button** — Collapse sidebar (desktop) or open mobile drawer.
2. **Title block** — “ESG reporting” / subtitle (hidden on very small screens).
3. **Theme toggle** — Light/dark (`localStorage` key `esg-platform-theme`).
4. **Help (? )** — Opens `GlossarySidebar` from the right; highlighted while open.
5. **Live / Offline pill** — `useApiConnectivity`: online when `/health` succeeds within 5s.
6. **Profile menu** — Avatar initials, name, role title, **Sign out** (clears session, → `/login`).

---

### 9.4 `SmoothScrollProvider`


|          |                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| **What** | Lenis smooth scrolling on the document root.                                                                |
| **Why**  | Long pages (Analytics) feel polished; wheel scrolling is eased.                                             |
| **How**  | Lenis RAF loop; `allowNestedScroll: true` so inner scroll areas (entries table) still receive wheel events. |


---

### 9.5 `GlobalControllerPanel` (report filters — layout block on analytics pages)

Although defined under dashboard components, this panel is a **layout region** repeated on Analytics, Targets, and Benchmarks.


|          |                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | Card with period preset dropdown, optional custom date range, facility chip multi-select, active range label, and Export report button. |
| **Why**  | Synchronizes all charts on a page to one reporting scope; avoids mismatched dates between KPI cards and charts.                         |
| **How**  | Reads/writes `PlatformContext` (`period`, `periodPreset`, `facilityIds`); export calls `downloadExcelReport` with same params.          |


**Sub-regions:**

- **Header row** — “Report filters” title + current date span + export CTA.  
- **Period controls** — Preset select; custom from/to pickers when preset is “Custom range”.  
- **Facility chips** — “All sites” or toggle individual facilities; warning if multiple selected (API filters by first site).

---

### 9.6 Shared UI wrappers used in layouts


| Component            | Role in layout                                                                           | Why                                                       |
| -------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `**PanelCard`**      | Bordered rounded container for sections (entries table, benchmark sidebar, spark cards). | Consistent card rhythm and spacing across pages.          |
| `**surface-card**`   | CSS utility for elevated panels (welcome headers, wizard steps).                         | Visual hierarchy — headers feel “above” plain background. |
| `**page-container**` | Max-width + horizontal padding utility on some pages.                                    | Keeps line length readable on ultra-wide monitors.        |
| `**Skeleton**`       | Placeholder shimmer while API loads.                                                     | Layout does not jump when data arrives.                   |
| `**ChartPanel**`     | Title + optional description + optional controls slot above a chart.                     | Used by `MetricTrendPanel`, `FacilityComparison`, legacy `EnvironmentalTrends`. |
| `**AnimatedFieldError**` | Inline validation message under form fields.                                        | `EntryForm` / wizard show Zod errors with motion.          |


---

### 9.7 Context providers (layout behaviour)


| Context           | What it controls                                        | Why it matters for layout                                   |
| ----------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `AuthContext`     | User, role, login/logout                                | Sidebar nav items and page permissions.                     |
| `PlatformContext` | Period preset, date range, facility selection           | Report filter panel and all analytics widgets stay in sync. |
| `ThemeContext`    | Light / dark mode                                       | TopBar toggle; chart colours and surfaces.                  |
| `ShellContext`    | Sidebar collapsed, mobile drawer, **glossary panel open**, body scroll lock | Mobile nav, glossary overlay, sidebar width.                |


---

### 9.8 `GlossarySidebar`

|          |                                                                 |
| -------- | --------------------------------------------------------------- |
| **What** | Full-height panel sliding in from the **right** with search.      |
| **Why**  | Self-service definitions for ESG, GHG, RAG, roles, workflow terms. |
| **How**  | Rendered in `AppShell`; `searchGlossary()` filters `GLOSSARY_ENTRIES`; grouped by category. |

---

## 10. Backend API (overview)

Base URL configured in `web/.env` as `VITE_API_URL` (e.g. `http://localhost:5000` or `5001`).


| Endpoint group                                                                   | Purpose                    |
| -------------------------------------------------------------------------------- | -------------------------- |
| `GET /health`                                                                    | API health check           |
| `GET /facilities`, `/metrics`, `/categories`                                     | Master data catalogue      |
| `POST /entries`, `PUT /entries/:id`, `PATCH /entries/:id/status`, `GET /entries` | CRUD + workflow            |
| `GET /analytics/kpis`                                                            | KPI totals and deltas      |
| `GET /analytics/trend`                                                           | Time series for one metric |
| `GET /analytics/facility-comparison`                                             | Per-facility totals        |
| `GET /analytics/targets`                                                         | Target vs actual + RAG     |
| `GET /analytics/data-quality`                                                    | Submission rates and gaps  |
| `GET /report/excel`                                                              | Excel export (used by UI)  |
| `GET /report/pdf`                                                                | PDF export (API only — not wired in web UI yet) |


### Request headers (demo permissions)

The web client sends **`X-App-Role`** on every API call (`web/src/api.ts` interceptor), read from the logged-in user’s role in `sessionStorage`.

| Role header | Create entry | Edit values | Status transitions |
| ----------- | ------------ | ----------- | ------------------ |
| `data-entry` | Yes | Draft only | draft → submitted |
| `auditor` | No | No | submitted → approved; approved → locked |
| `admin` | No | No | No |
| (missing/invalid) | Denied on protected routes | | |

Server rules: `api/src/lib/entryPermissions.ts` → HTTP **403** with message; `errorHandler` maps `EntryPermissionError`.

### Excel report contents (`buildExcelReport`)

| Sheet / section | Contents |
| --------------- | -------- |
| **Summary** | Period, facility scope, KPI totals + deltas, target RAG table |
| **Details** | Row per entry: facility, category, metric, unit, period, value, status |

Filename pattern: `esg-report-{start}-{end}.xlsx`. Triggered from `GlobalControllerPanel` → `downloadExcelReport`.

### Validation and services

- **Validation:** `api/src/validation.ts` (Zod query/body schemas, period string `start,end`).
- **Entries:** `api/src/services/entries.ts` (CRUD, audits on change).
- **Analytics:** `api/src/services/analytics.ts` (KPIs, trend, comparison, targets, data quality).
- **Reports:** `api/src/services/reports.ts` (Excel + PDF builders).

### CORS (local dev)

In development, any `http://localhost:*` / `http://127.0.0.1:*` origin is allowed in addition to `CORS_ORIGIN`, so Vite ports 5173, 5174, etc. work (`api/src/middleware/cors.ts`).

---

## 11. Charts reference (quick lookup)


| Chart                     | Type              | Data source                          | Page(s)                      |
| ------------------------- | ----------------- | ------------------------------------ | ---------------------------- |
| Hero KPI cards            | Stat + delta      | `/analytics/kpis`                    | Dashboard (admin), Analytics |
| Environmental performance | Area              | `/analytics/trend` (emissions)       | Analytics                    |
| Metric trend              | Line              | `/analytics/trend` (selected metric) | Analytics                    |
| GHG stacked               | Stacked bar       | `listEntries` + aggregation          | Analytics                    |
| Facility comparison       | Bar               | `/analytics/facility-comparison`     | Analytics, Benchmarks        |
| Target progress           | Bar / table + RAG | `/analytics/targets`                 | Analytics, Targets           |
| Data quality rings        | SVG progress      | `/analytics/data-quality`            | Dashboard (admin), Analytics |
| Social / Gov sparklines   | Area (mini)       | `/analytics/trend`                   | People & Gov                 |


All charts respect **dark mode** via CSS variables (`--chart-axis`, `--chart-grid`) and theme-aware series colors where needed.

---

## 12. Running the project (quick start)

```bash
# Terminal 1 — API
cd api
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev          # default :5000

# Terminal 2 — Web
cd web
npm install
npm run dev          # default :5173
```

Open the web app, log in with a demo account, and use **Analytics** with period **Last 12 months** to align with seeded 2025 data.

---

## 13. Production direction (from architecture)

- **Database:** Switch Prisma from SQLite to **MySQL** (one config change + migrate).
- **Deployment:** **Hybrid** — sites enter data locally; cloud instance aggregates for group reporting.
- **Auth:** Replace demo login with JWT + RBAC (data-entry / approver / auditor / admin).
- **Roadmap:** Auto emission factors, intensity metrics, regulatory templates (BRSR/GRI/CDP), meter/ERP ingest.

---

## 14. Hooks, utilities & shared config (not UI components)

| Module | What | Why | How |
| ------ | ---- | --- | --- |
| `useApiConnectivity` | Polls `GET /health` every 30s | TopBar Live/Offline indicator | Returns `online` \| `offline` \| `checking` |
| `periodPresets.ts` | Maps preset → `periodStart`/`periodEnd` | One filter drives all analytics | `rolling12`, `monthly`, `quarterly`, `annual`, `custom`; seed year **2025** for annual/monthly demos |
| `kpiConfig.ts` | Maps API metric names → KPI card labels/icons | Hero row shows Emissions/Energy/Water/Waste consistently | Pattern match on metric name substrings |
| `chartData.ts` | `SEED_DATA_YEAR` constant | Social page and presets align with seeded data | Used by charts that assume 2025 demo data |
| `entryPermissions.ts` (web) | Role capabilities + `nextStatusForRole` | UI hides illegal buttons before API 403 | Mirrors server transitions |
| `entryStatus.ts` | `statusAdvanceLabel()` | Button text: Submit / Approve / Lock | Pure presentation |
| `glossary.ts` | `GLOSSARY_ENTRIES` + `searchGlossary` | In-app ? sidebar | Add terms here when UI introduces new labels |
| `ragStatus.ts` | `RAG_STATUS_RULES` copy | `RagStatusHelp` popover | Matches `ragForActual` on server |
| `motion.ts` | Framer Motion presets | Consistent page enter animations | `staggerContainer`, `drawerTransition`, etc. |
| `cn.ts` | `clsx` + `tailwind-merge` | Conditional class names | Used across components |

---

## 15. Seeded demo catalogue (what appears in the UI)

After `npm run prisma:seed` (`api/prisma/seed.ts`):

| Type | Demo content | Why |
| ---- | ------------ | --- |
| **Facilities** | Plant A (Sheffield), Plant B (Leeds), Mine Site C (Pilbara) | Different scales via `factor` multiplier |
| **Metrics** | 12 metrics across E, S, G (CO₂e, Energy, Water, Waste, LTIFR, Training, …) | Covers all three pillars in charts |
| **Entries** | 12 months of 2025 per facility×metric | Powers trends and KPIs |
| **Targets** | Environmental metrics only; multipliers 1.05 / 0.98 / 0.82 per site | Drives green/amber/red when period = full year |
| **Statuses** | Mixed draft, submitted, approved, locked | Exercises each role’s actions |

---

## 16. Architecture doc vs this guide

| Topic | In `esg-platform-architecture.md` | In this guide |
| ----- | --------------------------------- | ------------- |
| Schema tables, hybrid deployment | Yes | Summary in §3 |
| Page-by-page layout regions | Partial | **§6** (full layouts) |
| Per-component field tables | No | **§7–8, §15** |
| In-app glossary / RAG help | No | **§7.10, §9.8, `glossary.ts`** |
| `X-App-Role` / 403 permissions | May vary | **§10** |
| Legacy unused components | No | **§7.11** |
| PDF export endpoint | May be listed | **§10** (UI not connected) |

When you add a feature to the app, update **both** the architecture doc (if data model or API changes) and this guide (if users see new fields or flows).

---

## 17. Related documentation


| File                                  | Contents                          |
| ------------------------------------- | --------------------------------- |
| `README.md`                           | Setup and run instructions        |
| `esg-platform-architecture.md`        | Technical architecture and schema |
| `esg-platform-stories-and-prompts.md` | User stories and build prompts    |
| `web/src/lib/glossary.ts`             | In-app searchable glossary        |
| `web/src/lib/ragStatus.ts`            | RAG rules copy for Status ? help  |


---

*ESG Meteor — centralized capture, validation, reporting, and audit-ready ESG data.*