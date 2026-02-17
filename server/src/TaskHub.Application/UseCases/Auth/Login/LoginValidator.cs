using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Auth.Login;

public static class LoginValidator
{
    public static void Validate(LoginCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(command.Username))
        {
            errors["username"] = new[] { "Username is required." };
        }

        if (string.IsNullOrWhiteSpace(command.Password))
        {
            errors["password"] = new[] { "Password is required." };
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}