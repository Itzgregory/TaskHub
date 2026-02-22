using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.List;

public record ListTodosResponse(
    PagedResult<TodoItemDto> Todos
);

public record TodoItemDto(
    Guid Id,
    string Title,
    string? Description,
    TodoStatus Status,
    Priority Priority,
    List<string> Tags,
    DateTime? DueDate,
    Guid? AssignedToUserId,
    DateTime? AssignedAt,
    bool IsDeleted,
    bool IsArchived,
    int Version,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string ETag
);