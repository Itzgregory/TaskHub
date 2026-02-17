using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Organisations.AddMember;

public class AddMemberHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public AddMemberHandler(
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<Result<AddMemberResponse>> HandleAsync(
        AddMemberCommand command,
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
                "Only organisation administrators can add members.");
        }

        // Find user to add
        var userToAdd = await _userRepository.GetByUsernameAsync(command.Username, cancellationToken);
        if (userToAdd == null)
        {
            return Result<AddMemberResponse>.Failure(
                "user_not_found",
                $"User '{command.Username}' does not exist.");
        }

        // Check if user is already a member
        var existingMembership = await _membershipRepository.GetByUserAndOrgAsync(
            userToAdd.Id,
            command.OrgId,
            cancellationToken);

        if (existingMembership != null)
        {
            return Result<AddMemberResponse>.Failure(
                "already_member",
                $"User '{command.Username}' is already a member of this organisation.");
        }

        // Create membership
        var membership = Membership.Create(
            userToAdd.Id,
            command.OrgId,
            command.Role,
            _dateTimeProvider.UtcNow);

        await _membershipRepository.AddAsync(membership, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.MemberAdded,
            EntityType.Membership,
            membership.Id,
            command.OrgId,
            $"Added user {command.Username} with role {command.Role}",
            cancellationToken);

        return Result<AddMemberResponse>.Success(new AddMemberResponse(
            membership.Id,
            userToAdd.Id,
            userToAdd.Username,
            command.OrgId,
            membership.Role));
    }
}