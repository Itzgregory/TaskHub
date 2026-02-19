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
