using TaskHub.Application.Common.Security;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Auth.Register;

public static class RegisterValidator
{
    public static RegisterCommand SanitizeAndValidate(RegisterCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        // Validate and normalize email
        var normalizedEmail = EmailValidator.ValidateAndNormalizeEmail(
            command.Username, errors, "email");

        // Validate password with security checks
        if (!PasswordValidator.ValidatePassword(command.Password, errors, "password"))
        {
            // Additional SQL injection check on password
            if (SecuritySanitizer.ContainsSqlInjection(command.Password))
            {
                errors["password"] = new[] { "Password contains invalid characters." };
            }
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }

        // Return sanitized command
        return new RegisterCommand(normalizedEmail, command.Password);
    }
}