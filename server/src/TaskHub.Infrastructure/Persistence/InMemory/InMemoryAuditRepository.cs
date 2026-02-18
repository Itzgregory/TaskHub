using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemoryAuditRepository : IAuditRepository
{
    private readonly InMemoryDatabase _database;

    public InMemoryAuditRepository(InMemoryDatabase database)
    {
        _database = database;
    }

    public Task<AuditEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.AuditEntries.TryGetValue(id, out var entry);
        return Task.FromResult(entry);
    }

    public Task<IReadOnlyList<AuditEntry>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<AuditEntry>>(_database.AuditEntries.Values.ToList());
    }

    public Task AddAsync(AuditEntry entity, CancellationToken cancellationToken = default)
    {
        if (!_database.AuditEntries.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"AuditEntry with id {entity.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(AuditEntry entity, CancellationToken cancellationToken = default)
    {
        if (!_database.AuditEntries.ContainsKey(entity.Id))
        {
            throw new NotFoundException("AuditEntry", entity.Id);
        }

        _database.AuditEntries[entity.Id] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.AuditEntries.TryRemove(id, out _);
        return Task.CompletedTask;
    }

    public Task<(IReadOnlyList<AuditEntry> Items, int TotalCount)> GetPagedByOrgAsync(
        Guid orgId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _database.AuditEntries.Values
            .Where(e => e.OrgId == orgId)
            .OrderByDescending(e => e.Timestamp);

        var totalCount = query.Count();
        var items = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return Task.FromResult<(IReadOnlyList<AuditEntry>, int)>((items, totalCount));
    }
}