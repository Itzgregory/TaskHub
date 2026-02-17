using TaskHub.Domain.Entities;

namespace TaskHub.Application.Common.Interfaces.Persistence;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string username, CancellationToken cancellationToken = default);
}