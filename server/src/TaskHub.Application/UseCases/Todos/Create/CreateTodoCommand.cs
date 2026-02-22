using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.Create;

public record CreateTodoCommand(
    Guid OrgId,
    string Title,
    string? Description,
    Priority Priority,
    List<string>? Tags,
    DateTime? DueDate,
    Guid? AssignedToUserId = null
);