# Product Backlog: TaskHub

**Last Updated:** February 23, 2026  
**Total Stories:** 35  
**Story Points:** 160  

---

## Epic 1: User Authentication & Sessions

### US-001: User Registration
**As a** new user  
**I want to** register with username and password  
**So that** I can create an account

**Acceptance Criteria:**
- Username must be 3-50 characters
- Password must be 8-100 characters
- Password is hashed with bcrypt (work factor 12)
- Username is case-insensitive and unique
- Returns 422 on validation failure
- Returns 201 on success with user ID

**Priority:** P0 (Must Have)  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-002: User Login
**As a** registered user  
**I want to** log in with my credentials  
**So that** I can access my todos

**Acceptance Criteria:**
- Accepts username and password
- Returns same error for invalid username or wrong password (prevent enumeration)
- Creates session on successful login
- Returns session token/cookie
- Implements brute force protection (5 failed attempts → 15min lockout)
- Logs login success and failure to audit trail

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-003: User Logout
**As a** logged-in user  
**I want to** log out  
**So that** my session is terminated

**Acceptance Criteria:**
- Deletes session from storage
- Clears session cookie
- Logs logout action to audit trail
- Returns 204 No Content

**Priority:** P0  
**Story Points:** 2  
**Status:** ✅ Completed

---

### US-004: Session Management
**As a** system  
**I want to** manage user sessions  
**So that** authentication state persists across requests

**Acceptance Criteria:**
- Sessions stored with expiry (24 hours)
- Session ID is cryptographically secure (GUID)
- Middleware validates session on each request
- Populates ICurrentUserContext from session
- Returns 401 if session invalid or expired

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

## Epic 2: Organisation Management

### US-005: Create Organisation
**As a** logged-in user  
**I want to** create an organisation  
**So that** I can manage todos within a team

**Acceptance Criteria:**
- Name is 2-100 characters
- Creator becomes OrgAdmin automatically
- Membership record created linking user to org
- Organisation ID returned
- Audit log records org creation

**Priority:** P0  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-006: Add Member to Organisation
**As an** OrgAdmin  
**I want to** add a user to my organisation  
**So that** they can collaborate on todos

**Acceptance Criteria:**
- Only OrgAdmins can add members
- User must exist in the system
- Cannot add user who is already a member
- Can specify role (Member or OrgAdmin)
- Audit log records member addition

**Priority:** P0  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-007: Remove Member from Organisation
**As an** OrgAdmin  
**I want to** remove a member  
**So that** ex-team members lose access

**Acceptance Criteria:**
- Only OrgAdmins can remove members
- Cannot remove the last OrgAdmin
- Member's access to org todos is revoked
- Audit log records removal

**Priority:** P0  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-008: Change Member Role
**As an** OrgAdmin  
**I want to** promote/demote members  
**So that** I can adjust permissions

**Acceptance Criteria:**
- Only OrgAdmins can change roles
- Cannot demote the last OrgAdmin
- Audit log records role change with before/after values

**Priority:** P1  
**Story Points:** 2  
**Status:** ✅ Completed

---

### US-009: List User's Organisations
**As a** logged-in user  
**I want to** see all organisations I belong to  
**So that** I can choose which one to work in

**Acceptance Criteria:**
- Returns all orgs where user has a membership
- Includes role for each org
- Sorted by creation date (newest first)

**Priority:** P1  
**Story Points:** 2  
**Status:** ✅ Completed

---

## Epic 3: Todo Management

### US-010: Create Todo
**As an** organisation member  
**I want to** create a todo  
**So that** I can track tasks

**Acceptance Criteria:**
- Title is 1-200 characters (required)
- Description is optional, max 2000 characters
- Priority: Low/Medium/High (default: Medium)
- Status: Open (default)
- Tags: max 10, each 1-50 characters, alphanumeric + hyphens
- Due date is optional
- Returns todo ID, version 1, and ETag header
- Audit log records creation

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-011: Update Todo
**As an** organisation member  
**I want to** update a todo  
**So that** I can modify details

**Acceptance Criteria:**
- Can update title, description, priority, tags, due date
- Must send current version (If-Match header or version field)
- Returns 412 if version mismatch (optimistic concurrency)
- Version increments on success
- Returns new ETag header
- Audit log records update

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-012: Toggle Todo Status
**As an** organisation member  
**I want to** mark a todo as done/open  
**So that** I can track completion

**Acceptance Criteria:**
- Toggles between Open ↔ Done
- Requires current version
- Returns 412 on version mismatch
- Version increments
- Audit log records status change

**Priority:** P0  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-013: Soft Delete Todo
**As an** organisation member  
**I want to** delete a todo  
**So that** I can remove tasks I no longer need

**Acceptance Criteria:**
- Sets IsDeleted = true, DeletedAt = now
- Todo remains in storage
- Excluded from list by default
- Requires current version
- Returns 204 No Content
- Audit log records soft delete

**Priority:** P0  
**Story Points:** 2  
**Status:** ✅ Completed

---

### US-014: Restore Deleted Todo
**As an** organisation member  
**I want to** restore a deleted todo  
**So that** I can recover accidentally deleted tasks

**Acceptance Criteria:**
- Sets IsDeleted = false, DeletedAt = null
- Todo appears in default lists again
- Requires current version
- Audit log records restoration

**Priority:** P1  
**Story Points:** 2  
**Status:** ✅ Completed

---

### US-015: Hard Delete Todo
**As an** OrgAdmin  
**I want to** permanently delete a todo  
**So that** sensitive data can be purged

**Acceptance Criteria:**
- Only OrgAdmins can hard delete
- Todo is removed from storage entirely
- No version check (destructive admin action)
- Returns 204 No Content
- Audit log records hard delete

**Priority:** P2  
**Story Points:** 2  
**Status:** ✅ Completed

---

### US-016: List Todos with Pagination
**As an** organisation member  
**I want to** view todos with pagination  
**So that** I can browse large lists efficiently

**Acceptance Criteria:**
- Supports page number and page size (1-100)
- Returns total count, page count, has next/previous flags
- Default: page 1, 20 items per page
- Excludes deleted by default
- Returns 422 if page < 1 or page size out of bounds

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-017: Filter Todos
**As an** organisation member  
**I want to** filter todos  
**So that** I can find relevant tasks

**Acceptance Criteria:**
- Filter by status (Open/Done/Archived)
- Filter by priority (Low/Medium/High)
- Filter by tag (exact match)
- Filter by overdue (due date < now && status = Open)
- Filters are combinable
- Returns empty list if no matches

**Priority:** P1  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-018: Sort Todos
**As an** organisation member  
**I want to** sort todos  
**So that** I can prioritize my work

**Acceptance Criteria:**
- Sort by: createdAt, updatedAt, dueDate, priority
- Sort order: ascending or descending
- Default: createdAt descending (newest first)
- Null due dates sorted last when ascending, first when descending

**Priority:** P1  
**Story Points:** 2  
**Status:** ✅ Completed

---

### US-019: Archive Completed Todos
**As an** OrgAdmin  
**I want to** archive old completed todos  
**So that** active lists stay focused

**Acceptance Criteria:**
- Only OrgAdmins can manually trigger archive
- Archives todos: status = Done AND updated > N days ago
- Days threshold is configurable (default: 90)
- Returns count of archived todos
- Audit log records archive action

**Priority:** P1  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-020: Automatic Background Archiving
**As a** system  
**I want to** automatically archive old completed todos  
**So that** admins don't have to do it manually

**Acceptance Criteria:**
- Runs as background job (hosted service)
- Interval configurable (default: daily)
- Archives todos meeting criteria across all orgs
- Logs count of archived todos per org
- Does not block API requests

**Priority:** P2  
**Story Points:** 5  
**Status:** ✅ Completed

---

## Epic 4: Import/Export

### US-021: Export Todos to JSON
**As an** organisation member  
**I want to** export todos to JSON  
**So that** I can back up my data

**Acceptance Criteria:**
- Returns all todos for the organisation
- Excludes soft-deleted todos
- Includes archived todos
- JSON structure: array of todo objects
- File download with timestamp in filename
- Audit log records export

**Priority:** P1  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-022: Export Todos to CSV
**As an** organisation member  
**I want to** export todos to CSV  
**So that** I can analyze data in Excel

**Acceptance Criteria:**
- CSV headers: Id, Title, Description, Status, Priority, Tags, DueDate, IsArchived
- Tags are semicolon-separated in single column
- Properly escapes quotes and commas
- File download with timestamp in filename

**Priority:** P1  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-023: Import Todos from JSON
**As an** organisation member  
**I want to** import todos from JSON  
**So that** I can restore backed-up data

**Acceptance Criteria:**
- Accepts JSON array of todo objects
- Validates each todo (title, priority, tags, etc.)
- Returns import report: accepted count + rejected rows with errors
- Rejected rows include row number and all validation errors
- Accepted todos are created with current user as creator
- Audit log records import with counts

**Priority:** P1  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-024: Import Todos from CSV
**As an** organisation member  
**I want to** import todos from CSV  
**So that** I can bulk-load from Excel

**Acceptance Criteria:**
- Parses CSV with headers
- Validates each row
- Returns import report with row-level errors
- Handles quoted fields and escaped commas
- Semicolon-separated tags parsed correctly

**Priority:** P1  
**Story Points:** 5  
**Status:** ✅ Completed

---

## Epic 5: Audit & Compliance

### US-025: Record Audit Events
**As a** system  
**I want to** log all significant actions  
**So that** we have a compliance trail

**Acceptance Criteria:**
- Logs: login, logout, todo CRUD, org CRUD, member changes, import/export
- Each entry includes: timestamp, actor, org, action, entity type, entity ID, correlation ID
- Audit entries are immutable (no update/delete)

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-026: View Audit Log
**As an** OrgAdmin  
**I want to** view the audit log  
**So that** I can review team activity

**Acceptance Criteria:**
- Only OrgAdmins can view audit logs
- Supports pagination (default: 50 per page)
- Sorted by timestamp descending (newest first)
- Filtered by organisation
- Returns 403 if non-admin tries to access

**Priority:** P0  
**Story Points:** 3  
**Status:** ✅ Completed

---

## Epic 6: Concurrency & Data Integrity

### US-027: Optimistic Concurrency Control
**As a** system  
**I want to** prevent lost updates  
**So that** concurrent edits don't overwrite each other

**Acceptance Criteria:**
- Every todo has a version field (starts at 1)
- Version increments on every update
- Update requests must include expected version
- Returns 412 Precondition Failed if version mismatch
- Response includes new version and ETag header

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

### US-028: ETag Support
**As a** client  
**I want to** use ETag headers  
**So that** I can implement caching and concurrency

**Acceptance Criteria:**
- ETag = `"{version}"`
- Returned in response headers for create/update
- Accepted via If-Match header for updates
- 412 returned if If-Match doesn't match current ETag

**Priority:** P1  
**Story Points:** 2  
**Status:** ✅ Completed

---

## Epic 7: Storage & Persistence

### US-029: InMemory Storage
**As a** developer  
**I want to** run with InMemory storage  
**So that** I can develop and test quickly

**Acceptance Criteria:**
- All data stored in ConcurrentDictionary
- Thread-safe for concurrent access
- Data lost on restart
- Configurable via appsettings.json

**Priority:** P0  
**Story Points:** 3  
**Status:** ✅ Completed

---

### US-030: File-Based Storage
**As a** user  
**I want to** persist data to files  
**So that** data survives restarts

**Acceptance Criteria:**
- Each entity type stored in separate JSON file
- Atomic writes (write to .tmp, rename on success)
- File locking prevents concurrent corruption
- Schema version field in every file
- Configurable via appsettings.json

**Priority:** P0  
**Story Points:** 8  
**Status:** ✅ Completed

---

### US-031: Schema Migrations
**As a** system  
**I want to** migrate file storage schemas  
**So that** data format can evolve

**Acceptance Criteria:**
- Detects schema version on file read
- Runs migrations if version < current
- Migration runner discovers IMigration implementations
- V1→V2 migration implemented and tested
- Migrations run atomically with file locks

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

## Epic 8: Security & Compliance

### US-032: OWASP ASVS Compliance
**As a** security reviewer  
**I want to** verify OWASP ASVS requirements  
**So that** the system meets security standards

**Acceptance Criteria:**
- Password hashing with bcrypt (work factor 12+)
- Brute force protection (lockout after 5 failed logins)
- Session timeout (24 hours max)
- Input validation on all endpoints
- No sensitive data in logs
- HTTPS enforced in production

**Priority:** P0  
**Story Points:** 8  
**Status:** ✅ Completed

---

### US-033: STRIDE Threat Modeling
**As a** security team  
**I want to** document threats  
**So that** mitigations are in place

**Acceptance Criteria:**
- 15+ threats identified across STRIDE categories
- Each threat has mitigation strategy
- High/critical threats addressed in implementation

**Priority:** P0  
**Story Points:** 5  
**Status:** ✅ Completed

---

## Epic 9: Monitoring & Operations

### US-034: Health Check Endpoint
**As an** operations team  
**I want to** monitor service health  
**So that** I can detect outages

**Acceptance Criteria:**
- GET /api/health returns 200 if healthy
- Returns status and timestamp
- No authentication required
- Responds in <100ms

**Priority:** P1  
**Story Points:** 1  
**Status:** ✅ Completed

---

### US-035: Structured Logging with Correlation IDs
**As an** operations team  
**I want to** trace requests across logs  
**So that** I can debug issues

**Acceptance Criteria:**
- Every request assigned a correlation ID
- Correlation ID in response headers (X-Correlation-ID)
- Correlation ID logged with every log entry
- Correlation ID passed to audit entries
- Serilog configured for structured logging

**Priority:** P1  
**Story Points:** 3  
**Status:** ✅ Completed

---

## Summary

| Epic | Stories | Completed | In Progress | Planned | Total Points |
|------|---------|-----------|-------------|---------|--------------|
| Authentication | 4 | 4 | 0 | 0 | 15 |
| Organisations | 5 | 5 | 0 | 0 | 13 |
| Todos | 11 | 11 | 0 | 0 | 40 |
| Import/Export | 4 | 4 | 0 | 0 | 16 |
| Audit | 2 | 2 | 0 | 0 | 8 |
| Concurrency | 2 | 2 | 0 | 0 | 7 |
| Storage | 3 | 3 | 0 | 0 | 16 |
| Security | 2 | 2 | 0 | 0 | 13 |
| Monitoring | 2 | 2 | 0 | 0 | 4 |
| **Total** | **35** | **35** | **0** | **0** | **160** |

---

## Backlog Notes

- **Velocity**: ~25 story points per week
- **Completion**: 100% of stories delivered (35/35)
- **Technical Debt**: None identified (greenfield project)
- **All planned features shipped** including session management, OWASP compliance, and STRIDE threat modelling
