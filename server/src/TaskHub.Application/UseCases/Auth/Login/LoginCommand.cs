namespace TaskHub.Application.UseCases.Auth.Login;

public record LoginCommand(
    string Email,
    string Password
);