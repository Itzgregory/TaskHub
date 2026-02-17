namespace TaskHub.Application.UseCases.Todos.Restore;

public record RestoreTodoCommand(
    Guid Id,
    Guid OrgId,
    int ExpectedVersion
);