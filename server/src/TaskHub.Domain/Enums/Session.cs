using TaskHub.Domain.Common;

namespace TaskHub.Domain.Entities;

public class Session : BaseEntity
{
    public Guid UserId { get; private set; }
    public string SessionToken { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public Guid? ActiveOrgId { get; private set; }

    private Session() { } // For serialization

    private Session(
        Guid userId,
        string sessionToken,
        DateTime createdAt,
        DateTime expiresAt)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        SessionToken = sessionToken;
        CreatedAt = createdAt;
        ExpiresAt = expiresAt;
    }

    public static Session Create(Guid userId, DateTime createdAt, int expiryHours = 24)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId cannot be empty.", nameof(userId));

        if (expiryHours < 1 || expiryHours > 720) // Max 30 days
            throw new ArgumentException("Expiry hours must be between 1 and 720.", nameof(expiryHours));

        var sessionToken = Guid.NewGuid().ToString();
        var expiresAt = createdAt.AddHours(expiryHours);

        return new Session(userId, sessionToken, createdAt, expiresAt);
    }

    public bool IsExpired(DateTime now) => now >= ExpiresAt;

    public void SetActiveOrg(Guid orgId)
    {
        if (orgId == Guid.Empty)
            throw new ArgumentException("OrgId cannot be empty.", nameof(orgId));

        ActiveOrgId = orgId;
    }

    public void ClearActiveOrg()
    {
        ActiveOrgId = null;
    }
}
