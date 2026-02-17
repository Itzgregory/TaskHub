using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Todos.List;

public class ListTodosHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;

    public ListTodosHandler(
        ITodoRepository todoRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext)
    {
        _todoRepository = todoRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<ListTodosResponse>> HandleAsync(
        ListTodosQuery query,
        CancellationToken cancellationToken = default)
    {
        // Validate pagination
        if (query.Page < 1)
            throw new ValidationException("page", "Page must be at least 1.");

        if (query.PageSize < 1 || query.PageSize > 100)
            throw new ValidationException("pageSize", "Page size must be between 1 and 100.");

        // Check user is member of org
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            query.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        // Get paginated todos
        var (items, totalCount) = await _todoRepository.GetPagedAsync(
            query.OrgId,
            query.Page,
            query.PageSize,
            query.Status,
            query.Priority,
            query.Tag,
            query.IsOverdue,
            query.SortBy,
            query.Ascending,
            query.IncludeDeleted,
            query.IncludeArchived,
            cancellationToken);

        // Map to DTOs
        var dtos = items.Select(todo => new TodoItemDto(
            todo.Id,
            todo.Title,
            todo.Description,
            todo.Status,
            todo.Priority,
            todo.Tags.Select(t => t.Value).ToList(),
            todo.DueDate,
            todo.IsDeleted,
            todo.IsArchived,
            todo.Version,
            todo.CreatedAt,
            todo.UpdatedAt,
            $"\"{todo.Version}\""
        )).ToList();

        var pagedResult = new PagedResult<TodoItemDto>(
            dtos,
            totalCount,
            query.Page,
            query.PageSize);

        return Result<ListTodosResponse>.Success(
            new ListTodosResponse(pagedResult));
    }
}