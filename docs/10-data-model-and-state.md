# Data Model & State Machine

**Project:** TaskHub  
**Date:** 2026-02-19  

---

## Entity Relationships

```
┌──────────┐       ┌──────────────┐       ┌───────────────┐
│   User   │──1:N──│  Membership  │──N:1──│ Organisation  │
│          │       │              │       │               │
│ Id       │       │ UserId (FK)  │       │ Id            │
│ Email    │       │ OrgId  (FK)  │       │ Name          │
│ PassHash │       │ Role         │       │ CreatedAt     │
│ CreatedAt│       │ JoinedAt     │       └───────────────┘
└──────────┘       └──────────────┘               │
      │                                           │ 1:N
      │ 1:N                                       ▼
      │                                   ┌───────────────┐
      │                                   │   TodoItem    │
      │                                   │               │
      └───────────────────────────────────│ CreatedByUser │
                                          │ OrgId (FK)    │
                                          │ Title         │
                                          │ Description   │
                                          │ Status        │
                                          │ Priority      │
                                          │ Tags[]        │
                                          │ DueDate       │
                                          │ Version       │
                                          │ IsDeleted     │
                                          │ IsArchived    │
                                          │ Timestamps    │
                                          └───────────────┘
                                                  │
                                                  │ Referenced by
                                                  ▼
                                          ┌───────────────┐
                                          │  AuditEntry   │
                                          │               │
                                          │ Id            │
                                          │ OrgId (FK)    │
                                          │ ActorUserId   │
                                          │ Action        │
                                          │ EntityType    │
                                          │ EntityId      │
                                          │ CorrelationId │
                                          │ Timestamp     │
                                          └───────────────┘
```

### Relationship Summary

| Relationship | Type | Constraint |
|---|---|---|
| User → Membership | 1:N | A user can belong to multiple orgs |
| Organisation → Membership | 1:N | An org has multiple members |
| Organisation → TodoItem | 1:N | All todos scoped to one org |
| User → TodoItem | 1:N | `CreatedByUserId` tracks ownership |
| Organisation → AuditEntry | 1:N | All audit events scoped to one org |

---

## Invariants

### Organisation Scoping
- Every `TodoItem.OrgId` must reference a valid Organisation
- Every API operation validates that the authenticated user is a member of the target org
- A user cannot read, create, update, or delete todos in an org they don't belong to

### Role Checks (RBAC)
- **Member:** Can create/update/toggle/soft-delete own todos; can restore any soft-deleted todo in their org
- **OrgAdmin:** All Member permissions + manage members (add/remove/change role) + hard delete todos + view audit logs
- Role is a property of **Membership**, not User (a user can be Admin in one org and Member in another)

### Soft Delete Rules
- Soft-deleted todos have `IsDeleted=true`, `DeletedAt` set
- Soft-deleted items are excluded from default list queries
- Only **OrgAdmin** can hard-delete (permanently remove) a todo
- Restoring a todo clears both `IsDeleted` and `IsArchived` flags

### Archive Rules
- Archived todos have `IsArchived=true`, `ArchivedAt` set
- Archived items are excluded from default list queries (visible with `includeArchived=true`)
- Archive is triggered by background job (Done todos older than N days)
- Archived items can be restored by any org member

### Validation Invariants
- `Title`: 1–200 characters, required, trimmed
- `Description`: 0–2000 characters, optional
- `Tags`: 0–10 items, each tag 1–50 characters, alphanumeric + hyphens
- `Priority`: Must be one of `Low`, `Medium`, `High`
- `DueDate`: Optional, must be a valid date if provided

---

## Todo Lifecycle — State Machine

```
                    ┌──────────┐
     Create ───────▶│   Open   │
                    └────┬─────┘
                         │
                    Toggle│
                         │
                    ┌────▼─────┐
                    │   Done   │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         Toggle│    Auto-Archive   Soft Delete
              │    (background     │
              │     job, N days)   │
              ▼          │          ▼
        ┌──────────┐     │   ┌───────────┐
        │   Open   │     │   │  Deleted   │
        │ (again)  │     │   │  (soft)    │
        └──────────┘     │   └─────┬─────┘
                         ▼         │
                   ┌──────────┐    │ Restore
                   │ Archived │    │
                   └────┬─────┘    │
                        │          │
                   Restore│         │
                        │          │
                        ▼          ▼
                   ┌──────────┐  ┌──────────┐
                   │   Open   │  │   Open   │
                   │(restored)│  │(restored)│
                   └──────────┘  └──────────┘

                                Hard Delete
                               (OrgAdmin only)
                                     │
                                     ▼
                               ┌──────────┐
                               │ REMOVED  │
                               │(permanent)│
                               └──────────┘
```

### Transitions

| From | To | Trigger | Who |
|------|----|---------|-----|
| — | Open | Create | Member+ |
| Open | Done | Toggle | Owner |
| Done | Open | Toggle | Owner |
| Done | Archived | Background job (N days) | System |
| Open/Done | Deleted (soft) | Soft delete | Owner |
| Deleted | Open | Restore | Member+ |
| Archived | Open | Restore | Member+ |
| Any | REMOVED | Hard delete | OrgAdmin only |

---

## Concurrency Design

### Approach: Optimistic Locking with Version Field

Every `TodoItem` has a `Version` integer (starts at 1). On every state change, the version is incremented.

### HTTP Flow

1. Client fetches todo — response includes `ETag: "{version}"` header
2. Client sends update with `If-Match: "{version}"` header and `version` in request body
3. Server compares submitted version with stored version
4. **Match:** update proceeds, version incremented, new ETag returned
5. **Mismatch:** return `412 Precondition Failed` with Problem Details

### Example

```
GET /api/v1/todos/abc → 200, ETag: "3"

PUT /api/v1/todos/abc
If-Match: "3"
{ "title": "Updated", "version": 3 }

→ 200, ETag: "4"   (success)
→ 412              (if version is now 5 — someone else edited)
```

### Conflict Resolution Strategy
- Client receives 412 → shows error notification
- Client invalidates its cache (`queryClient.invalidateQueries`)
- User sees fresh data and can re-apply their edit
- No automatic merge — we chose simplicity over complexity
