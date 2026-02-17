using TaskHub.Domain.Enums;

namespace TaskHub.Application.Common.Interfaces.Services;

public interface IAuditLogger
{
    Task LogAsync(
        AuditAction action,
        EntityType entityType,
        Guid entityId,
        Guid? orgId = null,
        string? additionalInfo = null,
        CancellationToken cancellationToken = default);
}