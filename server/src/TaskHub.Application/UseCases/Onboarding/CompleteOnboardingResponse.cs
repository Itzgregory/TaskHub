namespace TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;

public record CompleteOnboardingResponse(
    Guid UserId,
    string FullName,
    string Username,
    bool OnboardingCompleted
);
