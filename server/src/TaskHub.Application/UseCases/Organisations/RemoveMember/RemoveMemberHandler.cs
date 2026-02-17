using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Organisations.RemoveMember;

public class RemoveMemberHandler
{
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IAuditLogger _auditLogger;

    public RemoveMemberHandler(
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IAuditLogger auditLogger)
    {
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _auditLogger = auditLogger;
    }

    public async Task<Result<Unit>> HandleAsync(
        RemoveMemberCommand command,
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
                "Only organisation administrators can remove members.");
        }

        // Get membership to remove
        var membershipToRemove = await _membershipRepository.GetByUserAndOrgAsync(
            command.UserId,
            command.OrgId,
            cancellationToken);

        if (membershipToRemove == null)
        {
            throw new NotFoundException("Membership", Guid.Empty);
        }

        // Prevent removing the last admin
        if (membershipToRemove.Role == UserRole.OrgAdmin)
        {
            var adminCount = await _membershipRepository.CountAdminsInOrgAsync(
                command.OrgId,
                cancellationToken);

            if (adminCount <= 1)
            {
                throw new BusinessRuleException(
                    "last_admin",
                    "Cannot remove the last administrator from the organisation.");
            }
        }

        // Remove membership
        await _membershipRepository.DeleteAsync(membershipToRemove.Id, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.MemberRemoved,
            EntityType.Membership,
            membershipToRemove.Id,
            command.OrgId,
            $"Removed user {command.UserId}",
            cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}