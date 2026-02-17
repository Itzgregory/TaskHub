namespace TaskHub.Domain.Common;

public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; protected set; }
    public DateTime UpdatedAt { get; protected set; }

    public void SetCreated(DateTime now)
    {
        CreatedAt = now;
        UpdatedAt = now;
    }

    public void SetUpdated(DateTime now)
    {
        UpdatedAt = now;
    }
}