# Architecture Document — Centralized ESG Data Platform

**Problem statement:** #25 (Environment & Sustainability) — "Unavailability of centralized platform to capture ESG data."
**Objective:** A single platform to capture, validate, store, and report Environmental, Social, and Governance data (emissions, water, energy, waste, safety, community) with dashboards and audit-ready exports.

**Architecture decisions (locked):**
- Database: **MySQL** (structured, relational, reporting-friendly — best fit for tabular ESG metrics and audit trails).
- Production deployment: **Hybrid (site data entry + cloud aggregation/reporting)**.
- App layer: **MERN-style with MySQL** (React + Express/Node + MySQL instead of MongoDB).

---

## 1. Technical Details (Local PoC Setup)

A classic 3-tier web application — no ML required, which makes it the lowest-risk demo.

```
[React frontend] -- REST --> [Express/Node API] -- Prisma --> [SQLite (PoC) | MySQL (prod)]
   forms + Tremor dashboards     validation + business rules         relational schema
```

**PoC-accelerating choices:**
- **Prisma (not Sequelize)** — faster scaffolding, type-safe queries, clean migrations. For a one-week PoC the DX gain is real.
- **SQLite for the PoC, MySQL for production** — point Prisma's datasource at SQLite to skip Docker/DB setup entirely; switch the connector to MySQL for production by changing one line in `schema.prisma`. Schema and queries are unchanged.
- **Tremor for the dashboard** — React dashboard components (KPI cards, charts, RAG indicators) built on Tailwind + Recharts. Purpose-built for exactly this kind of metrics dashboard; roughly halves frontend build time versus hand-assembling Recharts.
- **Optional — Next.js** to collapse frontend + API into one codebase (API routes), removing the separate Express server for the PoC. Use only if the team is comfortable; otherwise Vite + Express is fine.

**Local setup steps (PoC)**

```bash
# No DB container needed for PoC — Prisma uses a local SQLite file.
# (For prod, swap the Prisma datasource to MySQL: docker run ... mysql:8)

# API (Express + Prisma)
cd api && npm install
npx prisma migrate dev          # creates SQLite DB + tables
npm run dev                     # Express on :5000

# Dashboard
cd web && npm install && npm run dev           # Vite React + Tremor on :5173
```

**Core schema (relational)**

- `facilities` (id, name, type, location)
- `metric_categories` (id, name: Environmental/Social/Governance)
- `metrics` (id, category_id, name, unit, e.g. "CO2e – tonnes", "Water – kL", "Energy – kWh")
- `esg_entries` (id, facility_id, metric_id, value, period_start, period_end, source, entered_by, status)
- `entry_audit` (id, entry_id, action, old_value, new_value, changed_by, changed_at)
- `targets` (id, metric_id, facility_id, target_value, period) — for variance vs. target
- `users` (id, name, role) — RBAC

**Production note (hybrid):** site users enter data locally; a cloud instance aggregates across facilities for group-level reporting. MySQL replication (or scheduled sync) pushes site data to the cloud reporting DB.

---

## 2. Tech Stack

| Layer | PoC | Production (Hybrid) |
|-------|-----|---------------------|
| Frontend | React (Vite) + Tailwind + **Tremor** + Recharts | Same, CDN-served |
| Backend | Node.js + Express (or **Next.js** API routes) | Node.js + Express, autoscaled (cloud) |
| Database | **SQLite** (PoC) → **MySQL 8** (prod) via Prisma | MySQL (managed: RDS/Azure DB) + read replica for reporting |
| ORM | **Prisma** | Prisma (same schema, MySQL connector) |
| Validation | **Zod** (shares types with TS frontend) | Zod |
| Auth | none (PoC) | JWT + RBAC (data-entry / approver / auditor / admin) |
| Reporting | client-side export | server-side PDF/Excel generation, scheduled reports |
| Containerization | Docker Compose | Docker + Kubernetes / managed app service |

---

## 3. Packages Used

**Node/Express (API)**
- `express`, `cors`, `dotenv`
- `prisma`, `@prisma/client` — ORM / migrations (SQLite for PoC, MySQL for prod via connector switch)
- `zod` — input validation (shared types with the TS frontend)
- `jsonwebtoken`, `bcrypt` (prod auth)
- `exceljs` — Excel export (server-side)
- `pdfkit` or `puppeteer` — PDF report generation

**React (frontend)**
- `react`, `react-dom`, `vite`
- `@tremor/react` — dashboard KPI cards, charts, RAG indicators (built on Tailwind + Recharts)
- `axios` — API calls
- `react-hook-form` + `zod` — data-capture forms with shared validation
- `tailwindcss`
- `date-fns` — period handling

---

## 4. Parameters (per project)

**ESG metric parameters**
- **Environmental:** CO2e emissions (Scope 1/2/3), energy consumption (kWh), water withdrawal/discharge (kL), waste generated/recycled (tonnes), air quality (PM/SOx/NOx), land reclaimed (ha).
- **Social:** lost-time injuries (LTIFR), training hours, workforce diversity, community spend.
- **Governance:** compliance incidents, audit findings, board diversity.

**Operational parameters**
- Reporting period (monthly/quarterly/annual), facility/site granularity.
- Data status workflow: `draft → submitted → approved → locked`.
- Target value & threshold per metric (for variance and RAG status).
- Unit normalization and conversion factors (e.g., fuel → CO2e emission factors).

---

## 5. Dashboard Details

- **ESG overview:** top-line KPIs — total emissions, energy, water, waste, with period-over-period delta.
- **Category drill-down:** Environmental / Social / Governance tabs.
- **Trend charts:** metric trends over time (line), facility comparison (bar).
- **Target vs. actual:** RAG (red/amber/green) status against set targets.
- **Data quality panel:** % of entries submitted/approved, missing data flags.
- **Facility map / table:** per-site performance.
- **Reports:** one-click ESG report export (PDF/Excel), audit trail view.

---

## 6. Data to Collect

**Transactional**
- ESG entries: facility, metric, value, unit, period, data source, entered-by, timestamp, status.
- Audit log: every create/edit/approve action with old/new values.

**Reference/master data**
- Facility registry, metric catalogue with units, emission/conversion factors, targets per metric/facility, user roles.

**Source documents (optional)**
- Attach supporting evidence (utility bills, meter readings) per entry for audit defensibility.

---

## 7. Other Analytics (roadmap)

- **Automated emission calculation** — enter fuel/electricity → auto-compute Scope 1/2 CO2e using factor tables.
- **Intensity metrics** — emissions/energy/water **per tonne of production** (the metric regulators and management actually track).
- **Forecasting** — project year-end performance vs. target from YTD trend.
- **Anomaly detection** — flag outlier readings (data-entry errors or genuine spikes).
- **Regulatory report templates** — auto-map data to BRSR / GRI / CDP formats.
- **What-if scenarios** — model emission reduction from interventions.
- **Auto-ingest** — pull from meters/SCADA/SAP instead of manual entry (production).

---

## 8. Mock Data Flow (PoC Demo)

```
1. Seed master data: 3 facilities, ~12 metrics across E/S/G, targets.
2. Seed 12 months of esg_entries with realistic values
   (emissions trending down, water/energy seasonal).
3. User opens dashboard:
   - API aggregates esg_entries by metric/period/facility (SQL GROUP BY).
   - KPI tiles show totals + deltas; charts render trends.
   - Target-vs-actual shows RAG status.
4. User adds a new entry via form -> validated -> inserted -> audit logged
   -> dashboard KPI updates on refresh.
5. User clicks "Export Report" -> server generates PDF/Excel ESG summary.
```

**Mock data generator:** a seed script inserts 12 months of plausible ESG values across facilities so every chart, KPI, and target indicator is populated for the demo.
