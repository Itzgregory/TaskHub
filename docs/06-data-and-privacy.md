# Data Classification & Privacy Note

**Project:** TaskHub  
**Date:** 2026-02-19  

---

## What Data We Store

| Entity | Fields | Classification |
|--------|--------|----------------|
| **User** | `Id`, `Email`, `PasswordHash`, `CreatedAt` | Contains PII |
| **Organisation** | `Id`, `Name`, `CreatedAt` | Internal |
| **Membership** | `UserId`, `OrgId`, `Role`, `JoinedAt` | Internal |
| **TodoItem** | `Id`, `OrgId`, `CreatedByUserId`, `Title`, `Description`, `Status`, `Priority`, `Tags`, `DueDate`, `Version`, `IsDeleted`, `IsArchived`, timestamps | May contain PII in free-text fields |
| **AuditEntry** | `Id`, `OrgId`, `ActorUserId`, `Action`, `EntityType`, `EntityId`, `CorrelationId`, `Timestamp` | Internal (references PII via IDs) |
| **Session** | `SessionId`, `UserId`, `CreatedAt`, `ExpiresAt` | Security-sensitive |

---

## What Is PII

| Field | PII? | Justification |
|-------|------|---------------|
| `User.Email` | ✅ Yes | Directly identifies a person |
| `User.PasswordHash` | ✅ Yes (derived) | Derived from user's password — must be protected |
| `TodoItem.Title` | ⚠️ Potentially | Free-text — user may include personal information |
| `TodoItem.Description` | ⚠️ Potentially | Free-text — user may include personal information |
| `TodoItem.Tags` | ⚠️ Potentially | Free-text — user may include personal information |
| `AuditEntry.ActorUserId` | ✅ Yes (indirect) | Links to a User record; can identify the person |
| All other fields | ❌ No | System-generated IDs, timestamps, enums |

---

## Retention Expectations

| Data | Retention Policy | Rationale |
|------|-----------------|-----------|
| **Active todos** | Indefinite while org exists | User-managed lifecycle |
| **Archived todos** | 90 days after archival, then available for hard delete | Configurable via `ARCHIVE_AFTER_DAYS` |
| **Soft-deleted todos** | Indefinite until hard-deleted by OrgAdmin | Allows recovery |
| **Audit logs** | 90 days (configurable) | Compliance + debugging |
| **Sessions** | Until logout or expiry (configurable idle timeout) | Security best practice |
| **User accounts** | Until explicitly deleted | GDPR right to erasure (future) |

### Future Considerations

- Implement account deletion (GDPR Article 17 "right to erasure")
- Implement data export for users (GDPR Article 20 "right to portability")
- Add privacy policy acceptance flow at registration

---

## What We Intentionally Do NOT Store or Log

| Item | Reason |
|------|--------|
| **Plaintext passwords** | Only BCrypt hash stored; never logged |
| **Full session tokens** | Only first 8 characters appear in logs (for correlation) |
| **Request bodies for auth endpoints** | Login/register payloads excluded from request logging |
| **Full IP addresses in audit logs** | IPs used transiently for rate limiting; not persisted |
| **Browser fingerprints** | Not collected |
| **Third-party tracking** | No analytics or telemetry SDKs |
| **Stack traces in API responses** | Never exposed to clients; logged server-side only |

---

## Data Flow Summary

```
User Browser
    ↓ (HTTPS, SameSite=Strict cookie)
API Gateway / Middleware
    ↓ (correlationId injected)
Controllers → Application Layer → Domain
    ↓
Storage (InMemory or File)
    ↓
Audit Log (append-only, org-scoped)
```

All data at rest is stored as JSON files (File provider) or in-process dictionaries (InMemory provider). No data leaves the server unless explicitly exported by the user.
