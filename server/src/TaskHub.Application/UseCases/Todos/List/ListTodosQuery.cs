using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Todos.List;

public record ListTodosQuery(
    Guid OrgId,
    int Page = 1,
    int PageSize = 20,
    TodoStatus? Status = null,
    Priority? Priority = null,
    string? Tag = null,
    bool? IsOverdue = null,
    string SortBy = "createdAt",
    bool Ascending = false,
    bool IncludeDeleted = false,
    bool IncludeArchived = false
);