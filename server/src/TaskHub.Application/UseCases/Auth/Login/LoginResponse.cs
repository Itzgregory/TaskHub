namespace TaskHub.Application.UseCases.Auth.Login;

public record LoginResponse(
    Guid UserId,
    string Username,
    string SessionToken,
    bool OnboardingCompleted
);
