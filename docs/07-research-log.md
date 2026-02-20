# Research Log

**Project:** TaskHub  
**Date:** 2026-02-19  

---

## Sources Consulted

### 1. OWASP ASVS v4.0.3 — Application Security Verification Standard

**URL:** https://owasp.org/www-project-application-security-verification-standard/  
**Decision influenced:** Password hashing algorithm selection, session management, input validation depth  
**Key takeaway:** V2.4.1 requires bcrypt/scrypt/Argon2 with appropriate cost factors. V3.4 specifies cookie attributes (HttpOnly, Secure, SameSite). We mapped our controls to ASVS sections V2 (Authentication), V3 (Session Management), and V5 (Validation).

### 2. OWASP Top 10 (2021)

**URL:** https://owasp.org/www-project-top-ten/  
**Decision influenced:** Threat model structure, security priorities  
**Key takeaway:** A01:Broken Access Control drove our multi-tenant enforcement and RBAC design. A07:Identification & Authentication Failures drove our user enumeration prevention and brute-force protection.

### 3. RFC 7807 — Problem Details for HTTP APIs

**URL:** https://datatracker.ietf.org/doc/html/rfc7807  
**Decision influenced:** API error format  
**Key takeaway:** Standardised error responses with `type`, `title`, `status`, `detail` fields. We extended with `correlationId` for tracing. Validation errors return field-level detail arrays.

### 4. RFC 7232 — HTTP Conditional Requests (ETags)

**URL:** https://datatracker.ietf.org/doc/html/rfc7232  
**Decision influenced:** Concurrency control mechanism  
**Key takeaway:** ETag + If-Match provides standard HTTP-level optimistic concurrency. We return `ETag: "{version}"` and require `If-Match` on update/delete. 412 Precondition Failed on mismatch.

### 5. OWASP Session Management Cheat Sheet

**URL:** https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html  
**Decision influenced:** Cookie configuration, session lifecycle  
**Key takeaway:** HttpOnly flag prevents XSS theft. Secure flag ensures HTTPS-only transmission. SameSite=Strict provides CSRF protection. We chose Strict over Lax because TaskHub has no cross-site navigation requirements.

### 6. OWASP Authentication Cheat Sheet

**URL:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html  
**Decision influenced:** User enumeration prevention, login response design  
**Key takeaway:** "Do not reveal whether the user ID or password was incorrect" — we return the same error message and run password hash comparison even when the user doesn't exist (timing mitigation).

### 7. Microsoft .NET Rate Limiting Documentation

**URL:** https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit  
**Decision influenced:** Rate limiting implementation approach  
**Key takeaway:** .NET's built-in rate limiting is available but `AspNetCoreRateLimit` package offers more granular per-endpoint control with IP-based policies. We chose the package for endpoint-specific rules.

### 8. C4 Model for Software Architecture

**URL:** https://c4model.com/  
**Decision influenced:** Architecture documentation structure  
**Key takeaway:** Four levels of abstraction (Context → Container → Component → Code) provide clarity for different audiences. We documented Context, Container, and Component levels.

### 9. Clean Architecture — Robert C. Martin

**URL:** https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html  
**Decision influenced:** Backend project structure, dependency direction  
**Key takeaway:** Dependency rule — outer layers depend on inner, never reverse. Domain has zero dependencies. Application defines interfaces. Infrastructure implements them. This enables storage provider switching.

### 10. BCrypt Cost Factor Analysis

**URL:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html  
**Decision influenced:** BCrypt work factor selection  
**Key takeaway:** OWASP recommends minimum cost factor 10. We chose 12 (~250ms on modern hardware) balancing security vs latency. Argon2id is recommended but has .NET implementation concerns.

### 11. SameSite Cookie Attribute — OWASP

**URL:** https://owasp.org/www-community/SameSite  
**Decision influenced:** CSRF protection strategy  
**Key takeaway:** SameSite=Strict prevents the browser from sending cookies on any cross-site request, making traditional CSRF attacks infeasible. We rely on this instead of CSRF tokens, with justification documented in ADR 0006.

### 12. Atomic File Writes — Best Practices

**URL:** https://lwn.net/Articles/457667/ (+ general systems programming guidance)  
**Decision influenced:** File storage implementation  
**Key takeaway:** Write to temp file, fsync, then rename is the standard pattern for atomic file updates. Rename is atomic on most filesystems. We use this with SemaphoreSlim per-file for concurrency safety.

### 13. Keep a Changelog

**URL:** https://keepachangelog.com/en/1.1.0/  
**Decision influenced:** CHANGELOG format  
**Key takeaway:** Standardised categories (Added, Changed, Deprecated, Removed, Fixed, Security) make changelogs human-readable and parseable.

### 14. TanStack Query (React Query) Documentation

**URL:** https://tanstack.com/query/latest  
**Decision influenced:** Frontend data fetching and caching strategy  
**Key takeaway:** Automatic cache invalidation, optimistic updates with rollback, and stale-while-revalidate pattern. We use `useMutation` with `onError` rollback for the toggle bug fix.
