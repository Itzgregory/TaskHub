using TaskHub.Application.Common.Security;
using TaskHub.Domain.Exceptions;

// ReSharper disable once CheckNamespace

namespace TaskHub.Application.UseCases.Auth.Register;

public static class RegisterValidator
{
    public static void Validate(RegisterCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        // Validate email
        if (!string.IsNullOrWhiteSpace(command.Email))
        {
            EmailValidator.ValidateAndNormalizeEmail(command.Email, errors, "email");
        }
        else
        {
            errors["email"] = new[] { "Email is required." };
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