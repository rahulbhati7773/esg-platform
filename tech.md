# ESG Meteor — Technical Documentation (`tech.md`)

This document covers the **technical details** of the ESG Meteor platform: what tools and technologies are used, **why** each was chosen, how the system is structured, and **how to scale it in the future**.

> Related docs: `esg-platform-architecture.md` (architecture & schema), `ESG-PLATFORM-GUIDE.md` (product behaviour), `README.md` (setup).

---

## 1. System Overview

ESG Meteor is a classic **3-tier web application** built as a monorepo:

```
┌─────────────────┐     REST (JSON)      ┌─────────────────┐     Prisma      ┌──────────────┐
│  React Web App  │ ◄──────────────────► │  Express API    │ ◄──────────────►│   Database   │
│  (Vite, :5173)  │                      │  (Node, :5000)  │                 │ SQLite/MySQL │
└─────────────────┘                      └─────────────────┘                 └──────────────┘
```

```
esg-platform/
├── api/          # Backend: Express + Prisma + TypeScript
│   └── prisma/   # Schema, migrations, seed data
├── web/          # Frontend: React + Vite + Tailwind + Recharts
└── *.md          # Architecture, guide, and reference docs
```

No ML, no message queues, no microservices — deliberately the **lowest-risk architecture** for a PoC that must demo reliably, while keeping a clear path to production.

---

## 2. Tech Stack — What & Why

### 2.1 Frontend (`web/`)

| Technology | Version | Why it was chosen |
| ---------- | ------- | ----------------- |
| **React 18** | `^18.3.1` | Industry-standard SPA library; large ecosystem; team familiarity. |
| **Vite** | `^5.4.10` | Near-instant dev server startup and HMR; far faster iteration than CRA/webpack for a one-week PoC. |
| **TypeScript** | `^5.6.0` | Type safety shared end-to-end with the API (same Zod schemas); catches errors at compile time. |
| **Tailwind CSS** | `^3.4.14` | Utility-first styling — no separate CSS architecture to maintain; consistent design tokens for light/dark themes. |
| **Recharts** | `^2.15.4` | Declarative React chart library covering every chart the dashboard needs (line, bar, area, stacked). |
| **Tremor** | `^3.18.0` | Dashboard component kit (KPI cards, RAG indicators) built on Tailwind + Recharts — roughly halves dashboard build time vs hand-rolling. |
| **Radix UI** (Select, Popover) | `^2.x / ^1.x` | Accessible, unstyled primitives — native selects/date inputs were inconsistent across browsers and themes. |
| **react-hook-form + Zod** | `^7.71.2 / ^4.4.3` | Performant forms with the **same validation schema** the API uses — UI and server reject identical bad input. |
| **react-router-dom** | `^7.13.1` | Client-side routing with role-restricted routes (e.g. Benchmarks is admin-only). |
| **axios** | `^1.13.6` | API client with an interceptor that attaches the `X-App-Role` header on every request. |
| **Framer Motion** | `^12.40.0` | Page-enter animations, animated sidebar indicator, wizard stepper transitions. |
| **Lenis** | `^1.3.23` | Smooth scrolling on long pages (Analytics) with nested-scroll support for inner tables. |
| **date-fns** | `^4.1.0` | Lightweight, tree-shakeable date handling for reporting periods. |
| **lucide-react** | `^1.17.0` | Consistent icon set. |

### 2.2 Backend (`api/`)

| Technology | Version | Why it was chosen |
| ---------- | ------- | ----------------- |
| **Node.js** | `>=20` | Single language (TypeScript) across the whole stack; one team can own everything. |
| **Express** | `^4.21.0` | Minimal, battle-tested REST framework; no framework lock-in for a simple CRUD + analytics API. |
| **Prisma** | `^6.0.0` | Chosen over Sequelize for faster scaffolding, type-safe queries, and clean migrations. The generated client gives compile-time guarantees that queries match the schema. |
| **Zod** | `^4.4.3` | Runtime validation of query/body params; schemas shared conceptually with the frontend forms. |
| **ExcelJS** | `^4.4.0` | Server-side Excel report generation (Summary + Details sheets) for auditors. |
| **PDFKit** | `^0.18.0` | Server-side PDF report endpoint (`/report/pdf` — built, not yet wired into the UI). |
| **tsx** | `^4.22.4` | Zero-config TypeScript execution with watch mode for dev. |
| **cors / dotenv** | — | Standard middleware; dev CORS allows any `localhost:*` origin so Vite ports just work. |

### 2.3 Database

| Stage | Database | Why |
| ----- | -------- | --- |
| **PoC (current)** | **SQLite** | Zero setup — no Docker, no DB server. Prisma points at a local file; `migrate dev` creates everything. Lowest-friction demo. |
| **Production (path)** | **MySQL 8** | Structured, relational, reporting-friendly — the right fit for tabular ESG metrics, audit trails, and SQL aggregations. Managed options (RDS / Azure DB) reduce ops burden. |

**The key design decision:** SQLite → MySQL is a **one-line change** in `schema.prisma` (datasource connector). Schema, migrations, and all queries are unchanged because Prisma abstracts the dialect. The PoC therefore validates the exact production data model.

### 2.4 Why MERN-style with MySQL (not MongoDB)?

ESG data is inherently **relational and tabular**: facilities × metrics × periods, foreign keys to targets and audit rows, SQL `GROUP BY` aggregations for every chart. A document store would force joins in application code and weaken audit integrity. MySQL gives:

- Referential integrity (an entry must reference a real facility and metric).
- Native aggregation for KPIs/trends.
- Familiar tooling for auditors and BI teams.

---

## 3. Data Model (core entities)

| Entity | Purpose |
| ------ | ------- |
| `Facility` | Sites where data is collected (name, type, location). |
| `MetricCategory` | Environmental / Social / Governance. |
| `Metric` | Measurable item with unit (e.g. CO₂e – tonnes, Water – kL). |
| `EsgEntry` | One reading: facility + metric + value + period + status. |
| `EntryAudit` | Immutable history of every create/update/status change (old/new values, who, when). |
| `Target` | Target value per metric (optionally per facility) for RAG comparison. |

**Status workflow (enforced in both UI and API):**

```
draft ──► submitted ──► approved ──► locked
```

Role permissions are duplicated **identically** on client and server (`web/src/lib/entryPermissions.ts` and `api/src/lib/entryPermissions.ts`) — the UI hides illegal buttons, the API returns `403` regardless. Defence in depth even in the demo.

---

## 4. API Surface

| Endpoint group | Purpose |
| -------------- | ------- |
| `GET /health` | Health check (also drives the Live/Offline pill in the TopBar, polled every 30s). |
| `GET /facilities`, `/metrics`, `/categories` | Master data catalogue. |
| `POST/PUT/PATCH/GET /entries` | CRUD + status workflow, audit-logged. |
| `GET /analytics/kpis` | KPI totals + period-over-period deltas. |
| `GET /analytics/trend` | Time series for one metric. |
| `GET /analytics/facility-comparison` | Per-facility totals. |
| `GET /analytics/targets` | Target vs actual + RAG status. |
| `GET /analytics/data-quality` | Submission/approval rates and missing-data gaps. |
| `GET /report/excel`, `GET /report/pdf` | Server-side report generation. |

**Demo auth model:** the client sends an `X-App-Role` header (from `sessionStorage`); the server validates allowed actions per role. This is explicitly a PoC placeholder — see §6.1 for the production replacement.

---

## 5. Key Engineering Decisions (summary)

| Decision | Alternative considered | Why this won |
| -------- | ---------------------- | ------------ |
| Prisma | Sequelize | Faster scaffolding, type-safe queries, cleaner migrations — real DX gain on a one-week timeline. |
| SQLite for PoC | Docker + MySQL from day one | Skips all DB setup; connector swap to MySQL is one line later. |
| Tremor + Recharts | Hand-assembled Recharts | Purpose-built dashboard components; ~half the frontend build time. |
| Vite + Express (separate) | Next.js (combined) | Next.js was the documented optional path; separate apps kept concerns simple for the team. |
| Shared Zod schemas | Separate client/server validation | One source of truth — API and forms reject the same bad input. |
| Dual permission modules (web + api) | Server-only checks | UI never shows actions that would 403; server still enforces everything. |

---

## 6. How to Scale It in the Future

### 6.1 Phase 1 — Production hardening (PoC → first deployment)

1. **Database: SQLite → MySQL 8.**
   - Change the Prisma datasource connector + `DATABASE_URL`; run `prisma migrate deploy`.
   - Use a managed instance (AWS RDS / Azure Database for MySQL) for backups, patching, failover.
2. **Real authentication: replace `X-App-Role` with JWT + RBAC.**
   - `jsonwebtoken` + `bcrypt` (already in the architecture plan), roles: data-entry / approver / auditor / admin.
   - Keep the existing permission modules — only the *identity source* changes; the rules already exist on both tiers.
3. **Containerization.**
   - Dockerfiles for `api` and `web` (static build served via CDN/nginx); Docker Compose for parity between dev and prod.
4. **Environment & secrets** — move from `.env` files to a secret manager (AWS Secrets Manager / Azure Key Vault).
5. **Observability** — structured logging, error tracking (e.g. Sentry), and uptime checks on `/health`.

### 6.2 Phase 2 — Hybrid deployment (the locked production architecture)

The architecture decision is **hybrid**: site-level data entry + cloud aggregation/reporting.

```
[Site A: web+api+MySQL]──┐
[Site B: web+api+MySQL]──┼── replication / scheduled sync ──► [Cloud MySQL (reporting)] ──► [Group dashboards, exports]
[Site C: web+api+MySQL]──┘                                      + read replica
```

- Each facility runs the app locally → data entry works even with poor connectivity.
- MySQL replication (or scheduled sync jobs) pushes site data to a central cloud reporting DB.
- The cloud instance serves group-level dashboards and regulatory exports.
- Add a **read replica** on the cloud DB so heavy analytics queries never block writes.

### 6.3 Phase 3 — Scaling the application tier

| Concern | Approach |
| ------- | -------- |
| **API load** | Express is stateless → horizontal scaling behind a load balancer (Kubernetes or a managed app service). No session affinity needed (JWT). |
| **Analytics query cost** | Today every chart aggregates `esg_entries` live (SQL `GROUP BY`). At scale: add covering indexes on `(facility_id, metric_id, period_start)`, then materialized/pre-aggregated summary tables refreshed on write or on schedule. |
| **Report generation** | Excel/PDF generation is CPU-bound — move to a background job queue (e.g. BullMQ + Redis) with download links, instead of blocking request threads. |
| **Frontend** | Static Vite build served from CDN; code-split heavy routes (Analytics) if bundle size grows. |
| **Caching** | Cache master data (`/facilities`, `/metrics`, `/categories`) and slow analytics responses (Redis or HTTP cache headers) — they change rarely. |
| **Client-side aggregation** | `GhgStackedChart` currently aggregates entries in the browser; move this to a dedicated API endpoint as data volume grows. |

### 6.4 Phase 4 — Functional roadmap (from architecture doc)

- **Automated emission calculation** — fuel/electricity inputs → auto-computed Scope 1/2 CO₂e via factor tables.
- **Intensity metrics** — emissions/energy/water per tonne of production.
- **Forecasting** — project year-end performance vs target from YTD trend.
- **Anomaly detection** — flag outlier readings (entry errors vs genuine spikes).
- **Regulatory templates** — auto-map data to BRSR / GRI / CDP formats.
- **Auto-ingest** — pull from meters/SCADA/SAP instead of manual entry; this is where a lightweight ingestion pipeline (scheduled jobs or a queue) enters the architecture.
- **Evidence attachments** — file storage (S3/Azure Blob) for utility bills and meter photos per entry.

### 6.5 What deliberately does *not* need to change

- **Schema** — designed relationally from day one; survives the SQLite→MySQL switch untouched.
- **Validation layer** — Zod schemas work identically at any scale.
- **Permission model** — role rules are already mirrored client/server; JWT only swaps the identity source.
- **Audit log** — `EntryAudit` already records every change; it is the foundation for compliance at production scale.

---

## 7. Running Locally (quick reference)

```bash
# Terminal 1 — API (Express :5000)
cd api && npm install
npx prisma migrate dev      # creates SQLite DB + tables
npm run prisma:seed         # 3 facilities, 12+ metrics, 12 months of data
npm run dev

# Terminal 2 — Web (Vite :5173)
cd web && npm install && npm run dev
```

Requires **Node >= 20**. No database server or Docker needed for the PoC.

---

*ESG Meteor — technical reference. Update this file when the stack, deployment shape, or scaling plan changes.*
