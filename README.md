# SkyMind � Frontend

![Frontend CI](https://github.com/jainil-2711/skymind-frontend/actions/workflows/frontend.yml/badge.svg)

AI-powered flight intelligence platform � React/TypeScript frontend.

## Live Demo

https://skymind-frontend.vercel.app  
**Backend:** https://github.com/jainil-2711/skymind-backend

## Architecture

\\\
src/
+-- pages/          # 15 pages � auth, search, planner, analytics, admin
+-- components/
�   +-- layout/     # Sidebar, Topbar, RootLayout
�   +-- ui/         # FlightCard, DestinationRow, ErrorBoundary, ProtectedRoute
+-- stores/         # Zustand � auth state, JWT tokens, persist to localStorage
+-- lib/            # Axios instance � JWT interceptor + auto-refresh on 401
+-- types/          # TypeScript interfaces for all API responses
+-- data/           # 47 IATA airport codes
\\\

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| State | Zustand 5 (auth) + TanStack Query 5 (server) |
| HTTP | Axios 1.16 with JWT interceptor + auto-refresh |
| Charts | Recharts |
| Routing | React Router 7 |

## Design System

Black and white minimalist � Linear/Vercel aesthetic.

| Token | Value |
|-------|-------|
| Background | #000000 |
| Surface | #0a0a0a |
| Border | #171717 |
| Muted text | #525252 |
| Success | #16a34a |
| Warning | #d97706 |
| Danger | #dc2626 |

No gradients. No shadows. No colour accents.

## Local Setup

\\\ash
git clone https://github.com/jainil-2711/skymind-frontend
cd skymind-frontend
cp .env.example .env
npm install && npm run dev
\\\

App at http://localhost:5173 � requires backend running at VITE_API_URL.

## Environment Variables

| Variable | Description |
|---|---|
| VITE_API_URL | Backend base URL e.g. http://127.0.0.1:8000/api/v1 |

## Pages

| Page | Route | Backend |
|------|-------|---------|
| Login | /login | POST /auth/login |
| Register | /register | POST /auth/register |
| Flight Search | /search | POST /flights/search |
| Inspire | /inspire | POST /destinations/inspire |
| AI Planner | /planner | POST /planner/generate |
| Itineraries | /itineraries | GET/DELETE /itineraries |
| Optimal Route | /routes | GET /routes/optimal |
| Multi-City | /multi-city | POST /routes/multi-city |
| Carbon | /carbon | POST /flights/carbon |
| Analytics | /analytics | GET /analytics/* |
| Alerts | /alerts | POST/GET/DELETE /alerts |
| Saved Searches | /saved-searches | GET/DELETE /saved-searches |
| Profile | /profile | GET/PUT /users/me |
| Admin | /admin | GET /admin/* |
| 404 | * | � |

## Scripts

| Command | Description |
|---------|-------------|
| npm run dev | Start dev server on port 5173 |
| npm run build | Production build |
| npx eslint . | Lint |
| npx tsc --noEmit --project tsconfig.app.json | Type-check |
