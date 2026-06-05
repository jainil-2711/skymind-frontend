# SkyMind — Frontend

![Frontend CI](https://github.com/jainil-2711/skymind-frontend/actions/workflows/frontend.yml/badge.svg)

AI-powered flight intelligence platform — React/TypeScript frontend.

## Stack

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS v4 (CSS-first, no config file)
- Zustand (auth state) + TanStack Query (server state)
- Axios with JWT interceptor + auto-refresh
- Recharts (analytics)

## Setup

```bash
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL
npm install
npm run dev
```

Requires the backend running at the configured `VITE_API_URL`.

## Environment

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL e.g. `http://127.0.0.1:8000/api/v1` |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Production build |
| `npx eslint .` | Lint |
| `npx tsc --noEmit --project tsconfig.app.json` | Type-check |