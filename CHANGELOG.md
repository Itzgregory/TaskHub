# Changelog

All notable changes to this project are documented here, newest first.

---

## [1.2.0] — 2026-02-23

### Added
- Rate limiting on the login endpoint (10 requests per minute per IP) and registration endpoint (5 requests per hour per IP)
- Requests that exceed the limit receive a 429 response with a Retry-After header indicating when to try again
- Integration test confirming the rate limit is enforced correctly

### Security
- Reduces exposure to brute-force and credential-stuffing attacks on authentication endpoints
- Works alongside the existing BCrypt password hashing and 5-attempt account lockout

---

## [1.1.0] — 2026-02-19

### Added
- Background job that automatically archives completed tasks older than a configurable number of days (default: 90)
- Job runs on a configurable interval (default: every 24 hours)
- Archived tasks are hidden from the default task list but visible when requested with `includeArchived=true`
- Archived tasks can still be restored at any time
- Archival events are recorded in the audit log

### Changed
- File storage schema upgraded to version 2; migration runs automatically on startup

---

## [1.0.1] — 2026-02-19

### Fixed
- Rapid clicking the status checkbox on a task would leave the UI showing the wrong state until the page was refreshed. Root cause was a hardcoded `version = 1` in the toggle handler. Fixed by syncing the version from the API response, preventing concurrent toggle requests from firing, and rolling back the UI to the correct server state when a conflict is detected.

---

## [1.0.0] — 2026-02-19

### Added
- Multi-tenant task management platform with full organisation isolation
- Session-based authentication with BCrypt password hashing
- Two permission levels: Member and OrgAdmin
- Full task management with optimistic concurrency control using ETags and version numbers
- Soft delete and restore for tasks; permanent deletion restricted to OrgAdmins
- Audit logging covering authentication, task, and organisation events
- Import and export in JSON format with per-row validation and rejection reporting
- Two storage modes: in-memory (for development) and file-based with atomic writes
- File storage schema versioning with automatic v1 to v2 migration
- Correlation ID tracking across all requests end-to-end
- Health check endpoints for liveness and readiness
- Structured logging via Serilog
- React frontend with routing, data fetching, and a component library
- Organisation switching
- Task list with filtering, sorting, and pagination
- Optimistic status toggle with automatic rollback on failure