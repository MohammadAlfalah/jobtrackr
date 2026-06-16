# JobTrackr — Frontend

A clean, modern React + TypeScript (Vite) UI for **JobTrackr**, an
internship/job application tracker. Track applications from wishlist to offer,
see your pipeline at a glance, filter by status, and manage everything in one
place.

## Tech

- **React 19 + TypeScript** (strict mode)
- **Vite** for dev/build
- **Plain CSS** — a single organised stylesheet, no UI framework dependencies

## Getting started

```bash
npm install
npm run dev      # starts the Vite dev server on http://localhost:5173
```

The dev server proxies all `/api` requests to the backend at
`http://localhost:5080` (configured in `vite.config.ts`). Start the backend
first so API calls succeed.

```bash
npm run build    # type-check (tsc -b) + production build into dist/
npm run preview  # preview the production build locally
```

## How it talks to the backend

The app **always** calls the relative `/api/...` base path so the same build
works everywhere:

- **Development** — Vite's dev-server proxy forwards `/api` → `http://localhost:5080`.
- **Production** — served behind nginx, which forwards `/api` to the backend.

The JWT returned by `/api/auth/login` and `/api/auth/register` is stored in
`localStorage` and sent as `Authorization: Bearer <token>` on every
`/api/applications` call. Any `401` clears the token and returns the user to
the login screen.

## Project structure

```
src/
  api/        fetch wrapper + typed endpoint functions
  auth/       token storage + auth context/provider/hook
  components/ reusable UI (cards, badges, modal, form, toasts, …)
  lib/        small helpers (date formatting)
  pages/      AuthPage, DashboardPage
  types.ts    domain types + allowed status-transition rules
  styles.css  the single organised stylesheet
```

## Environment

There are **no required secrets**. See `.env.example` for details.
