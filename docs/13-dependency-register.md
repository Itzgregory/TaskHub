# Dependency Register

**Project:** TaskHub  
**Date:** 2026-02-19  

---

## Backend Dependencies (.NET 10)

| Package | Version | Purpose | Risk |
|---------|---------|---------|------|
| **BCrypt.Net-Next** | 5.0.0 | Password hashing with configurable cost factor | Low — well-maintained, single purpose |
| **Serilog.AspNetCore** | 10.0.0 | Structured logging to console/file | Low — industry standard, no network calls |
| **Serilog.Sinks.Console** | 6.0.0 | Console output for structured logs | Low — output sink only |
| **Serilog.Sinks.File** | 6.0.0 | File output for structured logs | Low — output sink only |
| **FluentValidation** | 11.11.0 | Request validation with fluent API | Low — pure validation, no side effects |
| **AspNetCoreRateLimit** | 5.0.0 | IP-based rate limiting for auth endpoints | Medium — middleware in request pipeline; uses MemoryCache |
| **Swashbuckle.AspNetCore** | 7.2.0 | OpenAPI/Swagger documentation generation | Low — dev dependency, can be excluded from production |
| **xunit** | 2.9.3 | Unit and integration testing framework | Low — test-only dependency |
| **FluentAssertions** | 7.1.0 | Readable test assertions | Low — test-only dependency |
| **Microsoft.AspNetCore.Mvc.Testing** | 10.0.0 | Integration test host | Low — test-only dependency |
| **Moq** | 4.20.72 | Test mocking framework | Low — test-only dependency |

### Risk Assessment

- **No database driver** — by design; storage is file-based or in-memory
- **No ORM** — by design; entities are serialised directly to JSON
- **No external HTTP clients** — the backend makes no outbound network requests
- **Minimal attack surface** — only `AspNetCoreRateLimit` adds middleware to the request pipeline

---

## Frontend Dependencies (Node.js)

| Package | Version | Purpose | Risk |
|---------|---------|---------|------|
| **React** | 19.x | UI framework | Low — maintained by Meta |
| **React DOM** | 19.x | DOM rendering for React | Low — core React dependency |
| **TypeScript** | 5.9.x | Static type checking | Low — dev-only, compile-time |
| **Vite** | 7.x | Build tool and dev server | Low — no runtime footprint |
| **TanStack Router** | latest | File-based routing with type safety | Medium — newer library, but actively maintained |
| **TanStack React Query** | latest | Server state management, caching, mutations | Low — mature, widely adopted |
| **Radix UI** (various) | latest | Accessible headless UI primitives (dialog, select, etc.) | Low — no styling, minimal footprint |
| **shadcn/ui** | latest | Pre-built UI components on Radix | Low — copied into project (not an npm dependency) |
| **Lucide React** | latest | Icon library | Low — tree-shakeable SVG icons |
| **class-variance-authority** | latest | Component variant management | Low — tiny utility |
| **clsx** + **tailwind-merge** | latest | Class name merging | Low — tiny utilities |
| **date-fns** | latest | Date formatting and manipulation | Low — tree-shakeable, no side effects |
| **ESLint** | 9.x | Linting and code quality | Low — dev-only |
| **Tailwind CSS** | 4.x | Utility-first CSS framework | Low — compile-time only |

### Risk Assessment

- **No analytics or tracking SDKs** — user privacy preserved
- **No polyfills** — targets modern browsers only
- **shadcn/ui components are vendored** — copied into `src/components/ui/`, not an npm dependency, so they don't change on `npm install`
- **React Query manages all server state** — reduces risk of stale data and provides automatic cache invalidation

---

## Supply Chain Mitigations

1. **Lock files:** Both `package-lock.json` (frontend) and NuGet lock (backend) are committed
2. **No post-install scripts** — no packages execute code on install
3. **Vendored UI components** — shadcn components are source-copied, immune to supply chain attacks
4. **Minimal dependency count** — backend has 6 runtime dependencies; frontend has ~12
