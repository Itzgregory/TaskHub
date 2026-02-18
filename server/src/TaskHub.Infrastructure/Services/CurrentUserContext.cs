using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Domain.Enums;

namespace TaskHub.Infrastructure.Services;

public class CurrentUserContext : ICurrentUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }

    public Guid ActiveOrgId
    {
        get
        {
            var orgIdClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst("ActiveOrgId")?.Value;

            return Guid.TryParse(orgIdClaim, out var orgId) ? orgId : Guid.Empty;
        }
    }

    public UserRole Role
    {
        get
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.Role)?.Value;

            return Enum.TryParse<UserRole>(roleClaim, out var role) ? role : UserRole.Member;
        }
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    public bool IsOrgAdmin => Role == UserRole.OrgAdmin;
}