using TaskHub.Domain.Entities;

namespace TaskHub.Application.Common.Interfaces.Persistence;

public interface ISessionRepository : IRepository<Session>
{
    Task<Session?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<Session?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task DeleteExpiredSessionsAsync(DateTime now, CancellationToken cancellationToken = default);
}
