using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.ToggleStatus;

public record ToggleStatusResponse(
    Guid Id,
    TodoStatus Status,
    int Version,
    string ETag
);