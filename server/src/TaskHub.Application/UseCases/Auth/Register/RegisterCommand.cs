namespace TaskHub.Application.UseCases.Auth.Register;

public record RegisterCommand(
    string Email,
    string Password
);