using System.Text.RegularExpressions;

namespace TaskHub.Application.Common.Security;

public static class PasswordValidator
{
    private const int MinPasswordLength = 8;
    private const int MaxPasswordLength = 100;

    // Password strength regex
    private static readonly Regex PasswordStrengthRegex = new Regex(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]",
        RegexOptions.Compiled,
        TimeSpan.FromSeconds(1));

    /// <summary>
    /// Validates password strength and returns validation errors
    /// </summary>
    public static bool ValidatePassword(string password, Dictionary<string, string[]> errors, string fieldName = "password")
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            errors[fieldName] = new[] { "Password is required." };
            return false;
        }

        if (password.Length < MinPasswordLength)
        {
            errors[fieldName] = new[] { $"Password must be at least {MinPasswordLength} characters." };
            return false;
        }

        if (password.Length > MaxPasswordLength)
        {
            errors[fieldName] = new[] { $"Password cannot exceed {MaxPasswordLength} characters." };
            return false;
        }

        try
        {
            if (!PasswordStrengthRegex.IsMatch(password))
            {
                errors[fieldName] = new[] { 
                    "Password must contain at least one uppercase letter, " +
                    "one lowercase letter, one number, and one special character (@$!%*?&)."
                };
                return false;
            }
        }
        catch (RegexMatchTimeoutException)
        {
            errors[fieldName] = new[] { "Password validation timed out." };
            return false;
        }

        return true;
    }

    /// <summary>
    /// Simple password strength check (returns true/false without errors)
    /// </summary>
    public static bool IsStrongPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        try
        {
            return PasswordStrengthRegex.IsMatch(password);
        }
        catch (RegexMatchTimeoutException)
        {
            return false;
        }
    }
}