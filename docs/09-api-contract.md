# API Contract Document

**Project:** TaskHub  
**Base URL:** `/api/v1`  
**Date:** 2026-02-19  

---

## Auth Model & Session Lifecycle

### Authentication
- **Method:** Session-based with cookies
- **Cookie name:** `.TaskHub.Session`
- **Cookie attributes:** `HttpOnly`, `Secure` (production), `SameSite=Strict`, `Path=/`
- **Session lifetime:** Configurable idle timeout (default: 30 minutes)
- **CSRF protection:** SameSite=Strict cookie attribute

### Session Lifecycle
1. User calls `POST /auth/register` or `POST /auth/login`
2. Server creates session record, sets session cookie
3. All subsequent requests include cookie automatically
4. `POST /auth/logout` destroys the session
5. Expired sessions return `401 Unauthorized`

---

## Pagination, Filtering & Sorting Conventions

### Pagination
- **Style:** Offset-based
- **Parameters:** `page` (1-indexed, default: 1), `pageSize` (default: 20, max: 100)
- **Response envelope:**
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 20,
  "totalCount": 142,
  "totalPages": 8
}
```

### Filtering
- Query parameters: `status=Open`, `priority=High`, `tag=work`, `overdue=true`, `includeArchived=true`, `includeDeleted=true`
- Multiple values: `status=Open&status=Done`

### Sorting
- Parameter: `sortBy=createdAt`, `sortDir=desc`
- Allowed sort fields: `createdAt`, `dueDate`, `priority`, `title`, `updatedAt`

---

## Endpoints

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login, create session | ❌ |
| `POST` | `/auth/logout` | Destroy session | ✅ |

### Organisations

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| `POST` | `/organisations` | Create new org | ✅ | Any |
| `GET` | `/organisations` | List user's orgs | ✅ | Any |
| `POST` | `/organisations/{orgId}/members` | Add member | ✅ | OrgAdmin |
| `GET` | `/organisations/{orgId}/members` | List members | ✅ | Any |
| `PUT` | `/organisations/{orgId}/members/{userId}/role` | Change role | ✅ | OrgAdmin |
| `DELETE` | `/organisations/{orgId}/members/{userId}` | Remove member | ✅ | OrgAdmin |
| `PUT` | `/organisations/active` | Set active org | ✅ | Any |

### Todos

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| `POST` | `/todos` | Create todo | ✅ | Member+ |
| `GET` | `/todos` | List todos (paginated) | ✅ | Member+ |
| `GET` | `/todos/{id}` | Get single todo | ✅ | Member+ |
| `PUT` | `/todos/{id}` | Update todo | ✅ | Owner |
| `PUT` | `/todos/{id}/toggle` | Toggle status | ✅ | Owner |
| `DELETE` | `/todos/{id}/soft` | Soft delete | ✅ | Owner |
| `PUT` | `/todos/{id}/restore` | Restore soft-deleted | ✅ | Member+ |
| `DELETE` | `/todos/{id}` | Hard delete | ✅ | OrgAdmin |

### Audit

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| `GET` | `/audit` | List audit entries | ✅ | OrgAdmin |

### Import/Export

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| `GET` | `/export` | Export org todos (JSON) | ✅ | Member+ |
| `POST` | `/import` | Import todos (JSON) | ✅ | Member+ |

### Health

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/health/live` | Liveness check | ❌ |
| `GET` | `/health/ready` | Readiness check | ❌ |

---

## Request/Response Schemas

### Register

**Request:**
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Response (201):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

### Login

**Request:**
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Response (200):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "onboardingCompleted": true
}
```
*Session cookie set in `Set-Cookie` header.*

### Create Todo

**Request:**
```json
POST /api/v1/todos
{
  "orgId": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Review PR #42",
  "description": "Check the auth middleware changes",
  "priority": "High",
  "tags": ["dev", "review"],
  "dueDate": "2026-02-25"
}
```

**Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "orgId": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Review PR #42",
  "description": "Check the auth middleware changes",
  "status": "Open",
  "priority": "High",
  "tags": ["dev", "review"],
  "dueDate": "2026-02-25",
  "version": 1,
  "createdAt": "2026-02-19T10:30:00Z",
  "updatedAt": "2026-02-19T10:30:00Z"
}
```
*`ETag: "1"` header included.*

### Update Todo

**Request:**
```json
PUT /api/v1/todos/770e8400-...
If-Match: "1"
{
  "title": "Review PR #42 — URGENT",
  "priority": "High",
  "version": 1
}
```

**Response (200):** Updated todo with `version: 2`, `ETag: "2"`  
**Response (412):**
```json
{
  "type": "https://httpstatuses.com/412",
  "title": "Precondition Failed",
  "status": 412,
  "detail": "The resource has been modified. Current version: 3, your version: 1.",
  "correlationId": "abc-123-def"
}
```

### Import (with rejection report)

**Request:**
```json
POST /api/v1/import
{
  "todos": [
    { "title": "Valid task", "priority": "High" },
    { "title": "", "priority": "Invalid" },
    { "title": "Another valid", "priority": "Low" }
  ]
}
```

**Response (200):**
```json
{
  "accepted": 2,
  "rejected": 1,
  "rejections": [
    {
      "index": 1,
      "reasons": [
        "Title is required and cannot be empty",
        "Priority must be one of: Low, Medium, High"
      ]
    }
  ]
}
```

### Error Format (Problem Details)

All errors follow RFC 7807:
```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "correlationId": "abc-123-def",
  "errors": [
    { "field": "title", "message": "Title must be between 1 and 200 characters" },
    { "field": "tags", "message": "Maximum 10 tags allowed" }
  ]
}
```
