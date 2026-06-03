# ESG Data Platform — User Stories, Acceptance Criteria & Cursor Build Prompts

**Stack (locked):** React (Vite) + Tailwind + Tremor + Recharts · Node.js + Express · Prisma ORM · SQLite for PoC → MySQL for production (one-line connector switch) · Zod validation · ExcelJS/PDFKit export.

---

## PART A — Epics, User Stories & Acceptance Criteria

### Epic E1 — Foundation & Data Model
**US-1.1** As a developer, I want the project scaffolded with an Express API (Prisma + SQLite) and a React frontend so the team can build immediately without DB setup friction.
- **AC1:** Given a clean machine with Node 20, when I follow the README, then `npx prisma migrate dev` creates a local SQLite database with all tables, and the API starts on `:5000` and the frontend on `:5173`.
- **AC2:** GET `/health` returns `{"status":"ok"}`.
- **AC3:** Switching the Prisma datasource to MySQL requires changing only `provider` + `DATABASE_URL`, with no query/schema code changes.

### Epic E2 — Master Data Management
**US-2.1** As an ESG admin, I want facilities and metrics pre-defined so users select from a consistent catalogue.
- **AC1:** The DB is seeded with ≥3 facilities and ≥12 metrics spanning Environmental, Social, and Governance categories, each with a unit.
- **AC2:** GET `/facilities` and `/metrics` return the seeded catalogue.

### Epic E3 — Data Capture
**US-3.1** As a data-entry user, I want to record an ESG entry (facility, metric, value, period) so the organization has a central record.
- **AC1:** Given a valid entry (facility, metric, numeric value, period start/end), when I submit the form, then it is validated by Zod and persisted, and appears in the entries list.
- **AC2:** Invalid input (missing field, non-numeric value, end before start) is rejected with a clear field-level error and nothing is saved.
- **AC3:** Every create/update writes an audit record (old value, new value, action, timestamp).

**US-3.2** As an approver, I want entries to follow a status workflow so data quality is controlled.
- **AC1:** Entries have status `draft → submitted → approved → locked`; status transitions are enforced (no skipping backwards from locked).

### Epic E4 — Dashboard & Insights
**US-4.1** As an ESG manager, I want a dashboard of KPIs and trends so I can monitor performance.
- **AC1:** Dashboard shows KPI cards (total emissions, energy, water, waste) with period-over-period delta.
- **AC2:** Trend charts show each metric over time; a facility-comparison chart shows per-site values.
- **AC3:** A target-vs-actual view shows RAG (red/amber/green) status against configured targets.
- **AC4:** A data-quality panel shows % of entries submitted/approved and flags missing data for the period.

### Epic E5 — Reporting
**US-5.1** As an ESG manager, I want to export an ESG report so I can share it with stakeholders/auditors.
- **AC1:** Clicking "Export" produces an Excel (and/or PDF) report with summary KPIs and a detailed entries table for the selected period/facility.

### Epic E6 — Demo Readiness
**US-6.1** As a demo presenter, I want 12 months of realistic seeded data so every chart and KPI is populated.
- **AC1:** A documented seed command inserts 12 months of plausible entries (emissions trending down, water/energy seasonal) across all facilities, with targets, so the dashboard is fully populated on first load.

---

## PART B — Cursor Build Prompts (sequential, copy-paste)

> Paste into Cursor **in order**. Each is self-contained; later prompts assume earlier ones completed. Run the stated verification after each.

### Prompt 0 — Repository scaffold
```
Create a monorepo named "esg-platform" with this structure and nothing else yet:

esg-platform/
  api/          # Node.js + Express + Prisma backend
  web/          # React + Vite + Tailwind + Tremor frontend
  README.md
  .gitignore

Requirements:
- Node target: 20. Use TypeScript in both api and web.
- .gitignore covers node_modules, dist, .env, and the SQLite file (api/prisma/dev.db, *.db-journal).
- README.md with placeholder sections: Overview, Prerequisites, Setup, Run, Demo, Configuration. Leave steps for later prompts.
Do not add application code yet. Show me the final tree.
```

### Prompt 1 — Backend foundation (Express + Prisma + SQLite)
```
In esg-platform/api, set up a TypeScript Express server with Prisma using SQLite for the PoC.

1. Initialize package.json (type: module) and install: express, cors, dotenv, zod, @prisma/client; devDeps: typescript, tsx, @types/express, @types/node, @types/cors, prisma.
2. Add tsconfig.json (NodeNext, strict).
3. Initialize Prisma with SQLite: prisma/schema.prisma with
   datasource db { provider = "sqlite"  url = env("DATABASE_URL") }
   generator client { provider = "prisma-client-js" }
   Add a comment block in schema.prisma documenting EXACTLY how to switch to MySQL for production: set provider = "mysql" and DATABASE_URL = "mysql://user:pass@host:3306/esg_db" — no other code changes.
4. .env with DATABASE_URL="file:./dev.db" and PORT=5000. Add .env.example.
5. Create src/index.ts: Express app, JSON body parsing, CORS open to http://localhost:5173, GET /health -> {"status":"ok"}. Use tsx for dev.
6. Add scripts: "dev": "tsx watch src/index.ts", "prisma:migrate": "prisma migrate dev", "prisma:seed": "tsx prisma/seed.ts".
7. Fill README Setup/Run for the api.

Verify: `npm run dev` starts on :5000 and GET /health returns {"status":"ok"}.
```

### Prompt 2 — Prisma schema (relational model)
```
In esg-platform/api/prisma/schema.prisma, define the ESG relational model, then migrate.

Models:
- Facility { id Int @id @default(autoincrement()); name String; type String; location String?; entries EsgEntry[]; targets Target[] }
- MetricCategory { id Int @id @default(autoincrement()); name String  // "Environmental" | "Social" | "Governance"; metrics Metric[] }
- Metric { id Int @id @default(autoincrement()); categoryId Int; category MetricCategory @relation(...); name String; unit String; entries EsgEntry[]; targets Target[] }
- EsgEntry { id Int @id @default(autoincrement()); facilityId Int; metricId Int; value Float; periodStart DateTime; periodEnd DateTime; source String?; enteredBy String?; status String @default("draft"); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; facility/ metric relations; audits EntryAudit[] }
- EntryAudit { id Int @id @default(autoincrement()); entryId Int; action String; oldValue Float?; newValue Float?; changedBy String?; changedAt DateTime @default(now()); entry relation }
- Target { id Int @id @default(autoincrement()); metricId Int; facilityId Int?; targetValue Float; period String; metric/facility relations }

Run prisma migrate dev --name init. Confirm dev.db and tables are created.

Verify: `npx prisma studio` shows all six tables (empty).
```

### Prompt 3 — Validation schemas & repositories
```
In esg-platform/api/src, add Zod validation and a data-access layer.

1. src/validation.ts: Zod schemas for createEntry (facilityId int, metricId int, value finite number, periodStart/periodEnd ISO dates with end >= start, source optional, enteredBy optional) and updateEntryStatus (status in draft|submitted|approved|locked). Export inferred TS types.
2. src/services/entries.ts: functions using Prisma client:
   - createEntry(input) -> creates entry + an EntryAudit (action "create", newValue=value).
   - updateEntry(id, input) -> updates value, writes EntryAudit (old/new). Enforce status rules: cannot edit a "locked" entry.
   - setStatus(id, status) -> enforces forward-only transitions draft->submitted->approved->locked; reject illegal jumps with a typed error.
   - listEntries(filters: facilityId?, metricId?, periodStart?, periodEnd?, status?).
3. src/services/analytics.ts: 
   - kpiSummary(period) -> totals per top metric (emissions/energy/water/waste) with previous-period delta.
   - trend(metricId, range) -> series of {periodStart, value}.
   - facilityComparison(metricId, period) -> [{facility, value}].
   - targetStatus(period) -> per metric/facility actual vs target with RAG (green within target, amber within 10%, red beyond).
   - dataQuality(period) -> counts by status + missing (facility×metric combos with no entry).
Keep all DB access in services (no Prisma calls in routes).

Verify: a small tsx script calls createEntry then listEntries and prints the created row + its audit.
```

### Prompt 4 — REST API routes
```
In esg-platform/api/src, expose Express routers wiring the services, with Zod validation and consistent error handling.

Routes:
- GET /facilities, GET /metrics (with category), GET /categories
- POST /entries (validate with createEntry schema) -> 201 with created entry; 400 with field errors on invalid input
- PUT /entries/:id (validate) -> updated entry; 409 if entry is locked
- PATCH /entries/:id/status (validate) -> updated status; 409 on illegal transition
- GET /entries (query filters)
- GET /analytics/kpis?period=, /analytics/trend?metricId=&range=, /analytics/facility-comparison?metricId=&period=, /analytics/targets?period=, /analytics/data-quality?period=
Add a central error middleware that maps ZodError -> 400 {fieldErrors}, typed domain errors -> 409, others -> 500.

Verify: using curl or a REST client, POST a valid entry (201), POST an invalid entry (400 with field errors), PATCH an illegal status jump (409).
```

### Prompt 5 — Frontend scaffold (React + Tailwind + Tremor) & API client
```
In esg-platform/web, create a React + Vite + TypeScript app with Tailwind and Tremor.

1. Init Vite react-ts; install + configure tailwindcss; install @tremor/react, axios, react-hook-form, zod, @hookform/resolvers, date-fns.
2. src/api.ts: axios client to http://localhost:5000 with typed functions for all endpoints from Prompt 4 (facilities, metrics, categories, entries CRUD + status, analytics.*).
3. App shell with Tremor: top nav "ESG Data Platform" and two routes/tabs: "Dashboard" and "Data Entry". Use react-router-dom.
4. Fill README web Setup/Run.

Verify: `npm run dev` serves the shell at :5173 with Tremor styles applied and no console errors.
```

### Prompt 6 — Data Entry screen
```
In esg-platform/web/src, build the Data Entry page.

1. EntryForm (react-hook-form + zod resolver, mirroring the backend createEntry schema): selects for Facility and Metric (loaded from API, Metric grouped by category and showing its unit), numeric Value input, period start/end date pickers, optional source/enteredBy. Submit calls POST /entries; show success toast and field-level errors from a 400 response.
2. EntriesTable: lists entries (filterable by facility/metric/period/status) with status badges, and a status-advance control that calls PATCH /entries/:id/status (disabled when locked), surfacing 409 errors as a message.
3. Edit action opens the form pre-filled and calls PUT /entries/:id (blocked client-side when locked).

Verify: creating a valid entry adds a row; invalid input shows inline errors; advancing status updates the badge; editing a locked entry is prevented.
```

### Prompt 7 — Dashboard screen (Tremor)
```
In esg-platform/web/src, build the Dashboard page using Tremor components, fed by the analytics endpoints.

1. KpiCards: four Tremor Cards (total emissions, energy, water, waste) with value, unit, and period-over-period delta badge (green down / red up for emissions; configure direction per metric) from /analytics/kpis.
2. TrendChart: Tremor LineChart of a selected metric over time from /analytics/trend (metric selector + range selector).
3. FacilityComparison: Tremor BarChart from /analytics/facility-comparison.
4. TargetStatus: a list/table with Tremor RAG indicators from /analytics/targets.
5. DataQuality: Tremor cards/progress showing submitted/approved % and a list of missing facility×metric combos from /analytics/data-quality.
Add a global period selector that drives all panels.

Verify: with seeded data (next prompt), every panel renders real values and the period selector updates them.
```

### Prompt 8 — Seed data (master + 12 months)
```
In esg-platform/api/prisma/seed.ts, create a seed script run via `npm run prisma:seed`.

It must insert:
- 3 facilities (e.g., "Plant A", "Plant B", "Mine Site C") with type/location.
- 3 categories and 12 metrics with units, e.g.: CO2e (tonnes), Energy (kWh), Water (kL), Waste Generated (tonnes), Waste Recycled (tonnes), PM (µg/m3), LTIFR (rate), Training Hours (hrs), Diversity (%), Community Spend (currency), Compliance Incidents (count), Audit Findings (count). Map each to E/S/G appropriately.
- Targets for the key environmental metrics per facility.
- 12 months of EsgEntry rows per facility for the key metrics, with realistic shapes: emissions and PM trending down ~1%/month, water/energy with seasonal variation, social/governance metrics improving slightly. Mix statuses (most approved, some submitted/draft). Each create writes an EntryAudit.

Make the script idempotent (clear tables first or upsert). Print a summary of inserted counts.

Verify: after `npm run prisma:seed`, the Dashboard shows populated KPIs, trends, comparisons, targets (RAG), and data-quality.
```

### Prompt 9 — Report export
```
Add ESG report export.

Backend (api): install exceljs and pdfkit. Add GET /report/excel?period=&facilityId= that returns an .xlsx with a Summary sheet (KPIs + RAG vs targets) and a Details sheet (entries table). Optionally GET /report/pdf for a one-page summary.
Frontend (web): on the Dashboard, add a "Export Report" button (with period/facility from the current selectors) that downloads the Excel.

Verify: clicking Export downloads a valid .xlsx with both sheets matching the on-screen period.
```

### Prompt 10 — Production switch notes & final README
```
Finalize the project.

1. In README "Configuration", document switching from SQLite (PoC) to MySQL (prod): change schema.prisma provider to "mysql", set DATABASE_URL to a MySQL connection string, run prisma migrate deploy; note that no service/route code changes. Include a docker run line for mysql:8.
2. Ensure CORS, .env handling, and error middleware are production-sane.
3. Complete README: Overview, Prerequisites (Node 20), Setup (npm install in api+web, prisma migrate dev, prisma seed), Run (api dev, web dev), Demo (seeded data is loaded by the seed step), Configuration table (DATABASE_URL, PORT) and the MySQL switch.

Verify: a new developer goes from clone to a fully populated dashboard following only the README, with no Docker required for the PoC.
```

---

### Build order recap
0 scaffold → 1 Express+Prisma+SQLite → 2 schema/migrate → 3 validation/services → 4 REST routes → 5 frontend shell → 6 data entry → 7 dashboard → 8 seed → 9 export → 10 prod-switch/README.
