# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-25

### Added
- Rate limiting on authentication endpoints (login: 10 req/min/IP, register: 5 req/hr/IP)
- Returns `429 Too Many Requests` with `Retry-After` header when limit exceeded
- Integration test proving rate limit enforcement

### Security
- Mitigates brute-force and credential-stuffing attacks on login/register endpoints
- Complements existing BCrypt hashing (cost 12) and account lockout (5 attempts)

## [1.1.0] - 2026-02-22

### Added
- **Archive completed todos** — background job archives Done todos older than N days
  - Configurable via `ArchiveSettings:ArchiveAfterDays` (default: 90)
  - Job runs every `ArchiveSettings:IntervalHours` hours (default: 24)
  - Archived items hidden from default list, visible with `includeArchived=true`
  - Archived items remain restorable
- `IsArchived` and `ArchivedAt` fields on TodoItem entity
- Audit log entries for automatic archival events

### Changed
- File storage schema upgraded to v2 (automatic migration on startup)

## [1.0.1] - 2026-02-20

### Fixed
- **Rapid toggle bug** — rapid toggling of todo status showed incorrect UI state until refresh
  - Root cause: hardcoded `version = 1` in frontend toggle handler
  - Fix: sync version from API response, debounce rapid clicks, rollback on conflict
  - Added frontend guard to prevent concurrent toggle mutations
  - Added cache invalidation on 412/409 conflict to restore correct server state

## [1.0.0] - 2026-02-19

### Added
- Multi-tenant todo management platform
- Session-based authentication with BCrypt password hashing
- RBAC: Member and OrgAdmin roles
- Todo CRUD with optimistic concurrency (ETag/version)
- Soft delete and restore for todos (hard delete OrgAdmin only)
- Audit logging for auth, todo, and org events
- Import/export todos as JSON with validation and rejection reporting
- Dual storage: InMemory and File-based with atomic writes
- File storage schema versioning with v1 → v2 migration
- Correlation ID middleware (end-to-end request tracing)
- Health endpoints (liveness + readiness)
- Structured logging with Serilog
- React frontend with TanStack Router, React Query, shadcn/ui
- Organisation selection and switching
- Todo list with filtering, sorting, pagination
- Optimistic status toggle with rollback on failure
