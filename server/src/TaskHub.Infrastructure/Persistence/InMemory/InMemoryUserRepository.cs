using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemoryUserRepository : IUserRepository
{
    private readonly InMemoryDatabase _database;

    public InMemoryUserRepository(InMemoryDatabase database)
    {
        _database = database;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Users.TryGetValue(id, out var user);
        return Task.FromResult(user);
    }

    public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<User>>(_database.Users.Values.ToList());
    }

    public Task AddAsync(User entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Users.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"User with id {entity.Id} already exists.");
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(User entity, CancellationToken cancellationToken = default)
    {
        if (!_database.Users.ContainsKey(entity.Id))
        {
            throw new NotFoundException("User", entity.Id);
        }

        _database.Users[entity.Id] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _database.Users.TryRemove(id, out _);
        return Task.CompletedTask;
    }

    public Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var user = _database.Users.Values
            .FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(user);
    }

    public Task<bool> ExistsAsync(string username, CancellationToken cancellationToken = default)
    {
        var exists = _database.Users.Values
            .Any(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(exists);
    }
}