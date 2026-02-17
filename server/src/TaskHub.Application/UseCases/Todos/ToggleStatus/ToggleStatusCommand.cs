namespace TaskHub.Application.UseCases.Todos.ToggleStatus;

public record ToggleStatusCommand(
    Guid Id,
    Guid OrgId,
    int ExpectedVersion
);