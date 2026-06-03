# ESG Platform

Centralized platform for capturing, validating, storing, and reporting Environmental, Social, and Governance (ESG) data. The stack is a React (Vite) frontend, an Express API with Prisma, and SQLite for local proof-of-concept work—with a documented path to MySQL in production.

## Overview

| Package | Path | Role |
|---------|------|------|
| **API** | `api/` | REST API: catalog, entries (workflow + audit), analytics, Excel/PDF export |
| **Web** | `web/` | Dashboard (KPIs, trends, targets, data quality) and Data Entry UI |

After setup and seeding, open the **Dashboard** to see a full year of sample data (2025): KPI cards, charts, target RAG status, and **Export Report** (Excel). Use **Data Entry** to create and approve entries.

No Docker is required for the PoC—only Node.js and npm.

## Prerequisites

- **Node.js 20+** (see `engines` in `api/package.json` and `web/package.json`)
- **npm** (comes with Node)

## Setup

From the repository root, configure the API database first, then the frontend.

### 1. API

```bash
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npm run prisma:seed
```

This creates `api/prisma/dev.db` (SQLite), applies migrations, and loads demo data: 3 facilities, 12 metrics, targets, and 12 months of entries for 2025.

### 2. Web

```bash
cd ../web
npm install
cp .env.example .env
```

Optional: edit `web/.env` if the API is not on `http://localhost:5000`.

## Run

Use two terminals.

**API** (port 5000):

```bash
cd api
npm run dev
```

**Web** (port 5173):

```bash
cd web
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Quick check: `curl http://localhost:5000/health` should return `{"status":"ok"}`.

## Demo

Demo data is loaded by **`npm run prisma:seed`** in the Setup step—not by a separate import.

On the **Dashboard**:

1. Set **Reporting period** to `2025-01-01` through `2025-12-31` (or leave defaults that include 2025).
2. Review KPI cards, trend and facility charts, target RAG table, and data quality.
3. Click **Export Report** to download an Excel file (Summary + Details sheets).
4. Open **Data Entry** to list, create, and move entries through `draft → submitted → approved → locked`.

## Configuration

### Environment variables

| Variable | Package | Default | Description |
|----------|---------|---------|-------------|
| `DATABASE_URL` | api | `file:./dev.db` | Prisma connection string (SQLite path or MySQL URL) |
| `PORT` | api | `5000` | API listen port |
| `CORS_ORIGIN` | api | `http://localhost:5173` | Comma-separated allowed browser origins |
| `NODE_ENV` | api | `development` | Set to `production` in deployed API (hides internal error details) |
| `VITE_API_URL` | web | `http://localhost:5000` | API base URL for the frontend |

Copy `api/.env.example` → `api/.env` and `web/.env.example` → `web/.env` before first run. `.env` files are gitignored.

### Switching from SQLite (PoC) to MySQL (production)

Application code (services, routes, validation) does **not** need to change—only Prisma datasource configuration and deployment commands.

1. **Start MySQL** (example local instance):

   ```bash
   docker run -d --name esg-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=esg -p 3306:3306 mysql:8
   ```

2. **Update** `api/prisma/schema.prisma` datasource:

   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Set** `DATABASE_URL` in `api/.env` (adjust user, password, host, database):

   ```env
   DATABASE_URL="mysql://root:secret@localhost:3306/esg"
   ```

4. **Apply schema** on the target database (production/staging):

   ```bash
   cd api
   npx prisma migrate deploy
   npm run prisma:seed
   ```

   Use `migrate deploy` (not `migrate dev`) on shared/production databases. Re-run seed only when you intend to reset demo data.

5. **Run the API** with `NODE_ENV=production` and set `CORS_ORIGIN` to your real frontend origin(s), for example:

   ```env
   NODE_ENV=production
   CORS_ORIGIN=https://esg.example.com
   ```

6. **Build and start** the API: `npm run build && npm run start`. Serve the web app from `web/dist` (after `npm run build`) behind your static host or CDN, with `VITE_API_URL` set at build time to the production API URL.

SQLite migration history in `api/prisma/migrations/` is for the PoC. For a greenfield MySQL deployment you may generate a new baseline migration after changing the provider; existing SQL files are SQLite-specific.

## Production notes

- **CORS**: Only origins listed in `CORS_ORIGIN` may call the API from a browser. Requests without an `Origin` header (e.g. `curl`) are still allowed.
- **Errors**: Validation returns `400` with `fieldErrors`; domain conflicts return `409`; unknown failures return `500` with a generic message when `NODE_ENV=production`.
- **JSON body limit**: 1 MB on the API.

Further detail: `web/README.md` (frontend-only commands).
