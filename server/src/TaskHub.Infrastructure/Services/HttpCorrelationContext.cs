using Microsoft.AspNetCore.Http;
using TaskHub.Application.Common.Interfaces.Services;

namespace TaskHub.Infrastructure.Services;

public class HttpCorrelationContext : ICorrelationContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpCorrelationContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string CorrelationId =>
        _httpContextAccessor.HttpContext?.Items["CorrelationId"]?.ToString()
        ?? Guid.NewGuid().ToString();
}