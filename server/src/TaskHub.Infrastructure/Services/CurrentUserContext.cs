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
            var userId = _httpContextAccessor.HttpContext?.Items["UserId"] as Guid?;
            return userId ?? Guid.Empty;
        }
    }

    public Guid ActiveOrgId
    {
        get
        {
            var orgId = _httpContextAccessor.HttpContext?.Items["ActiveOrgId"] as Guid?;
            return orgId ?? Guid.Empty;
        }
    }

    public UserRole Role
    {
        get
        {
            // Role is determined by membership in active org
            // This would require a repository call, so for now return Member
            // The handlers check membership explicitly
            return UserRole.Member;
        }
    }

    public bool IsAuthenticated
    {
        get
        {
            var isAuth = _httpContextAccessor.HttpContext?.Items["IsAuthenticated"] as bool?;
            return isAuth ?? false;
        }
    }

    public bool IsOrgAdmin => Role == UserRole.OrgAdmin;
}
