using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.Create;

public record CreateTodoResponse(
    Guid Id,
    Guid OrgId,
    string Title,
    string? Description,
    TodoStatus Status,
    Priority Priority,
    List<string> Tags,
    DateTime? DueDate,
    Guid? AssignedToUserId,
    DateTime? AssignedAt,
    int Version,
    DateTime CreatedAt,
    string ETag
);