using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Organisations.ListMembers;

public class ListMembersHandler
{
    private readonly IMembershipRepository _membershipRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserContext _currentUserContext;

    public ListMembersHandler(
        IMembershipRepository membershipRepository,
        IUserRepository userRepository,
        ICurrentUserContext currentUserContext)
    {
        _membershipRepository = membershipRepository;
        _userRepository = userRepository;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<ListMembersResponse>> HandleAsync(
        ListMembersQuery query,
        CancellationToken cancellationToken = default)
    {
        if (!_currentUserContext.IsAuthenticated)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        // Ensure current user is a member of the organisation
        var currentMembership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            query.OrgId,
            cancellationToken);

        if (currentMembership is null)
        {
            throw new ForbiddenException("You do not have access to this organisation.");
        }

        // Load all memberships for the organisation
        var memberships = await _membershipRepository.GetByOrganisationIdAsync(
            query.OrgId,
            cancellationToken);

        var members = new List<OrgMemberDto>(memberships.Count);

        foreach (var membership in memberships)
        {
            var user = await _userRepository.GetByIdAsync(
                membership.UserId,
                cancellationToken);

            if (user is null)
            {
                // Skip orphaned memberships gracefully
                continue;
            }

            members.Add(new OrgMemberDto(
                membership.UserId,
                user.Username,
                membership.Role,
                membership.JoinedAt));
        }

        // Sort members: OrgAdmins first, then by username
        members = members
            .OrderByDescending(m => m.Role == UserRole.OrgAdmin)
            .ThenBy(m => m.Username, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Result<ListMembersResponse>.Success(
            new ListMembersResponse(members));
    }
}

