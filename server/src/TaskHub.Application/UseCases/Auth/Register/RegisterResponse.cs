namespace TaskHub.Application.UseCases.Auth.Register;

public record RegisterResponse(
    Guid UserId,
    string Username
);