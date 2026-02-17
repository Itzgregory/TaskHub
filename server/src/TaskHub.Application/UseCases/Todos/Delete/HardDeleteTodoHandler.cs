using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Todos.Delete;

public class HardDeleteTodoHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IAuditLogger _auditLogger;

    public HardDeleteTodoHandler(
        ITodoRepository todoRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IAuditLogger auditLogger)
    {
        _todoRepository = todoRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _auditLogger = auditLogger;
    }

    public async Task<Result<Unit>> HandleAsync(
        HardDeleteTodoCommand command,
        CancellationToken cancellationToken = default)
    {
        // Get todo
        var todo = await _todoRepository.GetByIdAsync(command.Id, cancellationToken);
        if (todo == null || todo.OrgId != command.OrgId)
        {
            throw new NotFoundException("Todo", command.Id);
        }

        // Check user is OrgAdmin
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            command.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        if (membership.Role != UserRole.OrgAdmin)
        {
            throw new ForbiddenException(
                "Only organisation administrators can permanently delete todos.");
        }

        // Hard delete (no version check - this is destructive and requires admin role)
        await _todoRepository.DeleteAsync(todo.Id, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.TodoHardDeleted,
            EntityType.Todo,
            todo.Id,
            command.OrgId,
            null,
            cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}