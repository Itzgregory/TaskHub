using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Domain.ValueObjects;

namespace TaskHub.Application.UseCases.Todos.Create;

public class CreateTodoHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public CreateTodoHandler(
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

    public async Task<Result<CreateTodoResponse>> HandleAsync(
        CreateTodoCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        CreateTodoValidator.Validate(command);

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

        // Parse tags
        var tags = new List<Tag>();
        if (command.Tags != null && command.Tags.Any())
        {
            foreach (var tagValue in command.Tags)
            {
                tags.Add(new Tag(tagValue));
            }
        }

        // Create todo
        var todo = TodoItem.Create(
            command.OrgId,
            _currentUserContext.UserId,
            command.Title,
            command.Description,
            command.Priority,
            tags,
            command.DueDate,
            _dateTimeProvider.UtcNow);

        // Save todo
        await _todoRepository.AddAsync(todo, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.TodoCreated,
            EntityType.Todo,
            todo.Id,
            command.OrgId,
            null,
            cancellationToken);

        // Generate ETag
        var etag = $"\"{todo.Version}\"";

        // Return response
        return Result<CreateTodoResponse>.Success(new CreateTodoResponse(
            todo.Id,
            todo.OrgId,
            todo.Title,
            todo.Description,
            todo.Status,
            todo.Priority,
            todo.Tags.Select(t => t.Value).ToList(),
            todo.DueDate,
            todo.Version,
            todo.CreatedAt,
            etag));
    }
}