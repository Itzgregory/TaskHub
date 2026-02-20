using TaskHub.Domain.Common;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Domain.ValueObjects;

namespace TaskHub.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsLockedOut { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutExpiry { get; private set; }
    
    // Onboarding fields
    public string? FullName { get; private set; }
    public Email? Email { get; private set; }
    public string? AvatarUrl { get; private set; }
    public UsageType? UsageType { get; private set; }
    public string? Theme { get; private set; }
    public bool NotificationsEnabled { get; private set; }
    public bool OnboardingCompleted { get; private set; }

    public const int MaxFailedAttempts = 5;
    public const int LockoutMinutes = 15;

    private User() { } // For serialization

    private User(string email, string passwordHash, DateTime createdAt)
    {
        Id = Guid.NewGuid();
        Username = email; // Placeholder until onboarding; used for display
        Email = new Email(email);
        PasswordHash = passwordHash;
        IsLockedOut = false;
        FailedLoginAttempts = 0;
        NotificationsEnabled = true; // Default
        OnboardingCompleted = false;
        SetCreated(createdAt);
    }

    public static User Create(string email, string passwordHash, DateTime createdAt)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ValidationException("email", "Email is required.");

        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash cannot be empty.", nameof(passwordHash));

        var normalizedEmail = email.ToLowerInvariant().Trim();
        return new User(normalizedEmail, passwordHash, createdAt);
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
        return LockoutExpiry.HasValue && now >= LockoutExpiry.Value;
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
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            throw new ArgumentException("Password hash cannot be empty.", nameof(newPasswordHash));

        PasswordHash = newPasswordHash;
        SetUpdated(now);
    }

    public void CompleteOnboarding(
        string fullName,
        string username,
        string? avatarUrl,
        UsageType usageType,
        string theme,
        bool notificationsEnabled,
        DateTime now)
    {
        if (OnboardingCompleted)
            throw new BusinessRuleException("onboarding.already_completed", "Onboarding has already been completed.");

        if (string.IsNullOrWhiteSpace(fullName))
            throw new ValidationException("fullName", "Full name is required.");

        if (fullName.Length < 2 || fullName.Length > 100)
            throw new ValidationException("fullName", "Full name must be between 2 and 100 characters.");

        if (string.IsNullOrWhiteSpace(username))
            throw new ValidationException("username", "Username is required.");

        if (username.Length < 3 || username.Length > 50)
            throw new ValidationException("username", "Username must be between 3 and 50 characters.");

        if (theme != "light" && theme != "dark")
            throw new ValidationException("theme", "Theme must be 'light' or 'dark'.");

        FullName = fullName.Trim();
        Username = username.ToLowerInvariant().Trim();
        AvatarUrl = avatarUrl;
        UsageType = usageType;
        Theme = theme;
        NotificationsEnabled = notificationsEnabled;
        OnboardingCompleted = true;

        SetUpdated(now);
    }

    public void UpdateProfile(
        string? fullName,
        Email? email,
        string? avatarUrl,
        DateTime now)
    {
        if (!string.IsNullOrWhiteSpace(fullName))
        {
            if (fullName.Length < 2 || fullName.Length > 100)
                throw new ValidationException("fullName", "Full name must be between 2 and 100 characters.");

            FullName = fullName.Trim();
        }

        if (email != null)
        {
            Email = email;
        }

        AvatarUrl = avatarUrl;
        SetUpdated(now);
    }

    public void UpdatePreferences(
        string? theme,
        bool? notificationsEnabled,
        DateTime now)
    {
        if (theme != null)
        {
            if (theme != "light" && theme != "dark")
                throw new ValidationException("theme", "Theme must be 'light' or 'dark'.");

            Theme = theme;
        }

        if (notificationsEnabled.HasValue)
        {
            NotificationsEnabled = notificationsEnabled.Value;
        }

        SetUpdated(now);
    }
}