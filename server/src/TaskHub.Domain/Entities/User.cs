using TaskHub.Domain.Common;
using TaskHub.Domain.Enums;

namespace TaskHub.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsLockedOut { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutExpiry { get; private set; }

    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    // Required by file storage deserialisation
    private User() { }

    public static User Create(string username, string passwordHash, DateTime now)
    {
        var user = new User
        {
            Username = username.ToLowerInvariant(),
            PasswordHash = passwordHash
        };

        user.SetCreated(now);
        return user;
    }

    public void RecordFailedLogin(DateTime now)
    {
        FailedLoginAttempts++;

        if (FailedLoginAttempts >= MaxFailedAttempts)
        {
            IsLockedOut = true;
            LockoutExpiry = now.AddMinutes(LockoutMinutes);
        }

        SetUpdated(now);
    }

    public void ResetLoginAttempts(DateTime now)
    {
        FailedLoginAttempts = 0;
        IsLockedOut = false;
        LockoutExpiry = null;
        SetUpdated(now);
    }

    public bool IsLockoutExpired(DateTime now)
    {
        return IsLockedOut && LockoutExpiry.HasValue && now > LockoutExpiry.Value;
    }

    public void UnlockAccount(DateTime now)
    {
        IsLockedOut = false;
        LockoutExpiry = null;
        FailedLoginAttempts = 0;
        SetUpdated(now);
    }

    public void UpdatePassword(string newPasswordHash, DateTime now)
    {
        PasswordHash = newPasswordHash;
        SetUpdated(now);
    }
}