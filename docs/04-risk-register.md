# Risk Register: TaskHub

**Last Updated:** February 19, 2026  
**Total Risks Identified:** 12  
**Critical/High Risks:** 4  

---

## Risk Assessment Matrix

| Likelihood | Impact | Risk Level |
|------------|--------|------------|
| High | High | 🔴 Critical |
| High | Medium | 🟠 High |
| Medium | High | 🟠 High |
| Medium | Medium | 🟡 Medium |
| Low | High | 🟡 Medium |
| Low | Medium | 🟢 Low |

---

## Risk 1: File Storage Corruption

**ID:** RISK-001  
**Category:** Technical  
**Likelihood:** Medium  
**Impact:** High  
**Risk Level:** 🟠 High  

**Description:**  
Concurrent writes to JSON files could corrupt data if file locking fails or crashes occur mid-write.

**Impact:**  
- Complete data loss for affected entity type
- System becomes unusable
- No automatic recovery mechanism

**Mitigation Strategy:**
1. ✅ **Implemented:** Atomic writes (write to .tmp, rename on success)
2. ✅ **Implemented:** Per-file SemaphoreSlim locks prevent concurrent access
3. ✅ **Implemented:** Schema versioning enables detection of corruption
4. ⏳ **Planned:** Add file integrity checksums
5. ⏳ **Planned:** Automated backup to separate directory every 6 hours

**Residual Risk:** 🟡 Medium  
**Owner:** Lead Developer  
**Status:** Partially Mitigated

---

## Risk 2: No Database Transactions

**ID:** RISK-002  
**Category:** Technical  
**Likelihood:** Medium  
**Impact:** Medium  
**Risk Level:** 🟡 Medium  

**Description:**  
File storage doesn't support ACID transactions. Operations spanning multiple files (e.g., create org + membership) could partially fail.

**Impact:**  
- Orphaned data (org exists but no membership)
- Inconsistent state requiring manual cleanup
- User confusion

**Mitigation Strategy:**
1. ✅ **Implemented:** Minimize cross-file operations in single use case
2. ✅ **Implemented:** Handlers are idempotent where possible
3. ⏳ **Planned:** Implement saga pattern for multi-file operations
4. ⏳ **Planned:** Add data consistency validation in health check

**Residual Risk:** 🟡 Medium  
**Owner:** Lead Developer  
**Status:** Partially Mitigated

---

## Risk 3: Brute Force Authentication Attacks

**ID:** RISK-003  
**Category:** Security  
**Likelihood:** High  
**Impact:** High  
**Risk Level:** 🔴 Critical  

**Description:**  
Attackers could attempt credential stuffing or brute force attacks against login endpoint.

**Impact:**  
- Unauthorized account access
- Account lockouts (DoS for legitimate users)
- Reputational damage

**Mitigation Strategy:**
1. ✅ **Implemented:** Account lockout after 5 failed attempts
2. ✅ **Implemented:** 15-minute lockout duration
3. ✅ **Implemented:** Same error message for invalid username and wrong password
4. ⏳ **Planned:** Rate limiting on login endpoint (10 req/min per IP)
5. ⏳ **Planned:** CAPTCHA after 3 failed attempts
6. ⏳ **Planned:** Alert admins of suspicious login patterns

**Residual Risk:** 🟡 Medium  
**Owner:** Security Team  
**Status:** Partially Mitigated

---

## Risk 4: Session Hijacking

**ID:** RISK-004  
**Category:** Security  
**Likelihood:** Medium  
**Impact:** High  
**Risk Level:** 🟠 High  

**Description:**  
Attackers could steal session tokens via XSS, network sniffing, or physical access to user's device.

**Impact:**  
- Unauthorized access to user's account
- Data exfiltration
- Malicious actions performed as victim

**Mitigation Strategy:**
1. ⏳ **Planned:** HTTP-only cookies (prevent XSS access)
2. ⏳ **Planned:** Secure flag on cookies (HTTPS only)
3. ⏳ **Planned:** SameSite=Strict cookie attribute
4. ⏳ **Planned:** Session expiry (24 hours)
5. ⏳ **Planned:** Regenerate session ID on login
6. ⏳ **Planned:** Log session creation from new IP addresses

**Residual Risk:** 🟠 High  
**Owner:** Security Team  
**Status:** Not Yet Mitigated

---

## Risk 5: Insufficient Input Validation

**ID:** RISK-005  
**Category:** Security  
**Likelihood:** Medium  
**Impact:** Medium  
**Risk Level:** 🟡 Medium  

**Description:**  
Missing or incomplete validation could allow injection attacks, buffer overflows, or data corruption.

**Impact:**  
- SQL injection (if database is later added)
- Path traversal attacks
- Malformed data in storage
- XSS if data displayed in web UI

**Mitigation Strategy:**
1. ✅ **Implemented:** Validation at domain entity level (Tag, Email value objects)
2. ✅ **Implemented:** Validation at use case level (validators for each command)
3. ✅ **Implemented:** Length limits on all string fields
4. ✅ **Implemented:** Regex validation for tags and emails
5. ⏳ **Planned:** Content Security Policy headers
6. ⏳ **Planned:** Automated security testing with OWASP ZAP

**Residual Risk:** 🟢 Low  
**Owner:** Lead Developer  
**Status:** Well Mitigated

---

## Risk 6: Lost Updates Due to Concurrency

**ID:** RISK-006  
**Category:** Technical  
**Likelihood:** Low  
**Impact:** Medium  
**Risk Level:** 🟢 Low  

**Description:**  
Two users editing the same todo simultaneously could result in one user's changes being overwritten.

**Impact:**  
- Data loss for one user
- User frustration
- Reduced trust in system

**Mitigation Strategy:**
1. ✅ **Implemented:** Optimistic concurrency with version field
2. ✅ **Implemented:** ETag headers for HTTP-level concurrency
3. ✅ **Implemented:** 412 Precondition Failed on version mismatch
4. ✅ **Implemented:** Clear error messages instructing user to reload

**Residual Risk:** 🟢 Low  
**Owner:** Lead Developer  
**Status:** Fully Mitigated

---

## Risk 7: Audit Log Tampering

**ID:** RISK-007  
**Category:** Security / Compliance  
**Likelihood:** Low  
**Impact:** High  
**Risk Level:** 🟡 Medium  

**Description:**  
Malicious admin or attacker with file access could modify audit logs to hide unauthorized actions.

**Impact:**  
- Loss of compliance evidence
- Unable to trace security incidents
- Regulatory penalties

**Mitigation Strategy:**
1. ✅ **Implemented:** Audit entries are immutable (no update/delete in domain)
2. ✅ **Implemented:** Append-only audit repository
3. ⏳ **Planned:** Cryptographic signatures on audit entries
4. ⏳ **Planned:** Separate audit file with stricter permissions
5. ⏳ **Planned:** Forward audit logs to immutable external service (e.g., S3)

**Residual Risk:** 🟡 Medium  
**Owner:** Security Team  
**Status:** Partially Mitigated

---

## Risk 8: Scalability Limitations

**ID:** RISK-008  
**Category:** Technical  
**Likelihood:** Medium  
**Impact:** Medium  
**Risk Level:** 🟡 Medium  

**Description:**  
File storage does not scale horizontally. Large files slow down read/write operations. No support for clustering.

**Impact:**  
- Performance degradation with >10,000 todos
- Single point of failure (one server only)
- Cannot handle high concurrent user load

**Mitigation Strategy:**
1. ✅ **Implemented:** InMemory option for development/testing
2. ⏳ **Planned:** Document migration path to PostgreSQL
3. ⏳ **Planned:** Repository abstraction allows swapping storage
4. ⏳ **Planned:** Load testing to establish limits
5. ⏳ **Planned:** Document "not recommended for >50 users"

**Residual Risk:** 🟡 Medium (Accepted for MVP)  
**Owner:** Product Owner  
**Status:** Accepted Risk

---

## Risk 9: Dependency Vulnerabilities

**ID:** RISK-009  
**Category:** Security  
**Likelihood:** Medium  
**Impact:** Medium  
**Risk Level:** 🟡 Medium  

**Description:**  
NuGet packages could have known vulnerabilities (e.g., BCrypt.Net, Serilog).

**Impact:**  
- Remote code execution
- Data breaches
- Supply chain attack

**Mitigation Strategy:**
1. ✅ **Implemented:** Using latest stable package versions
2. ⏳ **Planned:** Enable Dependabot/NuGet vulnerability alerts
3. ⏳ **Planned:** Run `dotnet list package --vulnerable` in CI
4. ⏳ **Planned:** Monthly dependency review process
5. ⏳ **Planned:** Automated PRs for security patches

**Residual Risk:** 🟡 Medium  
**Owner:** DevOps Team  
**Status:** Partially Mitigated

---

## Risk 10: Insufficient Error Handling

**ID:** RISK-010  
**Category:** Technical  
**Likelihood:** Low  
**Impact:** Medium  
**Risk Level:** 🟢 Low  

**Description:**  
Unhandled exceptions could crash the API or leak sensitive information in error responses.

**Impact:**  
- Service downtime
- Exposure of stack traces, file paths, or internal details
- Poor user experience

**Mitigation Strategy:**
1. ✅ **Implemented:** Global exception handling middleware
2. ✅ **Implemented:** Domain exceptions mapped to HTTP status codes
3. ✅ **Implemented:** Problem Details (RFC 9457) format for errors
4. ✅ **Implemented:** Structured logging with correlation IDs
5. ✅ **Implemented:** No stack traces in production responses

**Residual Risk:** 🟢 Low  
**Owner:** Lead Developer  
**Status:** Fully Mitigated

---

## Risk 11: Missing Backup Strategy

**ID:** RISK-011  
**Category:** Operational  
**Likelihood:** Low  
**Impact:** High  
**Risk Level:** 🟡 Medium  

**Description:**  
File storage has no automated backup. Hardware failure or accidental deletion could result in permanent data loss.

**Impact:**  
- Complete data loss
- No disaster recovery option
- Business continuity failure

**Mitigation Strategy:**
1. ⏳ **Planned:** Automated daily backups to separate directory
2. ⏳ **Planned:** Backup retention policy (7 days)
3. ⏳ **Planned:** Backup verification (restore test monthly)
4. ⏳ **Planned:** Document manual backup procedure
5. ⏳ **Planned:** Export feature allows users to create their own backups

**Residual Risk:** 🟡 Medium  
**Owner:** Operations Team  
**Status:** Not Yet Mitigated

---

## Risk 12: Inadequate Documentation

**ID:** RISK-012  
**Category:** Operational  
**Likelihood:** Low  
**Impact:** Medium  
**Risk Level:** 🟢 Low  

**Description:**  
Insufficient documentation could make system difficult to maintain, extend, or troubleshoot.

**Impact:**  
- Knowledge loss when developer leaves
- Longer onboarding time for new developers
- Costly mistakes during maintenance

**Mitigation Strategy:**
1. ✅ **Implemented:** Comprehensive ARCHITECTURE-README.md
2. ✅ **Implemented:** 10+ ADRs documenting key decisions
3. ✅ **Implemented:** Inline code comments for complex logic
4. ✅ **Implemented:** OpenAPI/Swagger documentation
5. ⏳ **Planned:** Video walkthrough of codebase
6. ⏳ **Planned:** Runbook for common operations

**Residual Risk:** 🟢 Low  
**Owner:** Lead Developer  
**Status:** Well Mitigated

---

## Risk Summary Dashboard

| Risk Level | Count | Percentage |
|------------|-------|------------|
| 🔴 Critical | 1 | 8% |
| 🟠 High | 3 | 25% |
| 🟡 Medium | 6 | 50% |
| 🟢 Low | 2 | 17% |
| **Total** | **12** | **100%** |

---

## Top 3 Priority Risks to Address

1. **RISK-004: Session Hijacking** 🔴 Critical
   - Action: Implement secure cookie configuration
   - Deadline: Before production deployment
   - Owner: Security Team

2. **RISK-003: Brute Force Attacks** 🔴 Critical
   - Action: Add rate limiting and CAPTCHA
   - Deadline: Before production deployment
   - Owner: Security Team

3. **RISK-001: File Storage Corruption** 🟠 High
   - Action: Add checksums and automated backups
   - Deadline: Within 2 weeks of MVP
   - Owner: Lead Developer

---

## Risk Review Schedule

- **Weekly:** Review critical/high risks during standup
- **Bi-weekly:** Update risk register with new risks
- **Monthly:** Full risk assessment with stakeholders
- **Quarterly:** Risk response effectiveness review

---

## Acceptance Criteria for Risk Closure

A risk can be marked as **CLOSED** when:
1. Residual risk level is 🟢 Low or lower
2. All mitigation strategies are fully implemented
3. Mitigation effectiveness has been tested
4. Risk owner has signed off

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-19 | Development Team | Initial risk register with 12 risks |
