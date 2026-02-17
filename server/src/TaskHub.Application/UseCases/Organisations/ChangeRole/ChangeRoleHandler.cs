using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Organisations.ChangeRole;

public class ChangeRoleHandler
{
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public ChangeRoleHandler(
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<Result<Unit>> HandleAsync(
        ChangeRoleCommand command,
        CancellationToken cancellationToken = default)
    {
        // Check org exists
        var org = await _organisationRepository.GetByIdAsync(command.OrgId, cancellationToken);
        if (org == null)
        {
            throw new NotFoundException("Organisation", command.OrgId);
        }

        // Check current user is OrgAdmin
        var currentUserMembership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            command.OrgId,
            cancellationToken);

        if (currentUserMembership == null || currentUserMembership.Role != UserRole.OrgAdmin)
        {
            throw new ForbiddenException(
                "Only organisation administrators can change member roles.");
        }

        // Get membership to change
        var membershipToChange = await _membershipRepository.GetByUserAndOrgAsync(
            command.UserId,
            command.OrgId,
            cancellationToken);

        if (membershipToChange == null)
        {
            throw new NotFoundException("Membership", Guid.Empty);
        }

        // Prevent demoting the last admin
        if (membershipToChange.Role == UserRole.OrgAdmin && command.NewRole == UserRole.Member)
        {
            var adminCount = await _membershipRepository.CountAdminsInOrgAsync(
                command.OrgId,
                cancellationToken);

            if (adminCount <= 1)
            {
                throw new BusinessRuleException(
                    "last_admin",
                    "Cannot demote the last administrator. Promote another member first.");
            }
        }

        var oldRole = membershipToChange.Role;

        // Change role
        membershipToChange.ChangeRole(command.NewRole, _dateTimeProvider.UtcNow);

        await _membershipRepository.UpdateAsync(membershipToChange, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.RoleChanged,
            EntityType.Membership,
            membershipToChange.Id,
            command.OrgId,
            $"Role changed from {oldRole} to {command.NewRole} for user {command.UserId}",
            cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}