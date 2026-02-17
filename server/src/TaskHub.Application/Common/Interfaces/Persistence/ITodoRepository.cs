using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.Common.Interfaces.Persistence;

public interface ITodoRepository : IRepository<TodoItem>
{
    Task<IReadOnlyList<TodoItem>> GetByOrgIdAsync(
        Guid orgId,
        bool includeDeleted = false,
        bool includeArchived = false,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TodoItem> Items, int TotalCount)> GetPagedAsync(
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
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TodoItem>> GetCompletedBeforeDateAsync(
        Guid orgId,
        DateTime cutoffDate,
        CancellationToken cancellationToken = default);

    Task BulkArchiveAsync(IEnumerable<Guid> todoIds, DateTime now, CancellationToken cancellationToken = default);
}