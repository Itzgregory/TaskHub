using TaskHub.Domain.Common;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Domain.Entities;

public class Organisation : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public Guid OwnerId { get; private set; }

    private const int MaxNameLength = 100;
    private const int MinNameLength = 2;

    // Required by file storage deserialisation
    private Organisation() { }

    public static Organisation Create(string name, Guid ownerId, DateTime now)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ValidationException("name", "Organisation name cannot be empty.");

        if (name.Length < MinNameLength)
            throw new ValidationException("name", 
                $"Organisation name must be at least {MinNameLength} characters.");

        if (name.Length > MaxNameLength)
            throw new ValidationException("name", 
                $"Organisation name cannot exceed {MaxNameLength} characters.");

        var org = new Organisation
        {
            Name = name.Trim(),
            OwnerId = ownerId
        };

        org.SetCreated(now);
        return org;
    }

    public void Rename(string newName, DateTime now)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ValidationException("name", "Organisation name cannot be empty.");

        if (newName.Length < MinNameLength)
            throw new ValidationException("name", 
                $"Organisation name must be at least {MinNameLength} characters.");

        if (newName.Length > MaxNameLength)
            throw new ValidationException("name", 
                $"Organisation name cannot exceed {MaxNameLength} characters.");

        Name = newName.Trim();
        SetUpdated(now);
    }
}