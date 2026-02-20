# Estimation Approach & Delivery Plan

**Project:** TaskHub  
**Date:** 2026-02-19  

---

## Estimation Method: T-Shirt Sizes

We use **T-shirt sizing** (XS, S, M, L, XL) to estimate effort for each backlog item.

| Size | Rough Hours | Description |
|------|-------------|-------------|
| **XS** | 1–2h | Config change, copy update, single-file fix |
| **S** | 2–4h | Single feature with tests, one layer touched |
| **M** | 4–8h | Feature spanning 2–3 layers, multiple tests |
| **L** | 1–2 days | Cross-cutting concern, migration, multi-file |
| **XL** | 2–4 days | New subsystem, major refactor, E2E flow |

### How We'd Use This in a Team

1. **Backlog refinement** — team reviews items, discusses scope, assigns T-shirt size
2. **Sprint planning** — convert sizes to capacity: S=0.5 day, M=1 day, L=2 days, XL=3 days
3. **Velocity tracking** — measure completed sizes per sprint, adjust future capacity
4. **Scope negotiation** — if sprint is overloaded, defer L/XL items first

---

## Delivery Plan

### Week 1: Foundation (MVP Core)

| Day | Focus | Items |
|-----|-------|-------|
| Mon | Project setup, architecture scaffolding | Clean Architecture layers, InMemory storage |
| Tue | Auth (register, login, logout, sessions) | BCrypt hashing, cookie config, session store |
| Wed | Org management (create, membership, switching) | Multi-tenant enforcement, RBAC |
| Thu | Todo CRUD (create, read, update, list) | Validation, optimistic concurrency |
| Fri | Todo lifecycle (toggle, soft delete, restore) | Hard delete (OrgAdmin), filters/sort/pagination |

**Checkpoint:** Design review — API contract + data model

### Week 2: Security + Quality

| Day | Focus | Items |
|-----|-------|-------|
| Mon | Audit logging (all event types) | CorrelationId, structured logging |
| Tue | Import/Export with validation | Rejection reporting, idempotency |
| Wed | File storage (atomic writes, locking) | Schema versioning, v1→v2 migration |
| Thu | Security hardening | Rate limiting, user enumeration prevention, CSRF |
| Fri | Testing (unit + integration) | Permission checks, concurrency, multi-tenant |

**Checkpoint:** Security review — threat model + mitigations

### Week 3: Frontend + Polish

| Day | Focus | Items |
|-----|-------|-------|
| Mon | Frontend: auth screens, org selection | Login, register, org switching |
| Tue | Frontend: todo list, filters, pagination | Create/edit form, optimistic toggle |
| Wed | Frontend: error states, loading, accessibility | Keyboard navigation, labels, error messages |
| Thu | E2E tests (Flow A + Flow B) | CI pipeline setup |
| Fri | Documentation, maintenance tasks | ADRs, bugfix, archive, rate limiting |

**Checkpoint:** Pre-release review — full test suite green, docs complete

### Week 4: Hardening + Handover

| Day | Focus | Items |
|-----|-------|-------|
| Mon | Bug fixes, edge cases | Toggle race condition, archive filtering |
| Tue | Performance review, file storage load testing | Health checks, readiness probe |
| Wed | Release notes, CHANGELOG, post-incident report | Maintenance deliverables |
| Thu | README polish, troubleshooting guide | Final doc review |
| Fri | **Handover** | Demo, Q&A, submission |

---

## Risk-Adjusted Schedule

- **Buffer:** 20% of each week reserved for unplanned work
- **Critical path:** Auth → Multi-tenant → Todo CRUD → Concurrency → File Storage
- **Parallelisable:** Frontend can begin after API contract is stable (mid-Week 2)
- **Dependencies:** File storage migration depends on base schema being finalised
