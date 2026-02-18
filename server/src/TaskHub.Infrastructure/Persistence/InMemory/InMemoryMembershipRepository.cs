using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemoryMembershipRepository : IMembershipRepository
{
    private readonly InMemoryDatabase _database;

    public InMemoryMembershipRepository(InMemoryDatabase database)
    {
        _database = database;
    }

    public Task<Membership?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Memberships.TryGetValue(id, out var membership);
        return Task.FromResult(membership);
    }

    public Task<IReadOnlyList<Membership>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<Membership>>(_database.Memberships.Values.ToList());
    }

    public Task AddAsync(Membership entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Memberships.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Membership with id {entity.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(Membership entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Memberships.ContainsKey(entity.Id))
        {
            throw new NotFoundException("Membership", entity.Id);
        }

        _database.Memberships[entity.Id] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Memberships.TryRemove(id, out _);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<Membership>> GetByOrganisationIdAsync(Guid organisationId, CancellationToken cancellationToken = default)
    {
        var memberships = _database.Memberships.Values
            .Where(m => m.OrganisationId == organisationId)
            .ToList();

        return Task.FromResult<IReadOnlyList<Membership>>(memberships);
    }

    public Task<IReadOnlyList<Membership>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var memberships = _database.Memberships.Values
            .Where(m => m.UserId == userId)
            .ToList();

        return Task.FromResult<IReadOnlyList<Membership>>(memberships);
    }

    public Task<Membership?> GetByUserAndOrgAsync(Guid userId, Guid organisationId, CancellationToken cancellationToken = default)
    {
        var membership = _database.Memberships.Values
            .FirstOrDefault(m => m.UserId == userId && m.OrganisationId == organisationId);

        return Task.FromResult(membership);
    }

    public Task<int> CountAdminsInOrgAsync(Guid organisationId, CancellationToken cancellationToken = default)
    {
        var count = _database.Memberships.Values
            .Count(m => m.OrganisationId == organisationId && m.Role == UserRole.OrgAdmin);

        return Task.FromResult(count);
    }
}