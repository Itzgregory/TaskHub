using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Auth.Register;

public static class RegisterValidator
{
    private const int MinUsernameLength = 3;
    private const int MaxUsernameLength = 50;
    private const int MinPasswordLength = 8;
    private const int MaxPasswordLength = 100;

    public static void Validate(RegisterCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        // Username validation
        if (string.IsNullOrWhiteSpace(command.Username))
        {
            errors["username"] = new[] { "Username is required." };
        }
        else if (command.Username.Length < MinUsernameLength)
        {
            errors["username"] = new[] { $"Username must be at least {MinUsernameLength} characters." };
        }
        else if (command.Username.Length > MaxUsernameLength)
        {
            errors["username"] = new[] { $"Username cannot exceed {MaxUsernameLength} characters." };
        }

        // Password validation
        if (string.IsNullOrWhiteSpace(command.Password))
        {
            errors["password"] = new[] { "Password is required." };
        }
        else if (command.Password.Length < MinPasswordLength)
        {
            errors["password"] = new[] { $"Password must be at least {MinPasswordLength} characters." };
        }
        else if (command.Password.Length > MaxPasswordLength)
        {
            errors["password"] = new[] { $"Password cannot exceed {MaxPasswordLength} characters." };
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}