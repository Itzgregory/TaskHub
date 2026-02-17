namespace TaskHub.Application.UseCases.Auth.Register;

public record RegisterCommand(
    string Username,
    string Password
);