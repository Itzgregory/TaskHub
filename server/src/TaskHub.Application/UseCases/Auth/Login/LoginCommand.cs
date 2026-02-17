namespace TaskHub.Application.UseCases.Auth.Login;

public record LoginCommand(
    string Username,
    string Password
);