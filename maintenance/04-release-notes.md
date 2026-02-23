# Release Notes & Operational Updates

## Release Notes (v1.2.0) — 2026-02-25

**Type:** Minor Release

### What's New

#### Rate Limiting on Login & Registration
- Login endpoint: max 10 requests per minute per IP address
- Registration endpoint: max 5 requests per hour per IP address
- When the limit is hit, the API returns `429 Too Many Requests` with a `Retry-After` header
- This adds a second layer of protection on top of the existing account lockout (5 failed attempts locks the account for 15 minutes)

---

## Release Notes (v1.1.0) — 2026-02-22

**Type:** Minor Release

### What's New

#### Automatic Archive of Old Completed Todos
- A background job now automatically archives todos that have been in the "Done" state for more than 90 days (configurable)
- Archived todos are hidden from the default list but can still be viewed by adding `includeArchived=true` to the request
- Archived todos can be restored by any org member
- The job runs by default every 24 hours and logs how many todos it archived per organisation
- The archive threshold and interval are configurable via `appsettings.json` under the `Archive` section

#### Storage Schema Update
- File storage schema upgraded from v1 to v2
- Migration runs automatically on first startup — no manual steps needed

---

## Release Notes (v1.0.1) — 2026-02-20

**Type:** Patch Release

### Bug Fixes

#### Rapid Todo Status Toggle Fixed
- Rapidly clicking the toggle button caused the UI to show the wrong state until the page was refreshed
- Root cause: the frontend was hardcoding `version = 1` instead of using the version returned by the server
- Fix: the frontend now syncs the version from the API response, debounces rapid clicks, and rolls back to the correct server state if a conflict (412) is returned

---

## Release Notes (v1.0.0) — 2026-02-19

**Type:** Initial Release

### What's Included

- Multi-tenant todo management: create organisations, invite members, manage todos per org
- Authentication: username/password login with BCrypt hashing (cost 12) and brute force lockout
- Role-based access: Member and OrgAdmin roles
- Todo features: create, update, toggle status, soft delete, restore, hard delete (admin only)
- Optimistic concurrency: every todo has a version number; conflicting updates return a 412 response
- Import & export: todos can be exported to JSON or CSV, and imported from JSON with row-level error reporting
- Audit log: all significant actions (login, logout, todo changes, org changes) are recorded and viewable by OrgAdmins
- Two storage modes: InMemory (for development) and File-based with atomic writes and schema migrations
- Health check endpoints (liveness + readiness)
- Structured logging with Serilog and correlation IDs on every request
- React frontend with organisation switching, todo list with filtering/sorting/pagination, and optimistic status toggle
