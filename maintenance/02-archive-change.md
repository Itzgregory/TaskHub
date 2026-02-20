# Change Request: Archive Completed Todos Older Than N Days

**Ticket title:** "Archive completed todos older than N days."

---

## Requirements

### Functional
- Implement as a background job (in-process hosted service)
- Configurable parameters:
  - `ARCHIVE_AFTER_DAYS` — number of days after completion before auto-archive (default: 90)
  - Job schedule/interval — how often the job runs (default: daily at 02:00 UTC)
- **What "archive" means:**
  - Archived items do **not** appear in the default todo list
  - Archived items **can** be shown via an `includeArchived=true` query parameter
  - Archived items remain **restorable** by any member of the org; restore clears the archived flag
  - Archived items can be hard-deleted by OrgAdmin only (same rules as soft-deleted items)

### Non-Functional
- Job must be idempotent (re-running doesn't re-archive already-archived items)
- Job must log each archival action to the audit log
- Job must not block API request handling

---

## Implementation

### 1. Domain — TodoItem Archive Support

The `TodoItem` entity already supports archival:

```csharp
// Domain/Entities/TodoItem.cs
public bool IsArchived { get; private set; }
public DateTime? ArchivedAt { get; private set; }

public void Archive(DateTime utcNow)
{
    if (IsArchived) return; // idempotent
    IsArchived = true;
    ArchivedAt = utcNow;
    UpdatedAt = utcNow;
    Version++;
}

public void Restore(DateTime utcNow)
{
    IsArchived = false;
    ArchivedAt = null;
    IsDeleted = false;
    DeletedAt = null;
    UpdatedAt = utcNow;
    Version++;
}
```

### 2. Application — Archive Use Case

```csharp
// Application/UseCases/Todos/Archive/ArchiveOldTodosCommand.cs
public record ArchiveOldTodosCommand(int ArchiveAfterDays);

// Application/UseCases/Todos/Archive/ArchiveOldTodosHandler.cs
public class ArchiveOldTodosHandler
{
    private readonly ITodoRepository _todoRepo;
    private readonly IAuditLogRepository _auditRepo;

    public async Task<int> HandleAsync(ArchiveOldTodosCommand command, CancellationToken ct)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-command.ArchiveAfterDays);

        var candidates = await _todoRepo.GetCompletedBeforeAsync(cutoffDate, ct);
        var archived = 0;

        foreach (var todo in candidates.Where(t => !t.IsArchived && !t.IsDeleted))
        {
            todo.Archive(DateTime.UtcNow);
            await _todoRepo.UpdateAsync(todo, ct);
            await _auditRepo.AddAsync(AuditEntry.Create(
                actorId: Guid.Empty, // system
                orgId: todo.OrgId,
                action: "TodoArchived",
                entityType: "Todo",
                entityId: todo.Id,
                correlationId: Guid.NewGuid()
            ), ct);
            archived++;
        }

        return archived;
    }
}
```

### 3. Infrastructure — Background Job

```csharp
// Infrastructure/BackgroundJobs/TodoArchiveJob.cs
public class TodoArchiveJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TodoArchiveJob> _logger;
    private readonly ArchiveSettings _settings;

    public TodoArchiveJob(
        IServiceScopeFactory scopeFactory,
        ILogger<TodoArchiveJob> logger,
        IOptions<ArchiveSettings> settings)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var handler = scope.ServiceProvider
                    .GetRequiredService<ArchiveOldTodosHandler>();

                var count = await handler.HandleAsync(
                    new ArchiveOldTodosCommand(_settings.ArchiveAfterDays),
                    stoppingToken);

                _logger.LogInformation(
                    "Archive job completed: {Count} todos archived (threshold: {Days} days)",
                    count, _settings.ArchiveAfterDays);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Archive job failed");
            }

            await Task.Delay(
                TimeSpan.FromHours(_settings.IntervalHours),
                stoppingToken);
        }
    }
}
```

### 4. Configuration

```json
// appsettings.json
{
  "ArchiveSettings": {
    "ArchiveAfterDays": 90,
    "IntervalHours": 24
  }
}
```

```csharp
// ArchiveSettings.cs
public class ArchiveSettings
{
    public int ArchiveAfterDays { get; set; } = 90;
    public int IntervalHours { get; set; } = 24;
}
```

### 5. API — Query Parameter

```csharp
// API endpoint already supports includeArchived parameter:
// GET /api/v1/todos?orgId={orgId}&includeArchived=true
```

---

## Tests

### Unit Test — Archive Logic

```csharp
[Fact]
public void Archive_WhenNotAlreadyArchived_SetsArchivedFields()
{
    var todo = TodoItem.Create(orgId, userId, "Old task", null, Priority.Low, [], null, DateTime.UtcNow);
    todo.ToggleStatus(DateTime.UtcNow); // mark Done

    todo.Archive(DateTime.UtcNow);

    todo.IsArchived.Should().BeTrue();
    todo.ArchivedAt.Should().NotBeNull();
}

[Fact]
public void Archive_WhenAlreadyArchived_IsIdempotent()
{
    var todo = TodoItem.Create(orgId, userId, "Old task", null, Priority.Low, [], null, DateTime.UtcNow);
    todo.ToggleStatus(DateTime.UtcNow);
    todo.Archive(DateTime.UtcNow);
    var versionBefore = todo.Version;

    todo.Archive(DateTime.UtcNow);

    todo.Version.Should().Be(versionBefore); // no version bump
}
```

### Unit Test — Restore Clears Archive

```csharp
[Fact]
public void Restore_ClearsArchivedAndDeletedFlags()
{
    var todo = TodoItem.Create(orgId, userId, "Archived task", null, Priority.Low, [], null, DateTime.UtcNow);
    todo.ToggleStatus(DateTime.UtcNow);
    todo.Archive(DateTime.UtcNow);

    todo.Restore(DateTime.UtcNow);

    todo.IsArchived.Should().BeFalse();
    todo.ArchivedAt.Should().BeNull();
    todo.IsDeleted.Should().BeFalse();
}
```

### Integration Test — Archive Job

```csharp
[Fact]
public async Task ArchiveJob_ArchivesTodosOlderThanThreshold()
{
    // Arrange — create a Done todo with UpdatedAt = 100 days ago
    var oldTodo = TodoItem.Create(orgId, userId, "Old done", null, Priority.Low, [], null, DateTime.UtcNow.AddDays(-100));
    oldTodo.ToggleStatus(DateTime.UtcNow.AddDays(-100));
    await _todoRepo.AddAsync(oldTodo);

    var recentTodo = TodoItem.Create(orgId, userId, "Recent done", null, Priority.Low, [], null, DateTime.UtcNow.AddDays(-10));
    recentTodo.ToggleStatus(DateTime.UtcNow.AddDays(-10));
    await _todoRepo.AddAsync(recentTodo);

    // Act
    var handler = new ArchiveOldTodosHandler(_todoRepo, _auditRepo);
    var count = await handler.HandleAsync(new ArchiveOldTodosCommand(90), CancellationToken.None);

    // Assert
    count.Should().Be(1);
    var old = await _todoRepo.GetByIdAsync(oldTodo.Id);
    old!.IsArchived.Should().BeTrue();

    var recent = await _todoRepo.GetByIdAsync(recentTodo.Id);
    recent!.IsArchived.Should().BeFalse();
}
```

---

## Documentation Updates

- **API Contract:** Added `includeArchived` query parameter to `GET /api/v1/todos`
- **Data Model:** Added `IsArchived`, `ArchivedAt` fields to TodoItem entity
- **Ops Design:** Added archive job to background services
- **CHANGELOG:** Entry added under v1.1.0