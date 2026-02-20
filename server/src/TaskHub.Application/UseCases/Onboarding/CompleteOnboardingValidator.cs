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

        // Validate email using EmailValidator
        if (!string.IsNullOrWhiteSpace(command.Email))
        {
            EmailValidator.ValidateAndNormalizeEmail(command.Email, errors, "email");
        }
        else
        {
            errors["email"] = new[] { "Email is required." };
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