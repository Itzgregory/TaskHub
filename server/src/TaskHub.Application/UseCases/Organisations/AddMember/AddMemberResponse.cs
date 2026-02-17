using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Organisations.AddMember;

public record AddMemberResponse(
    Guid MembershipId,
    Guid UserId,
    string Username,
    Guid OrgId,
    UserRole Role
);