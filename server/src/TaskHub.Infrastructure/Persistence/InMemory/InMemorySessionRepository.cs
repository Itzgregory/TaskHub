using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemorySessionRepository : ISessionRepository
{
    private readonly InMemoryDatabase _database;

    public InMemorySessionRepository(InMemoryDatabase database)
    {
        _database = database;
    }

    public Task<Session?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Sessions.TryGetValue(id, out var session);
        return Task.FromResult(session);
    }

    public Task<IReadOnlyList<Session>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<Session>>(_database.Sessions.Values.ToList());
    }

    public Task AddAsync(Session entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Sessions.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Session with id {entity.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(Session entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Sessions.ContainsKey(entity.Id))
        {
            throw new NotFoundException("Session", entity.Id);
        }

        _database.Sessions[entity.Id] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Sessions.TryRemove(id, out _);
        return Task.CompletedTask;
    }

    public Task<Session?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var session = _database.Sessions.Values
            .FirstOrDefault(s => s.SessionToken == token);

        return Task.FromResult(session);
    }

    public Task<Session?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var session = _database.Sessions.Values
            .FirstOrDefault(s => s.UserId == userId);

        return Task.FromResult(session);
    }

    public Task DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var sessionsToRemove = _database.Sessions.Values
            .Where(s => s.UserId == userId)
            .Select(s => s.Id)
            .ToList();

        foreach (var id in sessionsToRemove)
        {
            _database.Sessions.TryRemove(id, out _);
        }

        return Task.CompletedTask;
    }

    public Task DeleteExpiredSessionsAsync(DateTime now, CancellationToken cancellationToken = default)
    {
        var expiredIds = _database.Sessions.Values
            .Where(s => s.IsExpired(now))
            .Select(s => s.Id)
            .ToList();

        foreach (var id in expiredIds)
        {
            _database.Sessions.TryRemove(id, out _);
        }

        return Task.CompletedTask;
    }
}
