using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.Update;

public record UpdateTodoCommand(
    Guid Id,
    Guid OrgId,
    string Title,
    string? Description,
    Priority Priority,
    List<string>? Tags,
    DateTime? DueDate,
    int ExpectedVersion
);