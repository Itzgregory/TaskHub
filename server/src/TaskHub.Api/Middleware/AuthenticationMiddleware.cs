using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;

namespace TaskHub.Api.Middleware;

public class AuthenticationMiddleware
{
    private readonly RequestDelegate _next;

    public AuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ISessionRepository sessionRepository,
        IDateTimeProvider dateTimeProvider)
    {
        // Read session token from cookie
        var token = context.Request.Cookies["session_token"];

        if (!string.IsNullOrEmpty(token))
        {
            var session = await sessionRepository.GetByTokenAsync(token);

            if (session != null && !session.IsExpired(dateTimeProvider.UtcNow))
            {
                // Store session data in HttpContext.Items for ICurrentUserContext
                context.Items["UserId"] = session.UserId;
                context.Items["ActiveOrgId"] = session.ActiveOrgId ?? Guid.Empty;
                context.Items["IsAuthenticated"] = true;
            }
        }

        await _next(context);
    }
}
