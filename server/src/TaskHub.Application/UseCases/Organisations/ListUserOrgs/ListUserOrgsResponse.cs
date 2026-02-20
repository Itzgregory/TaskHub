using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Organisations.ListUserOrgs;

public record ListUserOrgsResponse(
    List<OrgMembershipDto> Organisations
);

public record OrgMembershipDto(
    Guid OrgId,
    string OrgName,
    UserRole Role,
    DateTime JoinedAt
);
