using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;

public record CompleteOnboardingCommand(
    string FullName,
    string Username,
    string? AvatarUrl,
    UsageType UsageType,
    string Theme,
    bool NotificationsEnabled
);
