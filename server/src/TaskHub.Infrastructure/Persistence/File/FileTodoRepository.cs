using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Infrastructure.Persistence.File.Common;
using TaskHub.Infrastructure.Persistence.File.Migrations;

namespace TaskHub.Infrastructure.Persistence.File;

public class FileTodoRepository : ITodoRepository
{
    private readonly string _filePath;
    private readonly MigrationRunner _migrationRunner;

    public FileTodoRepository(string basePath)
    {
        _filePath = Path.Combine(basePath, "todos.json");
        _migrationRunner = new MigrationRunner();
    }

    public async Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var todos = await LoadAllAsync(cancellationToken);
        return todos.FirstOrDefault(t => t.Id == id);
    }

    public async Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await LoadAllAsync(cancellationToken);
    }

    public async Task AddAsync(TodoItem entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var todos = await LoadAllAsync(cancellationToken);
            
            if (todos.Any(t => t.Id == entity.Id))
            {
                throw new InvalidOperationException($"Todo with id {entity.Id} already exists.");
            }

            var todosList = todos.ToList();
            todosList.Add(entity);
            await SaveAllAsync(todosList, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateAsync(TodoItem entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var todos = await LoadAllAsync(cancellationToken);
            var todosList = todos.ToList();
            
            var index = todosList.FindIndex(t => t.Id == entity.Id);
            if (index == -1)
            {
                throw new NotFoundException("Todo", entity.Id);
            }

            todosList[index] = entity;
            await SaveAllAsync(todosList, cancellationToken);
        }, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var todos = await LoadAllAsync(cancellationToken);
            var todosList = todos.ToList();
            
            todosList.RemoveAll(t => t.Id == id);
            await SaveAllAsync(todosList, cancellationToken);
        }, cancellationToken);
    }

    public async Task<IReadOnlyList<TodoItem>> GetByOrgIdAsync(
        Guid orgId,
        bool includeDeleted = false,
        bool includeArchived = false,
        CancellationToken cancellationToken = default)
    {
        var todos = await LoadAllAsync(cancellationToken);
        var filtered = todos.Where(t => t.OrgId == orgId);

        if (!includeDeleted)
        {
            filtered = filtered.Where(t => !t.IsDeleted);
        }

        if (!includeArchived)
        {
            filtered = filtered.Where(t => !t.IsArchived);
        }

        return filtered.ToList();
    }

    public async Task<(IReadOnlyList<TodoItem> Items, int TotalCount)> GetPagedAsync(
        Guid orgId,
        int page,
        int pageSize,
        TodoStatus? status = null,
        Priority? priority = null,
        string? tag = null,
        bool? isOverdue = null,
        string? sortBy = "createdAt",
        bool ascending = false,
        bool includeDeleted = false,
        bool includeArchived = false,
        CancellationToken cancellationToken = default)
    {
        var todos = await LoadAllAsync(cancellationToken);
        var query = todos.Where(t => t.OrgId == orgId).AsEnumerable();

        // Apply filters
        if (!includeDeleted)
        {
            query = query.Where(t => !t.IsDeleted);
        }

        if (!includeArchived)
        {
            query = query.Where(t => !t.IsArchived);
        }

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            query = query.Where(t => t.Tags.Any(tg => tg.Value.Equals(tag, StringComparison.OrdinalIgnoreCase)));
        }

        if (isOverdue.HasValue && isOverdue.Value)
        {
            var now = DateTime.UtcNow;
            query = query.Where(t => t.IsOverdue(now));
        }

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "duedate" => ascending
                ? query.OrderBy(t => t.DueDate ?? DateTime.MaxValue)
                : query.OrderByDescending(t => t.DueDate ?? DateTime.MinValue),
            "priority" => ascending
                ? query.OrderBy(t => t.Priority)
                : query.OrderByDescending(t => t.Priority),
            "updatedat" => ascending
                ? query.OrderBy(t => t.UpdatedAt)
                : query.OrderByDescending(t => t.UpdatedAt),
            _ => ascending
                ? query.OrderBy(t => t.CreatedAt)
                : query.OrderByDescending(t => t.CreatedAt)
        };

        var totalCount = query.Count();
        var items = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<TodoItem>> GetCompletedBeforeDateAsync(
        Guid orgId,
        DateTime cutoffDate,
        CancellationToken cancellationToken = default)
    {
        var todos = await LoadAllAsync(cancellationToken);
        return todos
            .Where(t => t.OrgId == orgId
                && t.Status == TodoStatus.Done
                && !t.IsDeleted
                && !t.IsArchived
                && t.UpdatedAt < cutoffDate)
            .ToList();
    }

    public async Task BulkArchiveAsync(IEnumerable<Guid> todoIds, DateTime now, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var todos = await LoadAllAsync(cancellationToken);
            var todosList = todos.ToList();

            foreach (var id in todoIds)
            {
                var todo = todosList.FirstOrDefault(t => t.Id == id);
                if (todo != null)
                {
                    todo.Archive(now);
                }
            }

            await SaveAllAsync(todosList, cancellationToken);
        }, cancellationToken);
    }

    private async Task<IReadOnlyList<TodoItem>> LoadAllAsync(CancellationToken cancellationToken)
    {
        if (!System.IO.File.Exists(_filePath))
        {
            return new List<TodoItem>();
        }

        if (await _migrationRunner.NeedsMigrationAsync(_filePath))
        {
            await _migrationRunner.MigrateAsync(_filePath, cancellationToken);
        }

        var json = await System.IO.File.ReadAllTextAsync(_filePath, cancellationToken);
        
        using var document = JsonDocument.Parse(json);
        var todosElement = document.RootElement.GetProperty("todos");
        
        var todos = JsonSerializer.Deserialize<List<TodoItem>>(todosElement.GetRawText());
        return todos ?? new List<TodoItem>();
    }

    private async Task SaveAllAsync(List<TodoItem> todos, CancellationToken cancellationToken)
    {
        var data = new
        {
            schemaVersion = SchemaVersion.Current,
            todos = todos
        };

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await AtomicFileWriter.WriteAsync(_filePath, json, cancellationToken);
    }
}