# User Personas: TaskHub

**Date:** February 19, 2026  
**Total Personas:** 3  

---

## Persona 1: Sarah Chen - Team Lead

**Demographics:**
- Age: 32
- Role: Engineering Team Lead
- Tech Savvy: High
- Location: San Francisco, CA

**Goals:**
- Track team sprint tasks efficiently
- Monitor team progress and blockers
- Ensure accountability through audit trails
- Export reports for stakeholders

**Pain Points:**
- Current tools lack proper RBAC
- Can't see who changed what and when
- Data export is cumbersome
- Lost updates when team edits concurrently

**How TaskHub Helps:**
- OrgAdmin role gives her full control
- Audit log shows all team activity
- One-click export to JSON/CSV
- Version conflicts prevented automatically

**User Stories:** US-005, US-006, US-007, US-008, US-025, US-026

---

## Persona 2: Marcus Johnson - Individual Contributor

**Demographics:**
- Age: 28
- Role: Software Engineer
- Tech Savvy: High
- Location: Remote (Austin, TX)

**Goals:**
- Manage personal and work tasks in one place
- Quick task creation and updates
- Filter by priority and due dates
- Restore accidentally deleted items

**Pain Points:**
- Needs simple, fast interface
- Doesn't want admin overhead
- Occasionally deletes wrong item
- Wants to work offline sometimes

**How TaskHub Helps:**
- Clean API for personal dashboard
- Soft delete allows recovery
- Filters and sorting built-in
- Can export for offline access

**User Stories:** US-010, US-011, US-012, US-013, US-014, US-016, US-017

---

## Persona 3: Priya Sharma - Compliance Officer

**Demographics:**
- Age: 45
- Role: Compliance & Security Lead
- Tech Savvy: Medium
- Location: London, UK

**Goals:**
- Ensure audit trail for regulatory compliance
- Verify proper access controls
- Review security incidents
- Generate compliance reports

**Pain Points:**
- Many tools don't log user actions
- Can't prove who did what when
- Audit logs are often tamperable
- Export capabilities missing

**How TaskHub Helps:**
- Comprehensive immutable audit log
- RBAC with clear permission boundaries
- OrgAdmin-only audit log access
- Export audit trails for regulators

**User Stories:** US-025, US-026, US-032, US-033

---

## Anti-Persona: Casual Consumer User

**Why NOT our target:**
- TaskHub is designed for teams and compliance-focused orgs
- Too much overhead (audit logs, RBAC) for personal use
- Better alternatives exist (Todoist, Any.do)
- File storage not ideal for mobile-first users

**Recommendation:** Use a consumer-focused todo app instead


---

# Requirements Specification: TaskHub

**Document Version:** 1.0  
**Date:** February 19, 2026  
**Status:** Approved  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for TaskHub, a multi-tenant todo management platform designed to demonstrate enterprise software development practices.

### 1.2 Scope
TaskHub enables organizations to manage tasks with role-based access control, comprehensive audit trails, and data portability through import/export functionality.

### 1.3 Intended Audience
- Development Team
- QA Engineers
- Security Reviewers
- Take-Home Exercise Assessors

---

## 2. Functional Requirements

### 2.1 User Management

#### FR-001: User Registration
**Priority:** Must Have  
**Description:** System shall allow new users to register with username and password.

**Requirements:**
- Username must be unique (case-insensitive)
- Username length: 3-50 characters
- Password length: 8-100 characters
- Password must be hashed using bcrypt with work factor ≥12
- System returns 422 Unprocessable Entity for validation failures
- System returns 201 Created with user ID on success

**Acceptance Test:**
```
GIVEN I am a new user
WHEN I register with username "john_doe" and password "SecurePass123!"
THEN my account is created
AND password is stored as bcrypt hash
AND I receive user ID in response
```

---

#### FR-002: User Login
**Priority:** Must Have  
**Description:** System shall authenticate users and create sessions.

**Requirements:**
- Accept username and password
- Return same error for non-existent username and wrong password
- Create session on successful authentication
- Implement brute force protection:
  - Lock account after 5 failed login attempts
  - Lockout duration: 15 minutes
  - Auto-unlock after lockout expires
- Log all login attempts (success and failure) to audit trail
- Return correlation ID in response headers

**Acceptance Test:**
```
GIVEN I am a registered user
WHEN I log in with correct credentials
THEN a session is created
AND session token is returned
AND login success is logged to audit trail

GIVEN I enter wrong password 5 times
WHEN I try to log in again
THEN account is locked
AND error message indicates lockout duration
```

---

#### FR-003: User Logout
**Priority:** Must Have  
**Description:** System shall terminate user sessions.

**Requirements:**
- Delete session from storage
- Clear session cookie
- Log logout action to audit trail
- Return 204 No Content

---

### 2.2 Organisation Management

#### FR-004: Create Organisation
**Priority:** Must Have  
**Description:** Logged-in users can create organisations to manage todos collaboratively.

**Requirements:**
- Organisation name: 2-100 characters
- Creator automatically becomes OrgAdmin
- System creates membership record linking user to organisation
- Audit log records organisation creation
- Return organisation ID

**Acceptance Test:**
```
GIVEN I am logged in
WHEN I create organisation "Engineering Team"
THEN organisation is created with me as OrgAdmin
AND membership record exists
AND audit log contains creation event
```

---

#### FR-005: Add Member to Organisation
**Priority:** Must Have  
**Description:** OrgAdmins can add users to their organisations.

**Requirements:**
- Only OrgAdmins can add members
- User being added must exist in system
- Cannot add user who is already a member
- Can specify role: Member or OrgAdmin
- Audit log records member addition with details

**Acceptance Test:**
```
GIVEN I am an OrgAdmin
WHEN I add user "jane_doe" as Member
THEN jane_doe has access to organisation's todos
AND audit log records the addition
AND I cannot add jane_doe again (409 Conflict)
```

---

#### FR-006: Remove Member from Organisation
**Priority:** Must Have  
**Description:** OrgAdmins can remove members from organisations.

**Requirements:**
- Only OrgAdmins can remove members
- Cannot remove the last OrgAdmin (must maintain at least one)
- Member loses access to organisation's todos immediately
- Audit log records removal

**Business Rule:**  
Last OrgAdmin cannot be removed to prevent orphaned organisations.

---

#### FR-007: Change Member Role
**Priority:** Must Have  
**Description:** OrgAdmins can promote/demote members.

**Requirements:**
- Only OrgAdmins can change roles
- Cannot demote the last OrgAdmin
- Audit log records role change with before/after values
- Return 422 if trying to set role to current role (no-op)

---

### 2.3 Todo Management

#### FR-008: Create Todo
**Priority:** Must Have  
**Description:** Organisation members can create todos.

**Requirements:**
- Title: 1-200 characters (required)
- Description: optional, max 2000 characters
- Priority: Low/Medium/High (default: Medium)
- Status: automatically set to Open
- Tags: max 10, each 1-50 chars, alphanumeric + hyphens only
- Due date: optional ISO 8601 datetime
- Version starts at 1
- Return todo ID, version, and ETag header
- Audit log records creation

**Validation Rules:**
- Title cannot be empty or whitespace-only
- Tags must match regex: `^[a-zA-Z0-9\-]+$`
- Due date must be valid datetime if provided

---

#### FR-009: Update Todo
**Priority:** Must Have  
**Description:** Members can update todos with optimistic concurrency control.

**Requirements:**
- Can update: title, description, priority, tags, due date
- Must provide current version (via If-Match header or version field)
- Return 412 Precondition Failed if version mismatch
- Version increments on successful update
- Return new version and ETag header
- Cannot update deleted or archived todos
- Audit log records update

**Concurrency Scenario:**
```
User A loads todo (version 5)
User B loads todo (version 5)
User A updates → version becomes 6 ✓
User B tries to update with version 5 → 412 Conflict ✗
```

---

#### FR-010: Toggle Todo Status
**Priority:** Must Have  
**Description:** Members can mark todos as done or reopen them.

**Requirements:**
- Toggles between Open ↔ Done
- Cannot toggle archived or deleted todos
- Requires current version
- Version increments
- Audit log records status change

---

#### FR-011: Soft Delete Todo
**Priority:** Must Have  
**Description:** Members can delete todos (soft delete for recovery).

**Requirements:**
- Sets `IsDeleted = true`, `DeletedAt = timestamp`
- Todo remains in storage
- Excluded from default list results
- Can be restored later
- Requires current version
- Audit log records soft deletion

---

#### FR-012: Restore Deleted Todo
**Priority:** Should Have  
**Description:** Members can recover soft-deleted todos.

**Requirements:**
- Sets `IsDeleted = false`, clears `DeletedAt`
- Todo appears in default lists again
- Requires current version
- Audit log records restoration

---

#### FR-013: Hard Delete Todo
**Priority:** Should Have  
**Description:** OrgAdmins can permanently delete todos.

**Requirements:**
- **Only OrgAdmins** have this permission
- Todo removed from storage entirely (unrecoverable)
- No version check (admin override)
- Audit log records hard deletion
- Return 403 if non-admin attempts

**Security Note:**  
This is a destructive action requiring elevated privileges.

---

#### FR-014: List Todos with Pagination
**Priority:** Must Have  
**Description:** Members can browse todos with pagination.

**Requirements:**
- Query parameters:
  - `page`: integer ≥1 (default: 1)
  - `pageSize`: integer 1-100 (default: 20)
  - `orgId`: GUID (required)
- Return:
  - `items`: array of todos
  - `totalCount`: total matching items
  - `page`, `pageSize`: echoed back
  - `totalPages`: calculated
  - `hasNextPage`, `hasPreviousPage`: boolean flags
- Default behavior: exclude deleted, exclude archived
- Return 422 if page < 1 or pageSize out of bounds

---

#### FR-015: Filter Todos
**Priority:** Should Have  
**Description:** Members can filter todos by status, priority, tag, or overdue state.

**Requirements:**
- Filter by `status`: Open, Done, or Archived
- Filter by `priority`: Low, Medium, or High
- Filter by `tag`: exact match (case-insensitive)
- Filter by `isOverdue`: boolean (true = due date < now AND status = Open)
- Filters are combinable (AND logic)
- Return empty list if no matches

**Example Query:**
```
GET /api/v1/todos?orgId=abc&status=Open&priority=High&isOverdue=true
```

---

#### FR-016: Sort Todos
**Priority:** Should Have  
**Description:** Members can sort todos by various fields.

**Requirements:**
- Sort by: `createdAt`, `updatedAt`, `dueDate`, `priority`
- Sort direction: `ascending` or `descending` (default: descending)
- Default sort: `createdAt` descending (newest first)
- Null due dates:
  - Ascending: sorted last
  - Descending: sorted first

---

#### FR-017: Archive Completed Todos
**Priority:** Should Have  
**Description:** OrgAdmins can archive old completed todos.

**Requirements:**
- **Only OrgAdmins** can trigger manual archive
- Archives todos where:
  - Status = Done
  - UpdatedAt < (now - N days)
- Days threshold configurable (default: 90)
- Return count of archived todos
- Archived todos:
  - `IsArchived = true`
  - `ArchivedAt = timestamp`
  - `Status = Archived`
  - Excluded from default lists unless `includeArchived=true`
- Audit log records archive action

---

### 2.4 Import/Export

#### FR-018: Export Todos
**Priority:** Should Have  
**Description:** Members can export organisation's todos to JSON or CSV.

**Requirements:**
- Supported formats: JSON, CSV
- Include all non-deleted todos (including archived)
- JSON structure: array of todo objects
- CSV format: headers with proper escaping
- File download with timestamped filename
- Audit log records export with format and count

**CSV Columns:**  
Id, Title, Description, Status, Priority, Tags, DueDate, IsArchived

**Tags Handling:**  
Semicolon-separated in single column

---

#### FR-019: Import Todos
**Priority:** Should Have  
**Description:** Members can import todos from JSON or CSV files.

**Requirements:**
- Supported formats: JSON, CSV
- Validate each row:
  - Title required and within length limits
  - Priority is valid enum value
  - Tags match validation rules
  - Due date is valid datetime if provided
- Return import report:
  - `acceptedCount`: number of successfully imported todos
  - `rejectedCount`: number of failed rows
  - `rejectedRows`: array of `{ rowIndex, errors[] }`
- Accepted todos created with current user as creator
- Audit log records import with counts

**Validation Example:**
```json
{
  "acceptedCount": 47,
  "rejectedCount": 3,
  "rejectedRows": [
    {
      "rowIndex": 12,
      "errors": ["Title is required"]
    },
    {
      "rowIndex": 25,
      "errors": ["Invalid priority: 'Urgent'", "Tag 'high priority' contains invalid characters"]
    }
  ]
}
```

---

### 2.5 Audit & Compliance

#### FR-020: Record Audit Events
**Priority:** Must Have  
**Description:** System logs all significant actions for compliance.

**Requirements:**
- Log these actions:
  - Auth: Login (success/failure), Logout
  - Todos: Create, Update, Delete, Restore, Archive
  - Orgs: Create, Add Member, Remove Member, Change Role
  - Import/Export: Todos exported, Todos imported
- Each entry contains:
  - `Timestamp`: UTC datetime
  - `ActorUserId`: who performed the action
  - `OrgId`: which organisation (if applicable)
  - `Action`: enum value (e.g., TodoCreated)
  - `EntityType`: enum value (e.g., Todo)
  - `EntityId`: affected entity's ID
  - `CorrelationId`: request correlation ID
  - `AdditionalInfo`: optional extra context
- Audit entries are immutable (no update or delete)

**Business Rule:**  
Audit log provides non-repudiation for compliance.

---

#### FR-021: View Audit Log
**Priority:** Must Have  
**Description:** OrgAdmins can review audit logs for their organisation.

**Requirements:**
- **Only OrgAdmins** can view audit logs
- Return 403 if non-admin attempts access
- Support pagination (default: 50 per page)
- Sort by timestamp descending (newest first)
- Filter by organisation ID
- Cannot filter by user (returns all users in org)

**Privacy Note:**  
Members cannot view audit logs to prevent surveillance concerns.

---

## 3. Non-Functional Requirements

### 3.1 Security

#### NFR-001: Authentication Security
**Priority:** Must Have

**Requirements:**
- Passwords hashed with bcrypt, work factor ≥12
- Session tokens cryptographically secure (GUID)
- Brute force protection (lockout after 5 failures)
- HTTPS enforced in production
- Session timeout: 24 hours maximum
- No passwords in logs, error messages, or responses

**Compliance:** OWASP ASVS v5.x

---

#### NFR-002: Authorization
**Priority:** Must Have

**Requirements:**
- RBAC with two roles: Member, OrgAdmin
- Organisation-level data isolation (multi-tenancy)
- Members can:
  - View/create/update/delete todos in their orgs
  - View members in their orgs
- OrgAdmins can additionally:
  - Add/remove members
  - Change member roles
  - Hard delete todos
  - View audit logs
  - Manually trigger archive
- No cross-org data access
- Return 403 for unauthorized actions

---

#### NFR-003: Input Validation
**Priority:** Must Have

**Requirements:**
- Validate all inputs at application boundary
- Length limits enforced on all string fields
- Enum values validated against allowed set
- Regex validation for tags, emails
- Sanitize inputs to prevent injection attacks
- Return 422 with field-level errors for validation failures

---

### 3.2 Performance

#### NFR-004: Response Times
**Priority:** Should Have

**Requirements:**
- Health check: < 100ms (p99)
- Login: < 500ms (p99)
- List todos (20 items): < 1s (p99)
- Create/update todo: < 300ms (p99)
- All measurements under normal load (10 concurrent users)

---

#### NFR-005: Scalability
**Priority:** Could Have

**Requirements:**
- Support up to 50 concurrent users
- Handle organisations with up to 10,000 todos
- File storage performance degrades gracefully
- Document migration path to database when limits exceeded

---

### 3.3 Reliability

#### NFR-006: Availability
**Priority:** Should Have

**Requirements:**
- Uptime: 99% (excludes planned maintenance)
- Graceful degradation if file storage slow
- Health check always available (no auth required)

---

#### NFR-007: Data Integrity
**Priority:** Must Have

**Requirements:**
- Optimistic concurrency prevents lost updates
- Atomic file writes prevent corruption
- File locking prevents concurrent access issues
- Schema versioning enables safe migrations
- Audit log is append-only and immutable

---

### 3.4 Maintainability

#### NFR-008: Code Quality
**Priority:** Must Have

**Requirements:**
- Clean Architecture with clear layer boundaries
- Domain layer has zero dependencies on external frameworks
- 80%+ test coverage (unit + integration)
- All public APIs documented (XML comments)
- Consistent naming conventions
- SOLID principles applied

---

#### NFR-009: Documentation
**Priority:** Must Have

**Requirements:**
- Architecture diagrams (C4 Context, Container, Component)
- 10+ ADRs for key decisions
- API documentation (OpenAPI/Swagger)
- README with setup instructions
- Threat model (STRIDE)
- Test strategy document

---

### 3.5 Usability

#### NFR-010: API Design
**Priority:** Must Have

**Requirements:**
- RESTful conventions followed
- Consistent error response format (Problem Details RFC 9457)
- Correlation IDs in all responses
- ETags for concurrency control
- Meaningful HTTP status codes:
  - 200: Success (read)
  - 201: Created
  - 204: Success (no content)
  - 400: Bad request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 412: Precondition failed (version mismatch)
  - 422: Validation failed
  - 500: Server error

---

### 3.6 Portability

#### NFR-011: Storage Abstraction
**Priority:** Must Have

**Requirements:**
- Repository pattern abstracts storage
- Supports both InMemory and File storage
- Switchable via configuration (no code changes)
- InMemory for development/testing
- File for persistence

---

### 3.7 Testability

#### NFR-012: Testing Strategy
**Priority:** Must Have

**Requirements:**
- Unit tests for domain logic
- Integration tests for use case handlers
- E2E tests for critical user journeys
- All tests run in CI pipeline
- No external dependencies in tests (use fakes/mocks)

---

## 4. Constraints

### 4.1 Technical Constraints
- **Language:** C# (.NET 10)
- **Frontend:** React + TypeScript
- **Storage:** InMemory or File only (no traditional database)
- **Auth:** Session-based (no JWT required, but not forbidden)
- **Hosting:** Single-server deployment (no clustering)

### 4.2 Timeline Constraints
- **Duration:** 1 week maximum
- **Effort:** ~50 hours total

### 4.3 Compliance Constraints
- **OWASP ASVS v5.x:** Security requirements alignment
- **OWASP Top 10 2025:** Threat awareness
- **RFC 9110:** HTTP semantics (ETags)
- **RFC 9457:** Problem Details format

---

## 5. Assumptions

1. Users have basic understanding of todo apps
2. File system is reliable (RAID, backups managed externally)
3. Single geographic location (no distributed storage)
4. English language only
5. Modern browser for frontend (ES6+ support)

---

## 6. Dependencies

### 6.1 External Dependencies
- .NET 10 SDK
- Node.js 24
- BCrypt.Net (password hashing)
- Serilog (structured logging)
- Swashbuckle (OpenAPI documentation)

### 6.2 Data Dependencies
- None (system is greenfield)

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| All user stories completed | 100% |
| Test coverage | ≥80% |
| Security vulnerabilities (critical) | 0 |
| API uptime (dev environment) | >99% |
| Documentation completeness | 100% (all required artifacts) |

---

## Document Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | Take-Home Reviewer | _[Pending]_ | 2026-02-19 |
| Lead Developer | Candidate | _[Approved]_ | 2026-02-19 |
| QA Lead | Assessor | _[Pending]_ | 2026-02-19 |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-19 | Development Team | Initial requirements specification |


---

# Failure Path Analysis: TaskHub

**Date:** February 19, 2026  
**Total Failure Paths:** 10  

---

## FP-001: Concurrent Update Conflict

**Scenario:** Two users update same todo simultaneously

**Flow:**
1. Alice loads todo (version 5)
2. Bob loads todo (version 5)
3. Alice updates title → version 6, saves successfully
4. Bob updates description → sends version 5
5. ❌ FAILURE: 412 Precondition Failed

**Expected Behavior:**
- Bob receives 412 status code
- Error message: "Todo was modified by another user. Please reload."
- Bob's changes are NOT saved
- Alice's changes preserved

**Recovery:**
- Bob reloads todo (gets version 6 with Alice's changes)
- Bob re-applies his description change
- Bob submits with version 6 → success

**Prevention:** Optimistic concurrency with ETag/version

---

## FP-002: Account Lockout After Brute Force

**Scenario:** Attacker tries to guess password

**Flow:**
1. Attacker attempts login with wrong password (1st attempt)
2. Attacker attempts login with wrong password (2nd-4th attempts)
3. Attacker attempts login with wrong password (5th attempt)
4. ❌ FAILURE: Account locked for 15 minutes
5. Legitimate user tries to log in
6. ❌ FAILURE: "Account locked due to failed attempts"

**Expected Behavior:**
- After 5 failed attempts, account locks
- Lockout duration: 15 minutes
- All login attempts (including by legit user) fail during lockout
- Audit log records all failed attempts
- After 15 minutes, account auto-unlocks

**Recovery:**
- Wait 15 minutes for automatic unlock
- Contact admin for manual unlock (not implemented in MVP)

**Prevention:** User education on strong passwords, 2FA (future)

---

## FP-003: File Corruption During Write

**Scenario:** Power failure during file write

**Flow:**
1. User updates todo
2. System starts writing to todos.json.tmp
3. ❌ FAILURE: Power outage mid-write
4. On restart, todos.json.tmp exists but incomplete
5. Original todos.json intact

**Expected Behavior:**
- Atomic write pattern: write to .tmp first
- Rename .tmp to .json only after complete write
- If crash occurs, .tmp is orphaned
- Next write deletes stale .tmp and starts fresh
- Original file never corrupted

**Recovery:** Automatic - no user action needed

**Prevention:** Atomic file writes, future: checksums + backups

---

## FP-004: Last OrgAdmin Removal Attempt

**Scenario:** Admin tries to remove themselves when they're the last admin

**Flow:**
1. Organisation has 1 OrgAdmin (Alice) and 2 Members
2. Alice attempts to remove herself
3. ❌ FAILURE: 400 Bad Request

**Expected Behavior:**
- System checks admin count before allowing removal
- Error: "Cannot remove the last administrator. Promote another member first."
- Alice remains OrgAdmin
- No membership record deleted

**Recovery:**
- Alice promotes Bob to OrgAdmin
- Now Alice can leave (2 admins exist)

**Prevention:** Business rule enforced in RemoveMemberHandler

---

## FP-005: Import with Invalid Data

**Scenario:** User imports CSV with malformed rows

**Flow:**
1. User uploads CSV with 50 rows
2. Row 12: Title is empty (validation failure)
3. Row 25: Priority = "Urgent" (invalid enum value)
4. Row 38: Tag contains spaces (invalid characters)
5. System validates all rows

**Expected Behavior:**
- 47 rows accepted and imported
- 3 rows rejected
- Response includes import report:
  ```json
  {
    "acceptedCount": 47,
    "rejectedCount": 3,
    "rejectedRows": [
      {"rowIndex": 12, "errors": ["Title is required"]},
      {"rowIndex": 25, "errors": ["Invalid priority: Urgent"]},
      {"rowIndex": 38, "errors": ["Tag 'high priority' contains invalid characters"]}
    ]
  }
  ```

**Recovery:**
- User fixes rejected rows in CSV
- Re-imports (only rejected rows)

**Prevention:** Clear validation messages, example CSV template

---

## FP-006: Session Expiry During Active Use

**Scenario:** User's session expires while working

**Flow:**
1. User logs in at 9:00 AM
2. Session timeout: 24 hours (expires at 9:00 AM next day)
3. User works all day
4. Next morning at 9:05 AM, user tries to create todo
5. ❌ FAILURE: 401 Unauthorized

**Expected Behavior:**
- Session middleware checks expiry on every request
- Returns 401 with error: "Session expired. Please log in again."
- Frontend redirects to login page
- User logs in again, returns to work

**Recovery:** Log in again

**Prevention:** Activity-based session renewal (future), clear expiry messaging

---

## FP-007: Accessing Another Organisation's Data

**Scenario:** User tries to access org they don't belong to

**Flow:**
1. Alice is member of Org A (ID: aaa)
2. Alice discovers Org B's ID (ID: bbb) in network traffic
3. Alice attempts GET /api/v1/todos?orgId=bbb
4. System checks membership
5. ❌ FAILURE: 403 Forbidden

**Expected Behavior:**
- Every endpoint verifies user's membership in target org
- Returns 403: "You do not have access to this organisation."
- No data from Org B leaked
- Audit log records unauthorized attempt

**Recovery:** None needed (security working as designed)

**Prevention:** Multi-tenancy enforcement in every handler

---

## FP-008: File Storage Directory Missing

**Scenario:** File storage directory deleted or unmounted

**Flow:**
1. System configured for File storage
2. Storage path: /var/data/taskhub
3. Admin accidentally deletes directory
4. User tries to create todo
5. System attempts to write to todos.json
6. ❌ FAILURE: DirectoryNotFoundException

**Expected Behavior:**
- Atomic file writer creates directory if missing
- Todo creation succeeds
- New files created with schema version 2

**Recovery:** Automatic (directory recreated)

**Data Loss:** All previous data lost (no backups in MVP)

**Prevention:** Document backup procedures, future: automated backups

---

## FP-009: Duplicate Username Registration

**Scenario:** Two users try to register same username simultaneously

**Flow:**
1. Alice submits registration for "john_doe"
2. Bob submits registration for "john_doe" (1ms later)
3. Both requests check username availability
4. Both find username available (race condition)
5. Alice's registration succeeds
6. Bob's registration attempts to insert
7. ❌ FAILURE: User repository detects duplicate

**Expected Behavior:**
- First request succeeds (Alice gets "john_doe")
- Second request fails with 422: "Username already taken"
- No duplicate usernames in storage

**Recovery:** Bob chooses different username

**Prevention:** Repository-level uniqueness check, future: database constraints

---

## FP-010: Archived Todo Modification Attempt

**Scenario:** User tries to update archived todo

**Flow:**
1. Todo is marked as archived (IsArchived = true)
2. User attempts to update todo's description
3. Handler loads todo
4. Domain entity `Update()` method checks IsArchived
5. ❌ FAILURE: BusinessRuleException thrown

**Expected Behavior:**
- Returns 400 Bad Request
- Error: "Cannot update an archived todo."
- Todo remains unchanged
- User must un-archive first, then update

**Recovery:**
- Un-archive todo (if OrgAdmin)
- Update todo
- Re-archive if needed

**Prevention:** Business rule in TodoItem entity

---

## Summary

| Failure Type | Count | Mitigation Strategy |
|--------------|-------|---------------------|
| Concurrency | 1 | Optimistic locking |
| Security | 2 | Authentication + RBAC |
| Data Integrity | 3 | Atomic writes + validation |
| Business Rules | 3 | Domain entity enforcement |
| Infrastructure | 1 | Auto-recovery |

All failure paths have defined recovery procedures and are handled gracefully with appropriate HTTP status codes and error messages.
