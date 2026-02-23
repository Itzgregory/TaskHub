# Risk Register: TaskHub

**Last Updated:** February 23, 2026
**Risks Identified:** 12

---

## Overview

12 risks were identified across technical, security, and operational areas. One was considered critical, three high, six medium, and two low priority.

---

## The Risks

**File Storage Corruption** (High) — Because data is stored in flat JSON files rather than a proper database, a crash during a write could corrupt the file entirely. This is partially mitigated by writing to a temporary file first and only replacing the real file once the write succeeds, plus per-file locking to prevent two things writing at the same time. Checksums and automated backups are still planned.

**No Database Transactions** (Medium) — Operations that touch multiple files at once — like creating an organisation and its first membership — could partially fail, leaving the data in an inconsistent state. Cross-file operations are minimised and handlers are made idempotent where possible, but a more robust solution is still planned.

**Brute Force Login Attacks** (Critical) — Automated scripts could hammer the login endpoint trying thousands of passwords. Account lockout after 5 failed attempts is already in place, along with a consistent error message that doesn't reveal whether an email address exists. Rate limiting and CAPTCHA are still to be added.

**Session Hijacking** (High) — A stolen session token would give an attacker full access to a user's account. Secure cookie configuration (HTTP-only, Secure flag, SameSite) and session expiry are all planned but not yet implemented. This is the highest priority item before any production deployment.

**Insufficient Input Validation** (Medium) — Malformed or malicious input could cause unexpected behaviour. Validation is in place at both the domain and application layers, with length limits and format checks throughout. Risk is considered well mitigated at this stage.

**Concurrent Edits Overwriting Each Other** (Low) — Two users editing the same task at the same time could result in one person's changes being silently lost. Fully mitigated through optimistic concurrency — every update checks a version number and rejects stale requests with a clear error.

**Audit Log Tampering** (Medium) — Someone with direct file access could edit or delete audit records. The audit log is append-only in the application code, so no update or delete operations exist. Cryptographic signatures and forwarding logs to an external service are planned for stronger guarantees.

**Scalability Limits** (Medium) — File-based storage doesn't scale horizontally and will slow down with very large datasets. This is an accepted limitation for an MVP. The storage layer is abstracted behind a repository interface specifically to make a future switch to PostgreSQL straightforward.

**Dependency Vulnerabilities** (Medium) — Third-party packages could have known security vulnerabilities. The latest stable versions are in use, and automated vulnerability scanning in CI is planned.

**Unhandled Exceptions** (Low) — Crashes or unexpected errors could expose internal details or bring the API down. Fully mitigated through global exception handling middleware, structured error responses following the RFC 9457 standard, and no stack traces in production.

**No Backup Strategy** (Medium) — There are no automated backups. A hardware failure or accidental deletion would mean permanent data loss. Automated daily backups and a documented recovery procedure are planned but not yet in place.

**Insufficient Documentation** (Low) — Poor documentation makes a system hard to maintain. Well mitigated — architecture documentation, decision records, inline comments, and API docs are all in place.

---

## Top Priorities Before Production

1. **Session hijacking** — secure cookie configuration must be in place before going live
2. **Brute force protection** — rate limiting needs to be added to complement the existing lockout
3. **File storage corruption** — checksums and automated backups to be added shortly after MVP

---

## Risk Summary

| Level | Count |
|-------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 3 |
| 🟡 Medium | 6 |
| 🟢 Low | 2 |