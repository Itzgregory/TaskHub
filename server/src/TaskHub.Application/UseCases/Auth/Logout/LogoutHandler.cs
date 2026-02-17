using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Auth.Logout;

public class LogoutHandler
{
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IAuditLogger _auditLogger;

    public LogoutHandler(
        ICurrentUserContext currentUserContext,
        IAuditLogger auditLogger)
    {
        _currentUserContext = currentUserContext;
        _auditLogger = auditLogger;
    }

    public async Task HandleAsync(
        LogoutCommand command,
        CancellationToken cancellationToken = default)
    {
        // Log logout
        await _auditLogger.LogAsync(
            AuditAction.Logout,
            EntityType.User,
            _currentUserContext.UserId,
            null,
            null,
            cancellationToken);

        // Cookie clearing happens in the controller
    }
}