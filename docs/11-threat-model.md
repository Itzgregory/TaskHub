# STRIDE Threat Model: TaskHub

**Date:** February 19, 2026  
**Total Threats:** 18  
**Framework:** STRIDE (Microsoft Threat Modeling)

---

## Threat Summary

| Category | Count | High Risk |
|----------|-------|-----------|
| **S**poofing | 3 | 2 |
| **T**ampering | 4 | 1 |
| **R**epudiation | 2 | 0 |
| **I**nformation Disclosure | 4 | 2 |
| **D**enial of Service | 3 | 1 |
| **E**levation of Privilege | 2 | 1 |
| **Total** | **18** | **7** |

---

## SPOOFING THREATS

### T-S01: Session Token Theft
**Risk:** High  
**Description:** Attacker steals session token via XSS or network sniffing

**Attack Vector:**
- XSS in frontend injects script to read session cookie
- Man-in-the-middle attack on HTTP connection
- Physical access to victim's device

**Impact:** Full account compromise, unauthorized data access

**Mitigation:**
- ✅ HTTP-Only cookies (prevents XSS access)
- ✅ Secure flag on cookies (HTTPS only)
- ✅ SameSite=Strict attribute
- ⏳ Content Security Policy headers
- ⏳ Session regeneration after login

**Status:** Partially Mitigated

---

### T-S02: Credential Stuffing
**Risk:** High  
**Description:** Attacker uses leaked credentials from other breaches

**Attack Vector:**
- Automated bot tries username/password pairs from breach databases
- Users reuse passwords across sites

**Impact:** Unauthorized account access

**Mitigation:**
- ✅ Account lockout after 5 failed attempts
- ✅ 15-minute lockout duration
- ✅ Audit log tracks all login attempts
- ⏳ Rate limiting on login endpoint
- ⏳ CAPTCHA after failed attempts

**Status:** Partially Mitigated

---

### T-S03: Username Enumeration
**Risk:** Medium  
**Description:** Attacker discovers valid usernames

**Attack Vector:**
- Different error messages for "user not found" vs "wrong password"
- Registration endpoint reveals if username exists
- Timing attacks (different response times)

**Impact:** Reduces search space for brute force attacks

**Mitigation:**
- ✅ Same error message for invalid username and wrong password
- ✅ Consistent response times
- ⏳ Rate limiting on registration endpoint

**Status:** Well Mitigated

---

## TAMPERING THREATS

### T-T01: File Storage Corruption
**Risk:** High  
**Description:** Attacker modifies JSON files directly on server

**Attack Vector:**
- SSH/RDP access to server
- Compromised service account with file write permissions
- Malware with filesystem access

**Impact:** Data corruption, business logic bypass, audit trail destruction

**Mitigation:**
- ✅ Atomic file writes (prevents partial corruption)
- ✅ File locking (prevents concurrent writes)
- ✅ Schema versioning (detects corruption)
- ⏳ File integrity checksums
- ⏳ File system permissions (read-only for app user)
- ⏳ Regular backups to immutable storage

**Status:** Partially Mitigated

---

### T-T02: Concurrent Update Race Condition
**Risk:** Medium  
**Description:** Lost updates when two users edit simultaneously

**Attack Vector:**
- User A and B load same todo
- Both make changes
- Last write wins, first user's changes lost

**Impact:** Data loss, user frustration

**Mitigation:**
- ✅ Optimistic concurrency with version field
- ✅ ETag headers
- ✅ 412 Precondition Failed on mismatch
- ✅ Clear error messages

**Status:** Fully Mitigated

---

### T-T03: Malicious Import Data
**Risk:** Medium  
**Description:** Attacker uploads crafted JSON/CSV to inject malicious data

**Attack Vector:**
- Extremely long strings cause buffer overflow
- Special characters break parser
- SQL injection payloads (if DB added later)
- XSS payloads in todo titles/descriptions

**Impact:** DoS, data corruption, potential code execution

**Mitigation:**
- ✅ Length validation on all fields
- ✅ Regex validation for tags
- ✅ Import validation with detailed error reporting
- ⏳ Content sanitization before storage
- ⏳ Output encoding in frontend

**Status:** Partially Mitigated

---

### T-T04: Audit Log Tampering
**Risk:** Medium  
**Description:** Admin modifies audit logs to hide unauthorized actions

**Attack Vector:**
- Direct file system access to audit.json
- Modify entries to remove incriminating evidence

**Impact:** Loss of compliance, inability to investigate incidents

**Mitigation:**
- ✅ Audit entries immutable in domain (no update/delete methods)
- ✅ Append-only repository implementation
- ⏳ Cryptographic signatures on entries
- ⏳ Forward logs to external immutable service

**Status:** Partially Mitigated

---

## REPUDIATION THREATS

### T-R01: User Denies Action
**Risk:** Low  
**Description:** User claims they didn't perform an action

**Attack Vector:**
- User deletes important todo, then denies responsibility
- Shared account used by multiple people

**Impact:** Disputes, lack of accountability

**Mitigation:**
- ✅ Comprehensive audit logging
- ✅ Every action linked to specific user ID
- ✅ Timestamps and correlation IDs
- ✅ OrgAdmins can review audit trail

**Status:** Fully Mitigated

---

### T-R02: Session Sharing
**Risk:** Low  
**Description:** Multiple users share single account

**Attack Vector:**
- Team shares one login credential
- Actions can't be attributed to individual

**Impact:** Loss of individual accountability

**Mitigation:**
- ⏳ Session limit per user (1 concurrent session)
- ⏳ Track IP address and user agent in audit log
- ⏳ Alert on login from new device

**Status:** Not Mitigated (Accepted for MVP)

---

## INFORMATION DISCLOSURE THREATS

### T-I01: Cross-Org Data Leak
**Risk:** High  
**Description:** User accesses another organisation's data

**Attack Vector:**
- Manipulate orgId parameter in API requests
- Exploit missing authorization checks
- Guess organisation IDs

**Impact:** Confidential data exposure, privacy violation

**Mitigation:**
- ✅ Membership check in every handler
- ✅ 403 Forbidden if user not in org
- ✅ No cross-org queries possible
- ✅ Audit log records unauthorized attempts

**Status:** Fully Mitigated

---

### T-I02: Sensitive Data in Logs
**Risk:** High  
**Description:** Passwords, session tokens logged

**Attack Vector:**
- Logs stored on disk with weak permissions
- Centralized logging sends sensitive data over network
- Developer accidentally logs request body

**Impact:** Credential exposure, session hijacking

**Mitigation:**
- ✅ No passwords in logs (only hashes stored)
- ✅ Structured logging with Serilog
- ✅ Exception middleware doesn't log request bodies
- ⏳ Log scrubbing for sensitive fields
- ⏳ Encrypt logs at rest

**Status:** Partially Mitigated

---

### T-I03: Stack Traces in Production
**Risk:** Medium  
**Description:** Detailed error messages expose internal details

**Attack Vector:**
- Unhandled exception returns stack trace to client
- Reveals file paths, library versions, code structure

**Impact:** Information gathering for targeted attacks

**Mitigation:**
- ✅ Global exception middleware
- ✅ Generic error messages in production
- ✅ Stack traces only in logs (not responses)
- ✅ Problem Details format hides internals

**Status:** Fully Mitigated

---

### T-I04: Audit Log Information Leak
**Risk:** Low  
**Description:** Members can see other members' actions

**Attack Vector:**
- Audit log endpoint doesn't filter by user
- Member queries audit log, sees admin actions

**Impact:** Privacy concern, reconnaissance for attacks

**Mitigation:**
- ✅ Only OrgAdmins can view audit logs
- ✅ 403 Forbidden for non-admins
- ✅ Audit logs scoped to organisation

**Status:** Fully Mitigated

---

## DENIAL OF SERVICE THREATS

### T-D01: File Storage Exhaustion
**Risk:** High  
**Description:** Attacker fills disk with large todos

**Attack Vector:**
- Create todos with 2000-char descriptions repeatedly
- Import massive CSV files
- Create thousands of organisations

**Impact:** Service becomes unusable, legitimate requests fail

**Mitigation:**
- ✅ Length limits on all fields
- ⏳ Rate limiting on all endpoints
- ⏳ Quota per organisation (max todos, max storage)
- ⏳ Disk space monitoring and alerts

**Status:** Partially Mitigated

---

### T-D02: Brute Force Account Lockout
**Risk:** Medium  
**Description:** Attacker locks out legitimate users

**Attack Vector:**
- Intentionally fail login 5 times for target user
- User locked out for 15 minutes

**Impact:** Denial of service for specific users

**Mitigation:**
- ✅ Account lockout necessary for security
- ⏳ CAPTCHA before lockout (allows legit user to prove humanity)
- ⏳ Alert user via email when locked out

**Status:** Partially Mitigated (Trade-off accepted)

---

### T-D03: Background Job Resource Exhaustion
**Risk:** Low  
**Description:** Archive job consumes excessive CPU/memory

**Attack Vector:**
- Organisation has 1 million todos
- Archive job tries to load all in memory
- Server crashes

**Impact:** Service downtime

**Mitigation:**
- ⏳ Batch processing in archive job
- ⏳ Memory limits on background jobs
- ⏳ Document scaling limits (not for >10k todos)

**Status:** Not Mitigated (Documented limitation)

---

## ELEVATION OF PRIVILEGE THREATS

### T-E01: Member Promotes Self to Admin
**Risk:** High  
**Description:** Regular member gains OrgAdmin privileges

**Attack Vector:**
- Exploit missing authorization check in ChangeRole endpoint
- Manipulate request to change own role

**Impact:** Full organisation compromise

**Mitigation:**
- ✅ Only OrgAdmins can change roles
- ✅ Authorization check in ChangeRoleHandler
- ✅ Cannot modify own role (future enhancement)
- ✅ Audit log records all role changes

**Status:** Well Mitigated

---

### T-E02: SQL Injection (Future Risk)
**Risk:** Medium (if database added)  
**Description:** Attacker injects SQL via input fields

**Attack Vector:**
- Todo title: `"; DROP TABLE todos; --`
- Executes arbitrary SQL if parameterization missing

**Impact:** Complete data loss, database takeover

**Mitigation:**
- ✅ Currently using file storage (no SQL)
- ✅ Repository abstraction prepares for safe DB migration
- ⏳ Use parameterized queries when DB added
- ⏳ ORM (Entity Framework) handles escaping

**Status:** Not Applicable (Future consideration)

---

## Mitigation Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Fully Mitigated | 6 | 33% |
| 🟡 Partially Mitigated | 10 | 56% |
| ⏳ Not Mitigated | 2 | 11% |

---

## Top 3 Priority Actions

1. **Implement rate limiting** (addresses T-S02, T-D01, T-S03)
2. **Add file integrity checksums** (addresses T-T01)
3. **Implement CAPTCHA on login** (addresses T-S02, T-D02)

---

## Threat Model Maintenance

- **Review Frequency:** Quarterly or when adding new features
- **Update Trigger:** New attack vectors discovered, architecture changes
- **Owner:** Security Team + Lead Developer
