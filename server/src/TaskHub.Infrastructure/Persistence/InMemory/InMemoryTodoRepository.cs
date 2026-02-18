using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemoryTodoRepository : ITodoRepository
{
    private readonly InMemoryDatabase _database;

    public InMemoryTodoRepository(InMemoryDatabase database)
    {
        _database = database;
    }

    public Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Todos.TryGetValue(id, out var todo);
        return Task.FromResult(todo);
    }

    public Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<TodoItem>>(_database.Todos.Values.ToList());
    }

    public Task AddAsync(TodoItem entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Todos.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Todo with id {entity.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(TodoItem entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Todos.ContainsKey(entity.Id))
        {
            throw new NotFoundException("Todo", entity.Id);
        }

        _database.Todos[entity.Id] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Todos.TryRemove(id, out _);
        return Task.CompletedTask;
    }

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

        if (!includeArchived)
        {
            todos = todos.Where(t => !t.IsArchived);
        }

        return Task.FromResult<IReadOnlyList<TodoItem>>(todos.ToList());
    }

    public Task<(IReadOnlyList<TodoItem> Items, int TotalCount)> GetPagedAsync(
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
        var query = _database.Todos.Values
            .Where(t => t.OrgId == orgId);

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

        return Task.FromResult<(IReadOnlyList<TodoItem>, int)>((items, totalCount));
    }

    public Task<IReadOnlyList<TodoItem>> GetCompletedBeforeDateAsync(
        Guid orgId,
        DateTime cutoffDate,
        CancellationToken cancellationToken = default)
    {
        var todos = _database.Todos.Values
            .Where(t => t.OrgId == orgId
                && t.Status == TodoStatus.Done
                && !t.IsDeleted
                && !t.IsArchived
                && t.UpdatedAt < cutoffDate)
            .ToList();

        return Task.FromResult<IReadOnlyList<TodoItem>>(todos);
    }

    public Task BulkArchiveAsync(IEnumerable<Guid> todoIds, DateTime now, CancellationToken cancellationToken = default)
    {
        foreach (var id in todoIds)
        {
            if (_database.Todos.TryGetValue(id, out var todo))
            {
                todo.Archive(now);
            }
        }

        return Task.CompletedTask;
    }
}