using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemoryOrganisationRepository : IOrganisationRepository
{
    private readonly InMemoryDatabase _database;

    public InMemoryOrganisationRepository(InMemoryDatabase database)
    {
        _database = database;
    }

    public Task<Organisation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Organisations.TryGetValue(id, out var org);
        return Task.FromResult(org);
    }

    public Task<IReadOnlyList<Organisation>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<Organisation>>(_database.Organisations.Values.ToList());
    }

    public Task AddAsync(Organisation entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Organisations.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Organisation with id {entity.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(Organisation entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Organisations.ContainsKey(entity.Id))
        {
            throw new NotFoundException("Organisation", entity.Id);
        }

        _database.Organisations[entity.Id] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Organisations.TryRemove(id, out _);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<Organisation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var orgIds = _database.Memberships.Values
            .Where(m => m.UserId == userId)
            .Select(m => m.OrganisationId)
            .ToHashSet();

        var orgs = _database.Organisations.Values
            .Where(o => orgIds.Contains(o.Id))
            .ToList();

        return Task.FromResult<IReadOnlyList<Organisation>>(orgs);
    }
}