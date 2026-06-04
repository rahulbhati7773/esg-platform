# ESG Meteor Platform

Centralized platform for capturing, validating, storing, and reporting Environmental, Social, and Governance (ESG) data. The repo is a **monorepo**: a React (Vite) frontend and an Express API with Prisma, using **SQLite** for local development and a documented path to **MySQL** in production.

No Docker is required for local development—only **Node.js 20+** and **npm**.

## What you get

- **Role-based workflows** — data entry (draft → submit), auditor (approve → lock), admin (full visibility)
- **Dashboards & analytics** — KPIs, trends, facility comparison, target RAG, data quality
- **Entries** — list, filter, edit drafts, advance status with API-enforced permissions
- **Exports** — Excel reports from the API
- **Demo auth** — mock login per role (session storage; not production auth)

For a full product and UI guide (pages, charts, components), see **[ESG-PLATFORM-GUIDE.md](./ESG-PLATFORM-GUIDE.md)**.

---

## Requirements

| Requirement | Version / notes |
|-------------|-----------------|
| **Node.js** | **20 or newer** (`engines` in `api/package.json` and `web/package.json`) |
| **npm** | Included with Node (used in both `api/` and `web/`) |
| **Git** | To clone the repository |
| **OS** | macOS, Linux, or Windows with a Unix-like shell for the commands below |

Optional for production only: **MySQL 8** (see [Switching to MySQL](#switching-from-sqlite-poc-to-mysql-production)).

---

## Project structure

```
esg-platform/
├── api/                          # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma         # Data model
│   │   ├── migrations/           # SQLite migrations (PoC)
│   │   ├── seed.ts               # Demo facilities, metrics, entries
│   │   └── dev.db                # Created after migrate (gitignored)
│   ├── src/
│   │   ├── index.ts              # Server entry
│   │   ├── app.ts                # Express app + routes mount
│   │   ├── config.ts
│   │   ├── validation.ts         # Zod schemas
│   │   ├── lib/
│   │   │   └── entryPermissions.ts
│   │   ├── middleware/           # CORS, errors, async handler
│   │   ├── routes/               # catalog, entries, analytics, report
│   │   └── services/             # entries, analytics, catalog, reports
│   ├── scripts/
│   ├── .env.example
│   └── package.json
│
├── web/                          # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── App.tsx               # Routes + role guards
│   │   ├── api.ts                # Axios client (sends X-App-Role)
│   │   ├── pages/                # Dashboard, Analytics, Entries, Login, …
│   │   ├── pages/home/           # Role-specific dashboard home
│   │   ├── components/           # EntriesTable, charts, layout shell
│   │   ├── context/              # Auth, theme, platform filters
│   │   └── lib/                  # entryPermissions, charts, motion
│   ├── .env.example
│   └── package.json
│
├── README.md                     # This file — setup and run
├── ESG-PLATFORM-GUIDE.md         # Deep dive: ESG concepts, UI, API, flows
├── esg-platform-architecture.md  # Architecture notes
└── esg-platform-stories-and-prompts.md
```

### Packages

| Package | Path | Role |
|---------|------|------|
| **API** | `api/` | REST: `/health`, catalog, `/entries`, `/analytics`, `/report` (Excel) |
| **Web** | `web/` | SPA: login, dashboards, analytics, targets, entries, new-entry wizard |

### Main web routes

| Route | Who can access | Purpose |
|-------|----------------|---------|
| `/login` | Public | Demo login (pick role + credentials) |
| `/dashboard` | All roles | Role-specific home (KPIs / queue) |
| `/analytics` | All roles | Charts and comparisons |
| `/targets` | Auditor, admin | Target RAG status |
| `/benchmarks` | Admin only | Benchmarks view |
| `/social` | Auditor, admin | People & governance metrics |
| `/entries` | All roles | Entry list and workflow actions |
| `/entries/new` | Data entry only | Multi-step new entry wizard |

---

## Clone and run

### 1. Clone the repository

```bash
git clone <repository-url>
cd esg-platform
```

Replace `<repository-url>` with your Git remote (for example `git@github.com:org/esg-platform.git`).

### 2. Set up the API

```bash
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npm run prisma:seed
```

This will:

- Install dependencies and generate the Prisma client (`postinstall`)
- Create `api/prisma/dev.db` (SQLite) and apply migrations
- Seed **3 facilities**, **12+ metrics**, **targets**, and **12 months of 2025 entries**

### 3. Set up the web app

In a new shell from the repo root:

```bash
cd web
npm install
cp .env.example .env
```

Default `web/.env` points at `http://localhost:5000`. Change `VITE_API_URL` only if the API runs on another host or port.

### 4. Run both apps

Use **two terminals**.

**Terminal 1 — API** (default port **5000**):

```bash
cd api
npm run dev
```

**Terminal 2 — Web** (default port **5173**; Vite may use **5174+** if 5173 is busy):

```bash
cd web
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

**Verify the API:**

```bash
curl http://localhost:5000/health
```

Expected: `{"status":"ok"}`

### 5. Log in and explore

On the login screen, choose a **role**, then sign in with the demo credentials below.

| Role | Email | Password |
|------|-------|----------|
| Data entry | `sara.chen@esg-demo.com` | `entry123` |
| Auditor | `james.okonkwo@esg-demo.com` | `audit123` |
| Admin | `priya.mehta@esg-demo.com` | `admin123` |

**Suggested checks:**

1. **Dashboard** — set reporting period to **2025** (seed data is for 2025).
2. **Analytics** — trend and facility charts.
3. **Entries** — filter list; data entry submits drafts; auditor approves/locks.
4. **Export** — admin/auditor dashboards: **Export Report** (Excel).

---

## npm scripts

### API (`api/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | `tsx watch` on port 5000 |
| Build | `npm run build` | Compile TypeScript to `dist/` |
| Start (prod) | `npm run start` | Run compiled `dist/index.js` |
| Migrate (deploy) | `npm run db:migrate` | `prisma migrate deploy` |
| Seed | `npm run prisma:seed` | Load demo data |

### Web (`web/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Vite dev server |
| Build | `npm run build` | Production build to `dist/` |
| Preview build | `npm run preview` | Serve `dist/` locally |

---

## Configuration

Copy examples before first run (`.env` files are gitignored):

- `api/.env.example` → `api/.env`
- `web/.env.example` → `web/.env`

| Variable | Package | Default | Description |
|----------|---------|---------|-------------|
| `DATABASE_URL` | api | `file:./dev.db` | Prisma URL (SQLite path or MySQL URL) |
| `PORT` | api | `5000` | API listen port |
| `CORS_ORIGIN` | api | `http://localhost:5173` | Comma-separated allowed origins |
| `NODE_ENV` | api | `development` | `production` hides internal error details |
| `VITE_API_URL` | web | `http://localhost:5000` | API base URL (set at **build** time for prod) |

**CORS in development:** When `NODE_ENV` is not `production`, any `http://localhost:*` or `http://127.0.0.1:*` origin is allowed so Vite can use port 5174, 5175, etc. In production, only origins listed in `CORS_ORIGIN` are accepted.

The web client sends the logged-in role as **`X-App-Role`** on API requests so entry create/update/status rules match the UI.

---

## Entry workflow (summary)

| Status | Typical next step | Who |
|--------|-------------------|-----|
| `draft` | `submitted` | Data entry |
| `submitted` | `approved` | Auditor |
| `approved` | `locked` | Auditor |

Data entry can edit values only while status is **draft**. Auditors cannot edit values or submit drafts.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Empty dashboard / charts | Set period to **2025**; confirm API is running and `curl /health` works |
| Browser “Couldn’t load data” / CORS | Ensure API is on port 5000; restart API after changing `.env`; in dev, any localhost Vite port should work |
| `prisma migrate` errors | Run from `api/` with `api/.env` present; delete `dev.db` only if you accept losing local data, then migrate + seed again |
| Seed not applied | From `api/`: `npm run prisma:seed` |

---

## Switching from SQLite (PoC) to MySQL (production)

Application code does not need to change—only Prisma datasource and deployment.

1. Run MySQL (example):

   ```bash
   docker run -d --name esg-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=esg -p 3306:3306 mysql:8
   ```

2. In `api/prisma/schema.prisma`, set `provider = "mysql"` and set `DATABASE_URL` in `api/.env`, for example:

   ```env
   DATABASE_URL="mysql://root:secret@localhost:3306/esg"
   ```

3. Apply schema on the target database:

   ```bash
   cd api
   npx prisma migrate deploy
   npm run prisma:seed
   ```

   Use `migrate deploy` (not `migrate dev`) on shared/production databases.

4. Run API with `NODE_ENV=production` and set `CORS_ORIGIN` to your real frontend URL(s).

5. Build web with production API URL: `VITE_API_URL=https://api.example.com npm run build`, then serve `web/dist`.

Existing SQLite migration SQL under `api/prisma/migrations/` is PoC-specific; a greenfield MySQL deploy may need a new baseline migration after changing the provider.

---

## Production notes

- **CORS:** Production allows only `CORS_ORIGIN` values. Requests without an `Origin` header (e.g. `curl`) are still allowed.
- **Errors:** Validation `400` with `fieldErrors`; permission/workflow conflicts `403`/`409`; generic `500` when `NODE_ENV=production`.
- **JSON body limit:** 1 MB on the API.

Frontend-only commands: [web/README.md](./web/README.md).
