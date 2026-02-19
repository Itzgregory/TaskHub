using System.Text.RegularExpressions;

namespace TaskHub.Application.Common.Security;

public static class EmailValidator
{
    private const int MinEmailLength = 3;
    private const int MaxEmailLength = 100;

    private static readonly Regex EmailRegex = new Regex(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase,
        TimeSpan.FromSeconds(1));

    public static string ValidateAndNormalizeEmail(string email, Dictionary<string, string[]> errors, string fieldName = "email")
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            errors[fieldName] = new[] { "Email is required." };
            return string.Empty;
        }

        var sanitizedEmail = SecuritySanitizer.SanitizeInput(email);

        if (sanitizedEmail.Length < MinEmailLength)
        {
            errors[fieldName] = new[] { $"Email must be at least {MinEmailLength} characters." };
            return string.Empty;
        }

        if (sanitizedEmail.Length > MaxEmailLength)
        {
            errors[fieldName] = new[] { $"Email cannot exceed {MaxEmailLength} characters." };
            return string.Empty;
        }

        if (SecuritySanitizer.ContainsSqlInjection(sanitizedEmail))
        {
            errors[fieldName] = new[] { "Email contains invalid characters." };
            return string.Empty;
        }

        try
        {
            if (!EmailRegex.IsMatch(sanitizedEmail))
            {
                errors[fieldName] = new[] { "Please enter a valid email address." };
                return string.Empty;
            }
        }
        catch (RegexMatchTimeoutException)
        {
            errors[fieldName] = new[] { "Email validation timed out." };
            return string.Empty;
        }

        // Normalize to lowercase
        return sanitizedEmail.ToLowerInvariant();
    }

    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            return EmailRegex.IsMatch(email);
        }
        catch (RegexMatchTimeoutException)
        {
            return false;
        }
    }
}