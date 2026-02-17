namespace TaskHub.Application.UseCases.Todos.Delete;

public record HardDeleteTodoCommand(
    Guid Id,
    Guid OrgId
);