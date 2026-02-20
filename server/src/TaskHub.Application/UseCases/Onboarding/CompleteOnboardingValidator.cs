using TaskHub.Application.Common.Security;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;

public static class CompleteOnboardingValidator
{
    public static void Validate(CompleteOnboardingCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        // Validate full name
        if (string.IsNullOrWhiteSpace(command.FullName))
        {
            errors["fullName"] = new[] { "Full name is required." };
        }
        else
        {
            var sanitizedName = SecuritySanitizer.SanitizeInput(command.FullName);
            
            if (sanitizedName.Length < 2 || sanitizedName.Length > 100)
            {
                errors["fullName"] = new[] { "Full name must be between 2 and 100 characters." };
            }
            else if (SecuritySanitizer.ContainsSqlInjection(sanitizedName))
            {
                errors["fullName"] = new[] { "Full name contains invalid characters." };
            }
        }

        // Validate username
        if (string.IsNullOrWhiteSpace(command.Username))
        {
            errors["username"] = new[] { "Username is required." };
        }
        else
        {
            var sanitized = SecuritySanitizer.SanitizeInput(command.Username);
            if (sanitized.Length < 3 || sanitized.Length > 50)
            {
                errors["username"] = new[] { "Username must be between 3 and 50 characters." };
            }
            else if (SecuritySanitizer.ContainsSqlInjection(sanitized))
            {
                errors["username"] = new[] { "Username contains invalid characters." };
            }
        }

        // Validate theme
        if (command.Theme != "light" && command.Theme != "dark")
        {
            errors["theme"] = new[] { "Theme must be 'light' or 'dark'." };
        }

        // Validate avatar URL if provided
        if (!string.IsNullOrWhiteSpace(command.AvatarUrl))
        {
            var sanitizedUrl = SecuritySanitizer.SanitizeInput(command.AvatarUrl);
            
            if (SecuritySanitizer.ContainsSqlInjection(sanitizedUrl))
            {
                errors["avatarUrl"] = new[] { "Avatar URL contains invalid characters." };
            }
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}