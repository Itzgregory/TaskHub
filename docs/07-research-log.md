# Research Log: TaskHub

**Date:** February 23, 2026

---

## Sources Consulted

This documents the external references that shaped key decisions in the project.

---

**OWASP Application Security Verification Standard (ASVS v4.0.3)** shaped the approach to password hashing, session management, and input validation. The standard requires strong hashing algorithms like bcrypt with appropriate cost factors, and specifies exactly which cookie attributes are needed for secure sessions. Security controls were mapped against the authentication, session management, and validation sections.

**OWASP Top 10 (2021)** informed the overall threat model. Two entries were particularly relevant: broken access control, which drove the multi-tenant enforcement design, and authentication failures, which drove the decision to prevent user enumeration and add brute-force protection.

**RFC 7807 — Problem Details for HTTP APIs** defined the error response format used throughout the API. Every error returns a structured object with a type, title, status, and detail. A correlation ID was added on top for tracing purposes.

**RFC 7232 — HTTP Conditional Requests** provided the standard for optimistic concurrency via ETags. Every update requires an If-Match header, and a version mismatch returns a 412 Precondition Failed.

**OWASP Session Management Cheat Sheet** specified the cookie configuration: HttpOnly to block JavaScript access, Secure to enforce HTTPS-only transmission, and SameSite=Strict for CSRF protection. Strict was chosen over Lax because the app has no cross-site navigation needs.

**OWASP Authentication Cheat Sheet** reinforced the decision to return the same error message whether a username doesn't exist or the password is wrong — and to always run the password comparison regardless, to prevent timing-based user enumeration.

**Microsoft .NET Rate Limiting Documentation** was consulted when choosing how to implement per-endpoint IP-based rate limiting. The built-in .NET middleware was considered but the AspNetCoreRateLimit package was chosen for its more granular per-endpoint control.

**The C4 Model** provided the framework for architecture documentation — four levels of abstraction from high-level context down to components, each suited to a different audience. Context, container, and component levels were documented.

**Clean Architecture (Robert C. Martin)** defined the backend project structure. The core rule — outer layers depend on inner ones, never the reverse — means the domain has zero external dependencies, and storage can be swapped without touching business logic.

**OWASP Password Storage Cheat Sheet** informed the BCrypt cost factor decision. OWASP recommends a minimum of 10; cost factor 12 was chosen, which takes around 250ms per hash on modern hardware — slow enough to make brute-forcing expensive, fast enough not to noticeably affect login performance.

**OWASP SameSite Cookie Guidance** confirmed that SameSite=Strict makes traditional CSRF attacks infeasible on its own, removing the need for separate CSRF tokens. This decision is documented in the architecture decision records.

**Atomic File Write Patterns** — the standard approach of writing to a temporary file, syncing, then renaming was followed for all file storage operations. Rename is atomic on most filesystems, so the original file is never left in a corrupted state. Per-file semaphore locking handles concurrent access.

**Keep a Changelog** provided the format used for the project changelog — standardised categories (Added, Changed, Fixed, Security, etc.) that are easy for both humans and tools to parse.

**TanStack Query (React Query) Documentation** guided the frontend data fetching strategy, particularly the use of optimistic updates with automatic rollback on error — directly relevant to the todo toggle bug fix.