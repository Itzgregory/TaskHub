# Maintenance Phase Simulations

**Date:** 2026-02-19  

---

## 1. Bugfix Simulation

### Bug Report: Archived Todos Appearing in Default List

**Reported By:** User "sarah_chen"  
**Date:** 2026-02-20  
**Severity:** Medium  
**Environment:** Production  

**Description:**  
After archiving completed todos, they still appear in the default todo list view. Expected behavior is that archived todos should be excluded unless `includeArchived=true` is specified.

**Steps to Reproduce:**
1. Create todo with title "Old Task"
2. Mark as Done
3. Archive the todo (as OrgAdmin)
4. Call `GET /api/v1/todos?orgId={orgId}`
5. Archived todo appears in results

**Expected:** Archived todo should NOT appear  
**Actual:** Archived todo appears in list

---

### Root Cause Analysis

**Investigation:**
```csharp
// File: TodoRepository.cs, Line 45
public Task<IReadOnlyList<TodoItem>> GetByOrgIdAsync(
    Guid orgId,
    bool includeDeleted = false,
    bool includeArchived = false,
    CancellationToken cancellationToken = default)
{
    var todos = _database.Todos.Values
        .Where(t => t.OrgId == orgId);

    if (!includeDeleted)
    {
        todos = todos.Where(t => !t.IsDeleted);
    }

    // BUG: Missing check for includeArchived parameter
    
    return Task.FromResult<IReadOnlyList<TodoItem>>(todos.ToList());
}
```

**Root Cause:** The `includeArchived` parameter is accepted but never used in the filtering logic.

---

### Fix Applied

```diff
public Task<IReadOnlyList<TodoItem>> GetByOrgIdAsync(
    Guid orgId,
    bool includeDeleted = false,
    bool includeArchived = false,
    CancellationToken cancellationToken = default)
{
    var todos = _database.Todos.Values
        .Where(t => t.OrgId == orgId);

    if (!includeDeleted)
    {
        todos = todos.Where(t => !t.IsDeleted);
    }

+   if (!includeArchived)
+   {
+       todos = todos.Where(t => !t.IsArchived);
+   }

    return Task.FromResult<IReadOnlyList<TodoItem>>(todos.ToList());
}
```

---

### Testing

**Unit Test Added:**
```csharp
[Fact]
public async Task GetByOrgIdAsync_WhenIncludeArchivedFalse_ShouldExcludeArchivedTodos()
{
    // Arrange
    var orgId = Guid.NewGuid();
    var archivedTodo = TodoItem.Create(orgId, userId, "Archived", null, Priority.Medium, [], null, DateTime.UtcNow);
    archivedTodo.Archive(DateTime.UtcNow);
    await _repository.AddAsync(archivedTodo);

    var activeTodo = TodoItem.Create(orgId, userId, "Active", null, Priority.Medium, [], null, DateTime.UtcNow);
    await _repository.AddAsync(activeTodo);

    // Act
    var result = await _repository.GetByOrgIdAsync(orgId, includeArchived: false);

    // Assert
    result.Should().HaveCount(1);
    result.First().Id.Should().Be(activeTodo.Id);
}
```

**Integration Test:**
```bash
curl -X GET "http://localhost:5078/api/v1/todos?orgId={orgId}"
# Response should NOT include archived todos
```

---

### Deployment

**Version:** v1.0.1 (hotfix)  
**Deployed:** 2026-02-20 14:30 UTC  
**Rollback Plan:** Revert to v1.0.0 if issues detected  
**Monitoring:** Watch for increased error rates post-deployment  

---

## 2. Change Request Simulation

### CR-001: Add "Urgent" Priority Level

**Requested By:** Product Owner  
**Date:** 2026-02-21  
**Priority:** High  
**Estimated Effort:** 3 hours  

**Business Justification:**  
Users report that "High" priority is insufficient for truly critical tasks. Need "Urgent" priority above "High".

---

### Impact Analysis

**Affected Components:**
1. Domain: `Priority` enum
2. Application: Validators
3. Infrastructure: File schema migration
4. API: Swagger documentation
5. Tests: Update existing assertions

**Breaking Change:** Yes (enum values shift)  
**Migration Required:** Yes (update existing todos)  

---

### Implementation

**Step 1: Update Domain Enum**
```diff
// Domain/Enums/Priority.cs
public enum Priority
{
    Low = 0,
    Medium = 1,
    High = 2,
+   Urgent = 3
}
```

**Step 2: Database Migration**
```csharp
// V2ToV3Migration.cs
public class V2ToV3Migration : IMigration
{
    public int FromVersion => 2;
    public int ToVersion => 3;

    public JsonDocument Apply(JsonDocument document)
    {
        // No data migration needed - enum is backward compatible
        // New "Urgent" value (3) doesn't conflict with existing Low(0), Medium(1), High(2)
        
        using var stream = new MemoryStream();
        using (var writer = new Utf8JsonWriter(stream))
        {
            writer.WriteStartObject();
            writer.WriteNumber("schemaVersion", ToVersion);

            foreach (var property in document.RootElement.EnumerateObject())
            {
                if (property.Name != "schemaVersion")
                {
                    property.WriteTo(writer);
                }
            }

            writer.WriteEndObject();
        }

        stream.Position = 0;
        return JsonDocument.Parse(stream);
    }
}
```

**Step 3: Update SchemaVersion**
```diff
// Infrastructure/Persistence/File/Common/SchemaVersion.cs
public static class SchemaVersion
{
-   public const int Current = 2;
+   public const int Current = 3;
    public const int Initial = 1;
}
```

**Step 4: Update Tests**
```csharp
[Theory]
[InlineData(Priority.Low)]
[InlineData(Priority.Medium)]
[InlineData(Priority.High)]
[InlineData(Priority.Urgent)] // Added
public void TodoItem_Create_WithValidPriority_ShouldSucceed(Priority priority)
{
    // Test remains valid with new enum value
}
```

---

### Testing Checklist

- [x] Unit tests pass with new enum value
- [x] Migration runs successfully
- [x] API accepts "Urgent" in requests
- [x] Swagger UI shows new value
- [x] Existing todos still load correctly
- [x] Export/Import handles "Urgent" priority

---

### Release Notes Entry

```markdown
## v1.1.0 - 2026-02-22

### Added
- New "Urgent" priority level for critical tasks
- Priority levels are now: Low, Medium, High, Urgent

### Migration
- Existing todos are unaffected
- File schema upgraded to v3 (automatic)
```

---

## 3. Security Hardening Task

### Security Audit Finding: Missing Rate Limiting

**Identified By:** Security Team  
**Date:** 2026-02-23  
**Risk Level:** High  
**CWE:** CWE-770 (Allocation of Resources Without Limits)  

**Vulnerability:**  
Login endpoint has no rate limiting. Attacker can perform unlimited brute force attempts from different IP addresses, bypassing the 5-attempt account lockout.

---

### Implementation

**Step 1: Add Rate Limiting Middleware**
```csharp
// Install package
dotnet add package AspNetCoreRateLimit

// Program.cs
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.RealIpHeader = "X-Real-IP";
    options.ClientIdHeader = "X-ClientId";
    
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "POST:/api/v1/auth/login",
            Period = "1m",
            Limit = 10 // 10 requests per minute per IP
        },
        new RateLimitRule
        {
            Endpoint = "POST:/api/v1/auth/register",
            Period = "1h",
            Limit = 5 // 5 registrations per hour per IP
        }
    };
});

builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

// Add middleware
app.UseIpRateLimiting();
```

**Step 2: Add Tests**
```csharp
[Fact]
public async Task Login_WhenRateLimitExceeded_Returns429()
{
    // Arrange
    var client = _factory.CreateClient();
    
    // Act - Make 11 login requests (limit is 10/minute)
    for (int i = 0; i < 11; i++)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", 
            new { username = "test", password = "wrong" });
        
        if (i < 10)
        {
            response.StatusCode.Should().NotBe(HttpStatusCode.TooManyRequests);
        }
        else
        {
            // 11th request should be rate limited
            response.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
        }
    }
}
```

---

### Security Impact

**Before:**
- Attacker can try 1000+ passwords/minute from one IP
- Distributed attack from multiple IPs unstoppable

**After:**
- Max 10 login attempts/minute per IP
- Significantly slows brute force attacks
- Combined with account lockout provides defense in depth

---

## 4. Release Notes (v1.2.0)

```markdown
# Release Notes - v1.2.0

**Release Date:** 2026-02-25  
**Type:** Minor Release  

## 🚀 New Features

### Priority Levels Enhancement
- Added "Urgent" priority level for critical tasks
- Priority hierarchy: Low < Medium < High < Urgent
- Backward compatible with existing todos

### Rate Limiting
- Login endpoint: 10 requests/minute per IP
- Registration endpoint: 5 requests/hour per IP
- Returns 429 Too Many Requests when limit exceeded

## 🐛 Bug Fixes

### Archived Todos Filter
- Fixed issue where archived todos appeared in default list
- Now correctly respects `includeArchived` parameter
- Affects: GET /api/v1/todos endpoint

## 🔒 Security

### Brute Force Protection Enhancement
- Rate limiting on authentication endpoints
- Mitigates distributed brute force attacks
- Complements existing account lockout mechanism

## 📊 Improvements

### Performance
- File repository caching improvements
- Reduced disk I/O by 30% for read operations

### Documentation
- Added ADR for rate limiting decision
- Updated threat model with mitigations

## 🔄 Migration Notes

### Schema Version
- File storage schema upgraded from v2 → v3
- Migration is automatic on first startup
- No manual intervention required

### Configuration
Rate limiting can be customized via appsettings.json:
```json
{
  "IpRateLimiting": {
    "GeneralRules": [
      {
        "Endpoint": "POST:/api/v1/auth/login",
        "Period": "1m",
        "Limit": 10
      }
    ]
  }
}
```

## ⚠️ Breaking Changes

None - this release is fully backward compatible.

## 📦 Dependencies

### Updated
- AspNetCoreRateLimit: 5.0.0 (new)

### No Changes
- BCrypt.Net-Next: 5.0.0
- Serilog.AspNetCore: 10.0.0

## 🧪 Testing

- 142 unit tests (all passing)
- 38 integration tests (all passing)
- Code coverage: 84%

## 📝 Known Issues

- File storage performance degrades with >10,000 todos (documented limitation)
- No horizontal scaling support (file storage constraint)

## 🔜 Next Release (v1.3.0)

Planned features:
- Advanced filtering (date ranges, multiple tags)
- Batch operations (bulk delete, bulk archive)
- WebSocket support for real-time updates

## 📞 Support

Report issues: https://github.com/taskhub/issues  
Documentation: https://docs.taskhub.com  
```

---

## 5. Post-Incident Report

### Incident: Production Outage Due to Disk Full

**Incident ID:** INC-2026-001  
**Date:** 2026-02-26  
**Duration:** 2 hours 15 minutes (14:00 - 16:15 UTC)  
**Severity:** Critical  
**Impact:** Complete service outage  

---

### Timeline

**14:00** - Monitoring alerts: API health check failing  
**14:02** - On-call engineer investigates, finds 500 errors  
**14:05** - Logs show: "No space left on device"  
**14:10** - Disk usage check: 100% used on `/var/data`  
**14:15** - Incident escalated to senior engineer  
**14:20** - Root cause identified: Audit log file grew to 50GB  
**14:30** - Emergency mitigation: Truncate old audit entries  
**14:45** - Free space recovered, service restarted  
**15:00** - Service operational, monitoring for stability  
**15:30** - Implement log rotation configuration  
**16:15** - Incident closed  

---

### Root Cause

**Immediate Cause:**  
Audit log file (`audit.json`) grew unbounded. No log rotation configured. After 3 months of operation with high activity, file size exceeded available disk space.

**Contributing Factors:**
1. No disk space monitoring alerts
2. No log rotation policy
3. No archive/purge strategy for old audit entries
4. Insufficient disk capacity planning

---

### Impact Assessment

**Users Affected:** 100% (all users)  
**Requests Failed:** ~12,000 requests  
**Data Lost:** None (all writes failed gracefully)  
**Revenue Impact:** N/A (internal tool)  

---

### Resolution

**Immediate Fix:**
```bash
# Backup audit log
cp /var/data/taskhub/audit.json /var/backups/audit-2026-02-26.json

# Keep only last 30 days of audit entries
jq '.auditEntries |= map(select(.timestamp > "2026-01-27"))' \
  /var/data/taskhub/audit.json > /tmp/audit-trimmed.json

mv /tmp/audit-trimmed.json /var/data/taskhub/audit.json

# Restart service
systemctl restart taskhub-api
```

**Long-term Fix:**
1. Implemented log rotation (daily, keep 90 days)
2. Added disk space monitoring (alert at 80%)
3. Scheduled monthly audit log archival to S3
4. Increased disk capacity from 50GB → 200GB

---

### Preventive Measures

**Implemented:**
- ✅ Logrotate configuration for all JSON files
- ✅ Disk usage monitoring with alerts
- ✅ Audit log retention policy (90 days)
- ✅ Weekly backup of audit logs to S3

**Planned:**
- ⏳ Pagination in audit log retrieval
- ⏳ Compress archived audit logs
- ⏳ Circuit breaker pattern to fail gracefully when disk full

---

### Lessons Learned

**What Went Well:**
- Fast detection (2 minutes to alert)
- Clear error messages helped diagnosis
- No data corruption
- Backup strategy prevented data loss

**What Went Wrong:**
- No proactive monitoring of disk usage
- Log rotation should have been configured from day 1
- Runbook didn't cover disk full scenario

**Action Items:**
1. Add disk monitoring to all production checklist
2. Update runbooks with disk full procedure
3. Conduct DR drill for storage failures
4. Review all unbounded growth vectors (todos, orgs, sessions)

---

### Follow-up

**Post-Mortem Meeting:** 2026-02-27 10:00 UTC  
**Attendees:** DevOps, Development, Product  
**Action Item Owner:** DevOps Lead  
**Review Date:** 2026-03-26 (1 month check-in)  
