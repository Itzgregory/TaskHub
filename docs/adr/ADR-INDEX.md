# Architecture Decision Records (ADRs)

**Project:** TaskHub  
**Total ADRs:** 12  

---

## ADR 0001: Adopt Clean Architecture

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Need architecture that separates business logic from infrastructure, enables testing, supports future changes.

**Decision:**  
Implement Clean Architecture with 4 layers: Domain (pure logic) → Application (use cases) → Infrastructure (external concerns) → API (HTTP). Dependency rule: outer depends on inner, never reverse.

**Consequences:**
- ✅ Business logic testable without mocks
- ✅ Can swap storage implementations
- ✅ Clear boundaries prevent coupling
- ❌ More files/folders
- ❌ Mapping overhead (entities → DTOs)

---

## ADR 0002: File-Based Storage with Atomic Writes

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Spec requires persistence without traditional database. Need reliable file storage.

**Decision:**  
Store each entity type in separate JSON file with atomic write pattern: write to `.tmp`, rename on success. Per-file `SemaphoreSlim` prevents concurrent corruption.

**Alternatives Considered:**
- SQLite: Adds database dependency
- Single JSON file: Large file performance issues
- No atomicity: Risk of corruption

**Consequences:**
- ✅ Simple, no database setup
- ✅ Human-readable data
- ✅ Atomic writes prevent corruption
- ❌ No transactions across files
- ❌ Doesn't scale horizontally
- ❌ Performance degrades with large files

---

## ADR 0003: Optimistic Concurrency with ETags

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Multiple users editing same todo simultaneously could cause lost updates.

**Decision:**  
Use optimistic locking: every todo has `Version` field (starts at 1). Updates require current version. Return 412 if mismatch. ETag header = `"{version}"`.

**Alternatives Considered:**
- Pessimistic locking: Complex with file storage
- Last-write-wins: Unacceptable data loss
- No concurrency control: Business risk

**Consequences:**
- ✅ Prevents lost updates
- ✅ Works with HTTP caching (ETag)
- ✅ Client gets clear error, can retry
- ❌ User must reload on conflict

---

## ADR 0004: Repository Pattern for Storage Abstraction

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Need to support both InMemory (dev/test) and File (production) storage.

**Decision:**  
Define repository interfaces in Application layer. Implement InMemory and File variants in Infrastructure. Switch via DI configuration.

**Consequences:**
- ✅ Can swap storage without changing handlers
- ✅ Easy to add database later
- ✅ InMemory repositories enable fast tests
- ❌ Abstraction can't expose storage-specific features

---

## ADR 0005: BCrypt for Password Hashing

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
OWASP ASVS requires strong password hashing.

**Decision:**  
Use BCrypt with work factor 12. Reject Argon2 due to .NET 10 support issues.

**Alternatives Considered:**
- PBKDF2: Less secure
- Argon2: Best security, but implementation concerns
- SHA256: Cryptographic hash, not password hash

**Consequences:**
- ✅ Industry standard, battle-tested
- ✅ Work factor adjustable for future
- ❌ Slightly slower than PBKDF2 (acceptable trade-off)

---

## ADR 0006: Session-Based Authentication (Not JWT)

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Spec says "session cookies for authentication (no JWT required)".

**Decision:**  
Use session cookies. Store session ID in HTTP-only, Secure, SameSite=Strict cookie. Session data in repository (InMemory or File).

**Alternatives Considered:**
- JWT: Stateless but spec discourages
- API keys: Not suitable for browser apps

**Consequences:**
- ✅ Spec compliant
- ✅ Easy to revoke (delete session)
- ✅ HttpOnly prevents XSS theft
- ❌ Requires session storage
- ❌ Not ideal for mobile/SPA (but acceptable)

---

## ADR 0007: Use Case Pattern (One Handler Per Operation)

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Application layer needs clear structure for business operations.

**Decision:**  
Each operation = dedicated folder with Command, Response, Validator, Handler. Handlers orchestrate domain entities + repositories.

**Consequences:**
- ✅ Single Responsibility Principle
- ✅ Easy to test individual operations
- ✅ Clear dependencies per use case
- ❌ More files (35 handlers)

---

## ADR 0008: Schema Versioning for File Migrations

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
JSON file structure may evolve over time.

**Decision:**  
Every file has `schemaVersion` field. Migration runner detects version, runs migrations sequentially. Example: V1→V2 migration implemented.

**Consequences:**
- ✅ Safe schema evolution
- ✅ Prevents breaking old data
- ✅ Atomic migrations with file locks
- ❌ Manual migration authoring

---

## ADR 0009: RBAC with Two Roles (Member, OrgAdmin)

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Need authorization without complexity.

**Decision:**  
Two roles: **Member** (create/edit todos), **OrgAdmin** (+ manage members, hard delete, view audit). Role is property of Membership (not User).

**Alternatives Considered:**
- Fine-grained permissions: Too complex for MVP
- Everyone is admin: Security risk

**Consequences:**
- ✅ Simple, easy to understand
- ✅ Covers 90% of use cases
- ❌ Can't have custom roles (accepted for MVP)

---

## ADR 0010: Soft Delete with Restore

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Users accidentally delete important todos.

**Decision:**  
Soft delete: set `IsDeleted=true`, `DeletedAt=timestamp`. Excluded from default lists. Restore reverses. Only OrgAdmins can hard delete.

**Consequences:**
- ✅ User-friendly recovery
- ✅ Audit trail preserved
- ❌ Storage not reclaimed automatically
- ❌ Need purge strategy (future)

---

## ADR 0011: Correlation IDs for Request Tracing

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Need to trace requests across logs and audit entries.

**Decision:**  
Middleware generates GUID for each request. Stored in `HttpContext.Items`. Included in response header (`X-Correlation-ID`), logs, and audit entries.

**Consequences:**
- ✅ Easy to trace user actions
- ✅ Debug distributed issues
- ✅ Link audit entries to HTTP requests

---

## ADR 0012: Background Job for Automatic Archiving

**Date:** 2026-02-19  
**Status:** ✅ Accepted  

**Context:**  
Completed todos clutter active lists over time.

**Decision:**  
Hosted service runs daily, archives todos where `Status=Done` and `UpdatedAt < 90 days ago`. Configurable via appsettings.

**Alternatives Considered:**
- Manual admin action only: Requires discipline
- Never archive: Lists grow indefinitely

**Consequences:**
- ✅ Automatic cleanup
- ✅ Configurable threshold
- ❌ Runs even if no todos to archive (minor overhead)

---

## ADR Template (for future decisions)

```markdown
# ADR XXXX: [Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded  

**Context:**  
What is the issue we're seeing that is motivating this decision?

**Decision:**  
What is the change we're proposing?

**Alternatives Considered:**  
What other options did we evaluate?

**Consequences:**  
✅ Positive impacts  
❌ Negative impacts  
```

---

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 0001 | Clean Architecture | Accepted | 2026-02-19 |
| 0002 | File-Based Storage | Accepted | 2026-02-19 |
| 0003 | Optimistic Concurrency | Accepted | 2026-02-19 |
| 0004 | Repository Pattern | Accepted | 2026-02-19 |
| 0005 | BCrypt Hashing | Accepted | 2026-02-19 |
| 0006 | Session Authentication | Accepted | 2026-02-19 |
| 0007 | Use Case Pattern | Accepted | 2026-02-19 |
| 0008 | Schema Versioning | Accepted | 2026-02-19 |
| 0009 | RBAC (2 Roles) | Accepted | 2026-02-19 |
| 0010 | Soft Delete | Accepted | 2026-02-19 |
| 0011 | Correlation IDs | Accepted | 2026-02-19 |
| 0012 | Background Archiving | Accepted | 2026-02-19 |
