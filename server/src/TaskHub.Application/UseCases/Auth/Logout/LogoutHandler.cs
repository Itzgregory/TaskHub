using TaskHub.Application.Common.Interfaces.Services;

namespace TaskHub.Application.UseCases.Auth.Logout;

public class LogoutHandler
{
    public LogoutHandler()
    {
        // i havent implemented this yet, since i am yet to do auth, and jwt cookies and all that which is beyond the requirements scope
    }

    public Task HandleAsync(
        LogoutCommand command,
        CancellationToken cancellationToken = default)
    {
        // Cookie clearing happens in the controller
        // Audit logging will be added once we have proper authentication
        return Task.CompletedTask;
    }
}