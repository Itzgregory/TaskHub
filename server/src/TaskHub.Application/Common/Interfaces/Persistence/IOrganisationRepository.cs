using TaskHub.Domain.Entities;

namespace TaskHub.Application.Common.Interfaces.Persistence;

public interface IOrganisationRepository : IRepository<Organisation>
{
    Task<IReadOnlyList<Organisation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}