namespace TaskHub.Application.UseCases.Organisations.RemoveMember;

public record RemoveMemberCommand(
    Guid OrgId,
    Guid UserId
);