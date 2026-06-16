# JobTrackr

[![CI](https://github.com/MohammadAlfalah/jobtrackr/actions/workflows/ci.yml/badge.svg)](https://github.com/MohammadAlfalah/jobtrackr/actions/workflows/ci.yml)
![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A full-stack web app for tracking internship and job applications through every
stage — from *wishlist* to *offer accepted*. Built to manage my own search for a
software-engineering internship in Germany, and as an end-to-end demonstration of
a typed REST API, token auth, a React SPA, tests, and a containerised dev setup.

> **Why this project?** Most application trackers are spreadsheets. I wanted a real
> tool — with proper authentication, a status workflow that prevents nonsensical
> state changes, and a dashboard that tells me at a glance how my search is going.

---

## Screenshots

<!-- Add screenshots / a short GIF here once you run the app (see "Getting started").
     A dashboard screenshot is the single highest-impact thing for a recruiter. -->

| Dashboard | Add / edit application |
|---|---|
| _add `docs/dashboard.png`_ | _add `docs/form.png`_ |

---

## Features

- 🔐 **JWT authentication** — register / log in; every request is scoped to the signed-in user, so applications are private.
- 🗂️ **Track applications** — company, position, location, status, applied date, link to the posting, and free-text notes.
- 🔄 **A real status workflow** — applications move through `Wishlist → Applied → Interviewing → Offer → Accepted` (with `Rejected` / `Withdrawn` as exits). Illegal jumps (e.g. `Rejected → Interviewing`) are rejected by the API, so the data stays trustworthy.
- 📊 **Dashboard stats** — totals, how many are still active, and a breakdown per status.
- 🔎 **Filter** by status.
- ✅ **Tested** — 16 backend tests covering the workflow rules and per-user data isolation.
- 🐳 **One-command setup** — `docker compose up` runs the API and the web client together.
- ⚙️ **CI** — GitHub Actions builds and tests the backend and builds the frontend on every push.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite), plain CSS |
| Backend | ASP.NET Core 10 Web API (C#) |
| Auth | JWT bearer tokens, BCrypt password hashing |
| Data | Entity Framework Core 10 + **SQLite** (zero-config; clone and run) |
| Tests | xUnit + EF Core (in-memory SQLite) |
| Tooling | Docker / Docker Compose, GitHub Actions |

## Architecture

```
React + TypeScript SPA
        │  fetch /api/...  (JWT in Authorization header)
        ▼
ASP.NET Core Web API
  Controllers ─▶ Services (business rules: StatusWorkflow) ─▶ EF Core ─▶ SQLite
```

The backend keeps controllers thin and puts the interesting logic — the status
state machine and the per-user scoping — in a service layer that is unit-tested
without a web server or a real database.

## Repository layout

```
jobtrackr/
├─ backend/
│  ├─ JobTrackr.Api/        ASP.NET Core Web API (controllers, services, EF Core, auth)
│  ├─ JobTrackr.Tests/      xUnit tests
│  └─ Dockerfile
├─ frontend/                React + TypeScript (Vite) single-page app
├─ .github/workflows/ci.yml CI pipeline
└─ docker-compose.yml
```

---

## Getting started

### Option A — Docker (recommended)

Requires Docker Desktop.

```bash
docker compose up --build
```

Then open the web app at **http://localhost:8080**. Register an account and start
adding applications.

### Option B — Run the two apps manually

**Backend** (needs the .NET 10 SDK):

```bash
cd backend/JobTrackr.Api
dotnet run
# API on http://localhost:5080, Swagger UI at http://localhost:5080/swagger
```

**Frontend** (needs Node 20+):

```bash
cd frontend
npm install
npm run dev
# Web app on http://localhost:5173 (its dev server proxies /api to the backend)
```

---

## API reference

All application endpoints require `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Route | Body | Description |
|---|---|---|---|
| `POST` | `/register` | `{ email, password }` | Create an account, returns `{ token, email }`. |
| `POST` | `/login` | `{ email, password }` | Returns `{ token, email }`. |

### Applications — `/api/applications`
| Method | Route | Description |
|---|---|---|
| `GET` | `/?status={status}` | List the user's applications (optional status filter). |
| `GET` | `/stats` | Dashboard summary (`total`, `byStatus`, `activeCount`). |
| `GET` | `/{id}` | Get one application. |
| `POST` | `/` | Create an application. |
| `PUT` | `/{id}` | Update an application (an illegal status change returns `400` with an explanation). |
| `DELETE` | `/{id}` | Delete an application. |

## The status workflow

This is the core business rule of the app. The allowed transitions live in one
small, well-documented file —
[`StatusWorkflow.cs`](backend/JobTrackr.Api/Services/StatusWorkflow.cs) — so the
hiring process is modelled explicitly instead of letting any status flip to any
other:

```
Wishlist     → Applied, Withdrawn
Applied      → Interviewing, Offer, Rejected, Withdrawn
Interviewing → Offer, Rejected, Withdrawn
Offer        → Accepted, Rejected, Withdrawn
Accepted / Rejected / Withdrawn → (terminal)
```

## Running the tests

```bash
cd backend
dotnet test
```

16 tests cover the status-transition rules, per-user data isolation (a user can
never read or edit another user's applications), the applied-date stamping, and
the dashboard stats.

---

## Roadmap

- Reminders / follow-up dates for applications awaiting a response.
- CSV / JSON export.
- Tags and full-text search over notes.
- Deploy a live demo.

## License

MIT — see [LICENSE](LICENSE).
