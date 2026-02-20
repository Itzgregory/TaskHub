# Operational Design

**Project:** TaskHub  
**Date:** 2026-02-19  

---

## Structured Logging

### Format
All logs use structured JSON via Serilog:

```json
{
  "Timestamp": "2026-02-19T10:30:00.123Z",
  "Level": "Information",
  "MessageTemplate": "Todo {Action} by {UserId} in org {OrgId}",
  "Properties": {
    "Action": "Created",
    "UserId": "550e8400-...",
    "OrgId": "660e8400-...",
    "TodoId": "770e8400-...",
    "CorrelationId": "abc-123-def",
    "RequestPath": "/api/v1/todos",
    "RequestMethod": "POST",
    "StatusCode": 201,
    "ElapsedMs": 42
  }
}
```

### Standard Fields

Every log entry includes:

| Field | Source | Purpose |
|-------|--------|---------|
| `CorrelationId` | `X-Correlation-ID` header or auto-generated GUID | Trace request across logs and audit entries |
| `RequestPath` | HTTP request | Identify endpoint |
| `RequestMethod` | HTTP request | Identify operation type |
| `UserId` | Session | Identify actor (omitted for anonymous requests) |
| `OrgId` | Request context | Identify tenant |
| `StatusCode` | HTTP response | Identify success/failure |
| `ElapsedMs` | Middleware timer | Performance monitoring |

### What Is NOT Logged
- Request bodies for `/auth/login` and `/auth/register` (contain passwords)
- Full session tokens (only first 8 characters for correlation)
- Stack traces in responses (logged server-side only)

---

## Health Checks

### Liveness — `GET /api/v1/health/live`

**Purpose:** "Is the process running?"

```json
{ "status": "Healthy" }
```

Returns `200 OK` if the process is alive. No dependency checks — this purely confirms the HTTP pipeline is functional.

### Readiness — `GET /api/v1/health/ready`

**Purpose:** "Can the service handle requests?"

```json
{
  "status": "Healthy",
  "checks": {
    "storage": "Healthy",
    "migrationStatus": "Complete"
  }
}
```

Checks:
- **Storage:** Can read/write to the configured storage provider
- **Migration status:** File storage schema migrations have completed

Returns `503 Service Unavailable` if any check fails (e.g., during migration or if file storage is inaccessible).

### Usage in Deployment

```yaml
# Kubernetes-style health config
livenessProbe:
  httpGet:
    path: /api/v1/health/live
    port: 5078
  initialDelaySeconds: 5
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/v1/health/ready
    port: 5078
  initialDelaySeconds: 10
  periodSeconds: 15
```

---

## Storage Migration Strategy

### Schema Versioning

Every JSON file begins with a `schemaVersion` field:

```json
{
  "schemaVersion": 2,
  "todos": [...]
}
```

### Migration Runner

On startup, the `FileMigrationRunner`:
1. Reads each JSON file
2. Checks `schemaVersion`
3. If < current version, runs migrations sequentially (v1→v2, v2→v3, etc.)
4. Writes migrated file atomically (temp + rename)
5. Logs migration result

### Implemented Migrations

| Migration | Changes | Date |
|-----------|---------|------|
| v1 → v2 | Added `IsArchived`, `ArchivedAt` fields to TodoItem | 2026-02-19 |

### Migration Safety
- Migrations are **idempotent** — re-running on an already-migrated file is a no-op
- Migrations use **atomic writes** — partial writes are impossible
- Migrations are **tested** — integration test proves v1 file upgrades to v2 correctly
- The readiness health check blocks requests until migrations complete

---

## Backup & Restore Strategy

### File Storage Layout

```
data/
├── users.json           # All user records
├── organisations.json   # All org records
├── memberships.json     # All membership records
├── todos-{orgId}.json   # Todos per organisation
├── audit-{orgId}.json   # Audit logs per organisation
└── sessions.json        # Active sessions
```

### Backup Approach

**Frequency:** Daily automated + before deployments

```bash
# Daily backup script
BACKUP_DIR="/var/backups/taskhub/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"
cp -r /var/data/taskhub/* "$BACKUP_DIR/"
echo "Backup completed: $BACKUP_DIR"
```

### Restore Procedure

```bash
# 1. Stop the service
systemctl stop taskhub-api

# 2. Restore from backup
RESTORE_DATE="2026-02-20"
cp -r "/var/backups/taskhub/$RESTORE_DATE/"* /var/data/taskhub/

# 3. Start the service (migrations run automatically)
systemctl start taskhub-api

# 4. Verify readiness
curl http://localhost:5078/api/v1/health/ready
```

### Disaster Recovery

| Scenario | Recovery |
|----------|----------|
| Single file corrupted | Restore from latest backup |
| Disk failure | Restore from off-site backup |
| Migration failure | Rollback to pre-migration backup, fix migration, retry |
| Accidental data deletion | Soft delete is default; hard delete requires OrgAdmin |

---

## Background Jobs

| Job | Schedule | Purpose | Config |
|-----|----------|---------|--------|
| `TodoArchiveJob` | Every 24h (configurable) | Archive Done todos older than N days | `ArchiveSettings:ArchiveAfterDays`, `ArchiveSettings:IntervalHours` |

### Monitoring
- Each job run logs start time, completion, items processed, and any errors
- Failed job runs do not crash the service — errors are caught and logged
- Health check reports job status
