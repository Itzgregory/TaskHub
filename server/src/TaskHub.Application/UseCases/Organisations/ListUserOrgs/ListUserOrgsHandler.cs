using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;

namespace TaskHub.Application.UseCases.Organisations.ListUserOrgs;

public class ListUserOrgsHandler
{
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;

    public ListUserOrgsHandler(
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext)
    {
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<ListUserOrgsResponse>> HandleAsync(
        ListUserOrgsQuery query,
        CancellationToken cancellationToken = default)
    {
        // Get user's memberships
        var memberships = await _membershipRepository.GetByUserIdAsync(
            _currentUserContext.UserId,
            cancellationToken);

        // Get organisations
        var orgs = await _organisationRepository.GetByUserIdAsync(
            _currentUserContext.UserId,
            cancellationToken);

        // Join and map
        var result = orgs
            .Join(memberships,
                org => org.Id,
                membership => membership.OrganisationId,
                (org, membership) => new OrgMembershipDto(
                    org.Id,
                    org.Name,
                    membership.Role,
                    membership.JoinedAt))
            .OrderByDescending(o => o.JoinedAt)
            .ToList();

        return Result<ListUserOrgsResponse>.Success(new ListUserOrgsResponse(result));
    }
}
