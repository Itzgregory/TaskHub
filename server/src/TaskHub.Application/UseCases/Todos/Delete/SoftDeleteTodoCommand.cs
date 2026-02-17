namespace TaskHub.Application.UseCases.Todos.Delete;

public record SoftDeleteTodoCommand(
    Guid Id,
    Guid OrgId,
    int ExpectedVersion
);