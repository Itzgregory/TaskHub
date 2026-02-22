using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Domain.ValueObjects;

namespace TaskHub.Application.UseCases.Todos.Update;

public class UpdateTodoHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public UpdateTodoHandler(
        ITodoRepository todoRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _todoRepository = todoRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<Result<UpdateTodoResponse>> HandleAsync(
        UpdateTodoCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        UpdateTodoValidator.Validate(command);

        // Get todo
        var todo = await _todoRepository.GetByIdAsync(command.Id, cancellationToken);
        if (todo == null || todo.OrgId != command.OrgId)
        {
            throw new NotFoundException("Todo", command.Id);
        }

        // Check user is member of org
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            command.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        // Check version for concurrency
        if (todo.Version != command.ExpectedVersion)
        {
            throw new ConcurrencyConflictException("Todo", todo.Id);
        }

        // Parse tags
        var tags = new List<Tag>();
        if (command.Tags != null && command.Tags.Any())
        {
            foreach (var tagValue in command.Tags)
            {
                tags.Add(new Tag(tagValue));
            }
        }

        // Update todo
        todo.Update(
            command.Title,
            command.Description,
            command.Priority,
            tags,
            command.DueDate,
            _dateTimeProvider.UtcNow,
            command.AssignedToUserId);

        // Save
        await _todoRepository.UpdateAsync(todo, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.TodoUpdated,
            EntityType.Todo,
            todo.Id,
            command.OrgId,
            null,
            cancellationToken);

        // Generate ETag
        var etag = $"\"{todo.Version}\"";

        // Return response
        return Result<UpdateTodoResponse>.Success(new UpdateTodoResponse(
            todo.Id,
            todo.Title,
            todo.Description,
            todo.Status,
            todo.Priority,
            todo.Tags.Select(t => t.Value).ToList(),
            todo.DueDate,
            todo.AssignedToUserId,
            todo.AssignedAt,
            todo.Version,
            todo.UpdatedAt,
            etag));
    }
}