using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;

namespace TaskHub.Application.UseCases.Auth.Logout;

public class LogoutHandler
{
    private readonly ISessionRepository _sessionRepository;
    private readonly ICurrentUserContext _currentUserContext;

    public LogoutHandler(
        ISessionRepository sessionRepository,
        ICurrentUserContext currentUserContext)
    {
        _sessionRepository = sessionRepository;
        _currentUserContext = currentUserContext;
    }

    public async Task HandleAsync(
        LogoutCommand command,
        CancellationToken cancellationToken = default)
    {
        // Delete user's session if authenticated
        if (_currentUserContext.IsAuthenticated)
        {
            await _sessionRepository.DeleteByUserIdAsync(
                _currentUserContext.UserId,
                cancellationToken);
        }

        // Cookie clearing happens in the controller
    }
}
