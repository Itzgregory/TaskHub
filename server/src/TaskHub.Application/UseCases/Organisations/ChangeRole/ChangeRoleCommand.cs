using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Organisations.ChangeRole;

public record ChangeRoleCommand(
    Guid OrgId,
    Guid UserId,
    UserRole NewRole
);