using TaskHub.Domain.Enums;

namespace TaskHub.Application.Common.Interfaces.Services;

public interface ICurrentUserContext
{
    Guid UserId { get; }
    Guid ActiveOrgId { get; }
    UserRole Role { get; }
    bool IsAuthenticated { get; }
    bool IsOrgAdmin { get; }
}