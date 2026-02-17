using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Audit.List;

public record ListAuditResponse(
    PagedResult<AuditEntryDto> Entries
);

public record AuditEntryDto(
    Guid Id,
    DateTime Timestamp,
    Guid ActorUserId,
    AuditAction Action,
    EntityType EntityType,
    Guid EntityId,
    string CorrelationId,
    string? AdditionalInfo
);