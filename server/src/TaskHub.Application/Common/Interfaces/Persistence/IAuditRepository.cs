using TaskHub.Domain.Entities;

namespace TaskHub.Application.Common.Interfaces.Persistence;

public interface IAuditRepository : IRepository<AuditEntry>
{
    Task<(IReadOnlyList<AuditEntry> Items, int TotalCount)> GetPagedByOrgAsync(
        Guid orgId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}