# C4 Architecture Diagrams: TaskHub

**Date:** February 19, 2026  

---

## C4 Level 1: Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      TaskHub System                         │
│  Multi-tenant todo platform with RBAC and audit logging    │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌─────────┐     ┌──────────┐    ┌──────────┐
    │  Team   │     │Individual│    │Compliance│
    │  Lead   │     │   User   │    │ Officer  │
    │ (Sarah) │     │ (Marcus) │    │  (Priya) │
    └─────────┘     └──────────┘    └──────────┘
    
    Sarah:   Manages team, views audit logs, exports data
    Marcus:  Creates/updates todos, uses filters
    Priya:   Reviews audit trails, compliance reporting
```

**External Dependencies:**
- Browser (Chrome/Firefox/Safari)
- File System (for File storage mode)

**Key Interactions:**
1. Users → TaskHub: HTTP/HTTPS requests (REST API)
2. TaskHub → File System: Read/write JSON files
3. TaskHub → Browser: API responses (JSON)

---

## C4 Level 2: Container Diagram

```
┌────────────────────────────── TaskHub System ───────────────────────────────┐
│                                                                              │
│  ┌──────────────┐                                        ┌──────────────┐  │
│  │   React      │─────── HTTPS/JSON ──────────────────▶ │   ASP.NET    │  │
│  │   Frontend   │◀────── (CORS enabled) ─────────────── │   Core API   │  │
│  │              │                                        │              │  │
│  │ - Dashboard  │                                        │ - Controllers│  │
│  │ - Auth UI    │                                        │ - Middleware │  │
│  │ - Todo CRUD  │                                        │ - DI Config  │  │
│  └──────────────┘                                        └──────┬───────┘  │
│   [TypeScript]                                                  │          │
│                                                                 │          │
│                                                        ┌────────▼───────┐  │
│                                                        │  Application   │  │
│                                                        │     Layer      │  │
│                                                        │                │  │
│                                                        │ - Use Cases    │  │
│                                                        │ - Handlers     │  │
│                                                        │ - Validators   │  │
│                                                        └────────┬───────┘  │
│                                                                 │          │
│                                                        ┌────────▼───────┐  │
│                                                        │  Domain Layer  │  │
│                                                        │                │  │
│                                                        │ - Entities     │  │
│                                                        │ - Value Objects│  │
│                                                        │ - Business     │  │
│                                                        │   Rules        │  │
│                                                        └────────┬───────┘  │
│                                                                 │          │
│                                                  ┌──────────────▼─────────┐│
│                                                  │ Infrastructure Layer   ││
│                                                  │                        ││
│                                                  │ ┌──────────────────┐   ││
│                                                  │ │ InMemory Storage │   ││
│                                                  │ │ (Development)    │   ││
│                                                  │ └──────────────────┘   ││
│                                                  │                        ││
│                                                  │ ┌──────────────────┐   ││
│                                                  │ │  File Storage    │───┼┼─▶ JSON Files
│                                                  │ │  (Production)    │   ││   /var/data
│                                                  │ └──────────────────┘   ││
│                                                  │                        ││
│                                                  │ ┌──────────────────┐   ││
│                                                  │ │ Background Jobs  │   ││
│                                                  │ │ (Archive Task)   │   ││
│                                                  │ └──────────────────┘   ││
│                                                  └────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

**Container Descriptions:**

| Container | Technology | Responsibility |
|-----------|------------|----------------|
| React Frontend | TypeScript + React 18 | User interface, client-side validation |
| ASP.NET Core API | C# + .NET 10 | HTTP endpoints, middleware, auth |
| Application Layer | C# | Use case orchestration, business workflows |
| Domain Layer | C# | Business entities, rules, value objects |
| Infrastructure | C# | Data persistence, external services |
| File Storage | JSON files | Persistent data storage |
| Background Jobs | Hosted Service | Automated archiving |

**Data Flow:**
1. User action in Frontend → HTTP request to API
2. API validates session → Calls Application handler
3. Handler orchestrates Domain entities → Calls Repository
4. Repository stores/retrieves from File Storage
5. Response flows back: Storage → Infrastructure → Application → API → Frontend

---

## C4 Level 3: Component Diagram (Application Layer)

```
┌───────────────────────── Application Layer ────────────────────────────┐
│                                                                         │
│  ┌────────────────┐         ┌──────────────┐       ┌────────────────┐ │
│  │   Auth         │         │    Todos     │       │ Organisations  │ │
│  │  Use Cases     │         │  Use Cases   │       │   Use Cases    │ │
│  │                │         │              │       │                │ │
│  │ - Register     │         │ - Create     │       │ - CreateOrg    │ │
│  │ - Login        │         │ - Update     │       │ - AddMember    │ │
│  │ - Logout       │         │ - Delete     │       │ - RemoveMember │ │
│  └───────┬────────┘         │ - List       │       │ - ChangeRole   │ │
│          │                  │ - Archive    │       └────────┬───────┘ │
│          │                  └──────┬───────┘                │         │
│          │                         │                        │         │
│  ┌───────▼─────────────────────────▼────────────────────────▼───────┐ │
│  │                Repository Interfaces (Ports)                     │ │
│  │                                                                  │ │
│  │  IUserRepository │ IOrganisationRepository │ ITodoRepository    │ │
│  │  IMembershipRepository │ IAuditRepository                       │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │               Service Interfaces (Ports)                         │ │
│  │                                                                  │ │
│  │  IPasswordHasher │ ICurrentUserContext │ IDateTimeProvider      │ │
│  │  ICorrelationContext │ IAuditLogger                             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   Common Models                                  │ │
│  │                                                                  │ │
│  │  Result<T> │ PagedResult<T> │ ImportReport │ Unit               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Component Descriptions:**

**Use Case Handlers:**
- Each handler has: Command/Query, Validator, Response
- Follow single responsibility principle
- Orchestrate domain entities + repositories
- Example: `CreateTodoHandler` uses `TodoItem.Create()` + `ITodoRepository.AddAsync()`

**Repository Interfaces (Ports):**
- Define data access contracts
- Technology-agnostic
- Implemented by Infrastructure layer

**Service Interfaces (Ports):**
- Abstract external concerns (time, hashing, auth context)
- Enable testing with fakes

**Common Models:**
- Shared DTOs and response wrappers
- Cross-cutting types used by all handlers

---

## Key Architectural Patterns

1. **Clean Architecture**: Dependency rule (outer layers depend on inner, never reverse)
2. **Hexagonal/Ports & Adapters**: Interfaces in Application, implementations in Infrastructure
3. **CQRS-lite**: Separate Command and Query objects
4. **Repository Pattern**: Data access abstraction
5. **Use Case Pattern**: Each business operation = dedicated handler
6. **Value Object Pattern**: Email, Tag enforce their own validation

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, TypeScript, TanStack Query, Tailwind CSS |
| API | ASP.NET Core 10, Swashbuckle, Serilog |
| Application | C# 13 |
| Domain | C# 13 (pure, no dependencies) |
| Infrastructure | BCrypt.Net, System.Text.Json |
| Storage | JSON files with atomic writes |
| Testing | xUnit, FluentAssertions, NSubstitute |

---

## Deployment View

```
┌─────────────────────────────────┐
│     Single Server (MVP)         │
│                                 │
│  ┌───────────────────────────┐ │
│  │  Kestrel (HTTP Server)    │ │
│  │  Port 5078 (dev)          │ │
│  │  Port 443 (prod HTTPS)    │ │
│  └────────────┬──────────────┘ │
│               │                 │
│  ┌────────────▼──────────────┐ │
│  │  ASP.NET Core App         │ │
│  │  + Background Job Host    │ │
│  └────────────┬──────────────┘ │
│               │                 │
│  ┌────────────▼──────────────┐ │
│  │  File System              │ │
│  │  /var/data/taskhub/*.json │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

**Notes:**
- No load balancer (single instance)
- No database server (file storage)
- Static frontend served by nginx (separate from API)
- Logs written to stdout (captured by systemd/docker)
