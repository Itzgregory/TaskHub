using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Audit.List;

public class ListAuditHandler
{
    private readonly IAuditRepository _auditRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;

    public ListAuditHandler(
        IAuditRepository auditRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext)
    {
        _auditRepository = auditRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<ListAuditResponse>> HandleAsync(
        ListAuditQuery query,
        CancellationToken cancellationToken = default)
    {
        // Validate pagination
        if (query.Page < 1)
            throw new ValidationException("page", "Page must be at least 1.");

        if (query.PageSize < 1 || query.PageSize > 100)
            throw new ValidationException("pageSize", "Page size must be between 1 and 100.");

        // Check user is OrgAdmin
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            query.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        if (membership.Role != UserRole.OrgAdmin)
        {
            throw new ForbiddenException(
                "Only organisation administrators can view audit logs.");
        }

        // Get paginated audit entries
        var (items, totalCount) = await _auditRepository.GetPagedByOrgAsync(
            query.OrgId,
            query.Page,
            query.PageSize,
            cancellationToken);

        // Map to DTOs
        var dtos = items.Select(entry => new AuditEntryDto(
            entry.Id,
            entry.Timestamp,
            entry.ActorUserId,
            entry.Action,
            entry.EntityType,
            entry.EntityId,
            entry.CorrelationId,
            entry.AdditionalInfo
        )).ToList();

        var pagedResult = new PagedResult<AuditEntryDto>(
            dtos,
            totalCount,
            query.Page,
            query.PageSize);

        return Result<ListAuditResponse>.Success(
            new ListAuditResponse(pagedResult));
    }
}