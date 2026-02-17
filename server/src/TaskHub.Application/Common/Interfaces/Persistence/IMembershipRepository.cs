using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.Common.Interfaces.Persistence;

public interface IMembershipRepository : IRepository<Membership>
{
    Task<IReadOnlyList<Membership>> GetByOrganisationIdAsync(Guid organisationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Membership>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Membership?> GetByUserAndOrgAsync(Guid userId, Guid organisationId, CancellationToken cancellationToken = default);
    Task<int> CountAdminsInOrgAsync(Guid organisationId, CancellationToken cancellationToken = default);
}