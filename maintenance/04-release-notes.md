# Release Notes & Operational Updates

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
