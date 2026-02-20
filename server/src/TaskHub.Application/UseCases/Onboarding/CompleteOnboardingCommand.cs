using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;

public record CompleteOnboardingCommand(
    string FullName,
    string Email,
    string? AvatarUrl,
    UsageType UsageType,
    string Theme,
    bool NotificationsEnabled
);
