using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.Update;

public record UpdateTodoResponse(
    Guid Id,
    string Title,
    string? Description,
    TodoStatus Status,
    Priority Priority,
    List<string> Tags,
    DateTime? DueDate,
    Guid? AssignedToUserId,
    DateTime? AssignedAt,
    int Version,
    DateTime UpdatedAt,
    string ETag
);