using TaskHub.Application.Common.Security;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Auth.Register;

public static class RegisterValidator
{
    public static void Validate(RegisterCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        // Validate username
        if (string.IsNullOrWhiteSpace(command.Username))
        {
            errors["username"] = new[] { "Username is required." };
        }
        else
        {
            var sanitizedUsername = SecuritySanitizer.SanitizeInput(command.Username);
            
            if (sanitizedUsername.Length < 3 || sanitizedUsername.Length > 50)
            {
                errors["username"] = new[] { "Username must be between 3 and 50 characters." };
            }
            else if (SecuritySanitizer.ContainsSqlInjection(sanitizedUsername))
            {
                errors["username"] = new[] { "Username contains invalid characters." };
            }
        }

        // Validate password using PasswordValidator
        if (!string.IsNullOrWhiteSpace(command.Password))
        {
            PasswordValidator.ValidatePassword(command.Password, errors, "password");
        }
        else
        {
            errors["password"] = new[] { "Password is required." };
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}