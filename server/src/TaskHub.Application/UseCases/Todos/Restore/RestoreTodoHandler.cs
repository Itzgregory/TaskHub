using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Todos.Restore;

public class RestoreTodoHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public RestoreTodoHandler(
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

    public async Task<Result<Unit>> HandleAsync(
        RestoreTodoCommand command,
        CancellationToken cancellationToken = default)
    {
        // Get todo (must include deleted to find it)
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

        // Restore
        todo.Restore(_dateTimeProvider.UtcNow);

        // Save
        await _todoRepository.UpdateAsync(todo, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.TodoRestored,
            EntityType.Todo,
            todo.Id,
            command.OrgId,
            null,
            cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}