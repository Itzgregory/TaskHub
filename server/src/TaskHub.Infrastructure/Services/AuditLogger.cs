using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Infrastructure.Services;

public class AuditLogger : IAuditLogger
{
    private readonly IAuditRepository _auditRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly ICorrelationContext _correlationContext;

    public AuditLogger(
        IAuditRepository auditRepository,
        ICurrentUserContext currentUserContext,
        ICorrelationContext correlationContext)
    {
        _auditRepository = auditRepository;
        _currentUserContext = currentUserContext;
        _correlationContext = correlationContext;
    }

    public async Task LogAsync(
        AuditAction action,
        EntityType entityType,
        Guid entityId,
        Guid? orgId = null,
        string? additionalInfo = null,
        CancellationToken cancellationToken = default)
    {
        var entry = AuditEntry.Create(
            _currentUserContext.UserId,
            orgId ?? _currentUserContext.ActiveOrgId,
            action,
            entityType,
            entityId,
            _correlationContext.CorrelationId,
            additionalInfo);

        await _auditRepository.AddAsync(entry, cancellationToken);
    }
}