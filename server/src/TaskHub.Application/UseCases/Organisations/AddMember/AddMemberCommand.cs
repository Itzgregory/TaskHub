using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Organisations.AddMember;

public record AddMemberCommand(
    Guid OrgId,
    string Username,
    UserRole Role = UserRole.Member
);