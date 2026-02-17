using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Todos.Archive;

public class ArchiveTodosHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public ArchiveTodosHandler(
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

    public async Task<Result<ArchiveTodosResponse>> HandleAsync(
        ArchiveTodosCommand command,
        CancellationToken cancellationToken = default)
    {
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
                "Only organisation administrators can archive todos.");
        }

        // Calculate cutoff date
        var cutoffDate = _dateTimeProvider.UtcNow.AddDays(-command.ArchiveAfterDays);

        // Get completed todos older than cutoff
        var todosToArchive = await _todoRepository.GetCompletedBeforeDateAsync(
            command.OrgId,
            cutoffDate,
            cancellationToken);

        if (!todosToArchive.Any())
        {
            return Result<ArchiveTodosResponse>.Success(
                new ArchiveTodosResponse(0, new List<Guid>()));
        }

        // Archive them
        var todoIds = todosToArchive.Select(t => t.Id).ToList();
        await _todoRepository.BulkArchiveAsync(todoIds, _dateTimeProvider.UtcNow, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.TodoArchived,
            EntityType.Todo,
            Guid.Empty,
            command.OrgId,
            $"Archived {todoIds.Count} todos completed before {cutoffDate:yyyy-MM-dd}",
            cancellationToken);

        return Result<ArchiveTodosResponse>.Success(
            new ArchiveTodosResponse(todoIds.Count, todoIds));
    }
}