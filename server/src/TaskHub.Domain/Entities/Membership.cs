using TaskHub.Domain.Common;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Domain.Entities;

public class Membership : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid OrganisationId { get; private set; }
    public UserRole Role { get; private set; }
    public DateTime JoinedAt { get; private set; }

    // Required by file storage deserialisation
    private Membership() { }

    public static Membership Create(Guid userId, Guid organisationId, UserRole role, DateTime now)
    {
        if (userId == Guid.Empty)
            throw new ValidationException("userId", "UserId cannot be empty.");

        if (organisationId == Guid.Empty)
            throw new ValidationException("organisationId", "OrganisationId cannot be empty.");

        var membership = new Membership
        {
            UserId = userId,
            OrganisationId = organisationId,
            Role = role,
            JoinedAt = now
        };

        return membership;
    }

    public void ChangeRole(UserRole newRole, DateTime now)
    {
        if (Role == newRole)
            throw new ValidationException("role", $"User already has the role {newRole}.");

        Role = newRole;
    }
}