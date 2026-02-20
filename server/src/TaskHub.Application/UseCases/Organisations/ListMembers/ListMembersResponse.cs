using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Organisations.ListMembers;

public record OrgMemberDto(
    Guid UserId,
    string Username,
    UserRole Role,
    DateTime JoinedAt
);

public record ListMembersResponse(
    List<OrgMemberDto> Members
);

