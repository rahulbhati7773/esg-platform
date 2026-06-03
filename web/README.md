# ESG Platform — Web

React + Vite frontend (Tailwind, Tremor). Full clone-to-dashboard instructions are in the [repository README](../README.md).

## Quick start

Prerequisites: API running on port 5000 (see `../api`).

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — **Dashboard** and **Data Entry**.

## Build

```bash
npm run build
npm run preview
```

## API client

Typed helpers in `src/api.ts` (`VITE_API_URL`, default `http://localhost:5000`): catalog, entries, analytics, and `downloadExcelReport`. Types in `src/types.ts`; use `isFieldErrorsError` / `isApiError` for error handling.
