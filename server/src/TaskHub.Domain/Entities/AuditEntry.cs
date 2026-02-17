using TaskHub.Domain.Common;
using TaskHub.Domain.Enums;

namespace TaskHub.Domain.Entities;

public class AuditEntry : BaseEntity
{
    public DateTime Timestamp { get; private set; }
    public Guid ActorUserId { get; private set; }
    public Guid OrgId { get; private set; }
    public AuditAction Action { get; private set; }
    public EntityType EntityType { get; private set; }
    public Guid EntityId { get; private set; }
    public string CorrelationId { get; private set; } = string.Empty;
    public string? AdditionalInfo { get; private set; }

    // Required by file storage deserialisation
    private AuditEntry() { }

    public static AuditEntry Create(
        Guid actorUserId,
        Guid orgId,
        AuditAction action,
        EntityType entityType,
        Guid entityId,
        string correlationId,
        string? additionalInfo = null)
    {
        if (actorUserId == Guid.Empty)
            throw new ArgumentException("ActorUserId cannot be empty.", nameof(actorUserId));

        if (orgId == Guid.Empty)
            throw new ArgumentException("OrgId cannot be empty.", nameof(orgId));

        if (string.IsNullOrWhiteSpace(correlationId))
            throw new ArgumentException("CorrelationId cannot be empty.", nameof(correlationId));

        return new AuditEntry
        {
            Timestamp = DateTime.UtcNow,
            ActorUserId = actorUserId,
            OrgId = orgId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            CorrelationId = correlationId,
            AdditionalInfo = additionalInfo
        };
    }
}