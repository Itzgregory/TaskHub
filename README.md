# TaskHub

A multi-tenant to-do management platform built with .NET 10 and React. TaskHub lets users organise tasks within workspaces (Organisations), with role-based access control, audit logging, import/export, and concurrency-safe updates.

---

## Table of Contents

- [What This System Is](#what-this-system-is)
- [How to Run Locally](#how-to-run-locally)
- [How to Run Tests](#how-to-run-tests)
- [CI Configuration](#ci-configuration)
- [Documentation Guide](#documentation-guide)
- [Known Limitations & Next Steps](#known-limitations--next-steps)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

---

## What This System Is

TaskHub solves the problem of managing todos across multiple teams or clients. Each **Organisation** is an isolated tenant — users can belong to multiple organisations, and all data (todos, audit logs) is scoped per-org.

**Key capabilities:**
- **Multi-tenant:** users belong to one or more Organisations; all todos scoped to an org
- **RBAC:** Member (manage own todos) vs OrgAdmin (manage members, hard delete, view audit)
- **Concurrency safety:** optimistic locking with version/ETag prevents lost updates
- **Audit trail:** all auth, todo, and org events are logged with correlationId
- **Import/Export:** JSON-based with per-row validation and rejection reporting
- **Dual storage:** InMemory (dev/test) and File-based (production) with schema versioning

---

## How to Run Locally

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) ≥ 18
- npm ≥ 9

### Backend

#### InMemory storage (default)

```bash
cd server
make run
```

The API starts at `http://localhost:5078` with InMemory storage by default.

#### File storage

```bash
cd server
run-file
```

Or set the environment variable:

```bash
export StorageProvider=File
dotnet run --project src/TaskHub.Api
```

File storage writes JSON files to `./data/` with atomic writes (temp file + rename). Schema version is persisted in each file and auto-migrated on startup.

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend starts at `http://localhost:5173` and proxies API requests to `http://localhost:5078`.

---

## How to Run Tests

### Backend — Unit Tests

```bash
cd server
dotnet test tests/TaskHub.UnitTests
```

Tests cover:
- Permission checks (Member vs OrgAdmin)
- Validation rules (title length, tag limits, etc.)
- Concurrency conflict detection (version mismatch → 412)
- Import validation and rejection reporting
- Domain entity invariants

### Backend — Integration Tests

```bash
cd server
dotnet test tests/TaskHub.IntegrationTests
```

Tests cover:
- Auth flow + session behaviour
- Multi-tenant enforcement (cannot access other org's data)
- Audit log written correctly for all operations
- Soft delete → restore → hard delete authorisation
- File storage migration (v1 → v2)
- Rate limiting on auth endpoints

### Frontend — Lint + Build

```bash
cd client
npm run lint    # ESLint with React Compiler rules
npm run build   # TypeScript type-check + Vite production build
```

### E2E Tests

```bash
# From project root
npx playwright test
```

E2E flows:
- **Flow A (Member):** Register → Login → Create org → Create todos → Filter/sort/paginate → Export
- **Flow B (OrgAdmin):** Add member → Change role → View audit log → Soft delete + restore → Import with rejection report

---

## CI Configuration

CI runs via GitHub Actions (`.github/workflows/ci.yml`):

1. **Build** — `dotnet build` (backend) + `npm run build` (frontend)
2. **Lint** — `npm run lint` (frontend) + `dotnet format --verify-no-changes` (backend)
3. **Test** — Unit tests, Integration tests, E2E tests
4. **Artifacts** — Test results and coverage summary uploaded

See [docs/ci-pipeline.md](docs/ci-pipeline.md) for full details.

---

## Documentation Guide

All documentation lives in `/docs`:

| File | Contents |
|------|----------|
| [01-project-charter.md](docs/01-project-charter.md) | Goals, scope, constraints, definition of done |
| [02-backlog.md](docs/02-backlog.md) | 30+ backlog items with acceptance criteria |
| [03-estimation-and-plan.md](docs/03-estimation-and-plan.md) | Estimation approach + delivery plan |
| [04-risk-register.md](docs/04-risk-register.md) | 10+ risks with likelihood, impact, mitigation |
| [05-requirements.md](docs/05-requirements.md) | Personas, user journeys, acceptance criteria, failure paths |
| [06-data-and-privacy.md](docs/06-data-and-privacy.md) | Data classification, PII, retention |
| [07-research-log.md](docs/07-research-log.md) | 10+ sources consulted and decisions influenced |
| [08-architecture.md](docs/08-architecture.md) | C4 diagrams (Context, Container, Component) |
| [09-api-contract.md](docs/09-api-contract.md) | Endpoints, schemas, pagination, auth model |
| [10-data-model-and-state.md](docs/10-data-model-and-state.md) | Entity relationships, state machine, concurrency |
| [11-threat-model.md](docs/11-threat-model.md) | 15+ threats (STRIDE), mitigations, residual risks |
| [12-ops-design.md](docs/12-ops-design.md) | Logging, health checks, migration, backup strategy |
| [13-dependency-register.md](docs/13-dependency-register.md) | Every library, why it exists, risk it introduces |
| [14-test-strategy.md](docs/14-test-strategy.md) | Unit/integration/E2E rationale and coverage |
| [docs/adr/](docs/adr/) | 12 Architecture Decision Records |

Maintenance simulations live in `/maintenance`:

| File | Contents |
|------|----------|
| [01-bug-repro-and-fix.md](maintenance/01-bug-repro-and-fix.md) | Rapid toggle bug — repro, root cause, fix, tests |
| [02-archive-change.md](maintenance/02-archive-change.md) | Archive todos older than N days — implementation |
| [03-auth-abuse-protection.md](maintenance/03-auth-abuse-protection.md) | Rate limiting on auth endpoints |
| [04-release-notes.md](maintenance/04-release-notes.md) | Release notes for non-technical stakeholders |
| [05-post-incident-report.md](maintenance/05-post-incident-report.md) | Simulated incident write-up |

---

## Known Limitations & Next Steps

### Current Limitations
- **File storage** does not scale horizontally — a single process must own the files
- **No WebSocket support** — UI requires manual refresh for changes made by other users
- **Session storage** is in-process — restarting the server invalidates all sessions
- **Frontend types are manually defined** — not auto-generated from OpenAPI spec (see ADR 0009)
- **E2E test coverage** is limited to happy paths

### Planned Next Steps
- Database storage provider (PostgreSQL)
- Auto-generate frontend types from OpenAPI
- WebSocket notifications for real-time collaboration
- Advanced filtering (date ranges, multiple tags, full-text search)
- Batch operations (bulk delete, bulk archive)
- CAPTCHA fallback after repeated rate-limit hits

---

## Troubleshooting

### Backend won't start
- Ensure .NET 10 SDK is installed: `dotnet --version` should show `10.x`
- Check port 5078 is free: `lsof -i :5078`
- For file storage, ensure the `./data/` directory is writable

### Frontend won't start
- Ensure Node ≥ 18: `node --version`
- Run `npm install` before `npm run dev`
- If port 5173 is taken, Vite will auto-pick the next available port

### API returns 401 Unauthorized
- Session may have expired — re-login
- Ensure cookies are being sent (check `credentials: 'include'` in fetch config)
- Check that the session cookie has not been blocked by browser (SameSite policy)

### API returns 412 Precondition Failed
- Another user (or tab) has modified the resource since you loaded it
- Refresh the page to get the latest version, then retry your edit

### File storage errors
- Check disk space: `df -h`
- Ensure atomic write temp directory is on the same filesystem as data directory
- Check file permissions on `./data/`

### Tests fail with "connection refused"
- Ensure the backend is not running on the same port as integration tests
- Integration tests use `WebApplicationFactory` and don't need a running server

---

## Security Notes

### User Enumeration Prevention
- Login failures return a generic "Invalid credentials" message regardless of whether the email exists
- Registration does not reveal whether an email is already taken (returns success with a "check your email" message)
- Timing differences are minimised by always running the password hash comparison

### Session Protection
- Session ID stored in **HttpOnly** cookie (cannot be read by JavaScript)
- **Secure** flag set in production (cookie only sent over HTTPS)
- **SameSite=Strict** prevents cross-site request inclusion
- Sessions stored server-side; cookie contains only the session ID
- Sessions expire after configurable idle timeout

### CSRF Approach
- **SameSite=Strict** cookies provide primary CSRF protection
- State-changing requests (POST/PUT/DELETE) validate the session cookie
- The API does not accept authentication via URL parameters or custom headers that could be set cross-origin
- This approach is justified because SameSite=Strict prevents the browser from sending cookies on cross-origin requests entirely, making traditional CSRF attacks infeasible (see [OWASP SameSite guidance](https://owasp.org/www-community/SameSite))

### What We Do Not Log
- **Passwords** — never logged, even in hashed form
- **Session tokens** — only the session ID prefix (first 8 chars) appears in logs for correlation
- **Request bodies** for auth endpoints — login/register payloads are excluded from request logging
- **Full IP addresses** — stored temporarily for rate limiting, not persisted to audit logs

---

## Repository Structure

```
TaskHub/
├── client/                  # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/      # UI and feature components
│   │   ├── pages/           # Route pages
│   │   ├── lib/             # Store, API client, utilities
│   │   └── hooks/           # Custom React hooks
│   └── package.json
├── server/                  # .NET 10 backend (Clean Architecture)
│   ├── src/
│   │   ├── TaskHub.Api/          # HTTP layer (controllers, middleware)
│   │   ├── TaskHub.Application/  # Use cases, validators, interfaces
│   │   ├── TaskHub.Domain/       # Entities, enums, value objects
│   │   └── TaskHub.Infrastructure/ # Storage, services, background jobs
│   └── tests/
│       ├── TaskHub.UnitTests/
│       └── TaskHub.IntegrationTests/
├── docs/                    # All SDLC documentation
│   └── adr/                 # Architecture Decision Records
├── maintenance/             # Maintenance simulation deliverables
├── .editorconfig            # Formatting rules
├── CHANGELOG.md             # Release history
└── README.md                # This file
```
