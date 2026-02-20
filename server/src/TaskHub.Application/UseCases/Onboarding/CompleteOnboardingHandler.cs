using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;

public class CompleteOnboardingHandler
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;

    public CompleteOnboardingHandler(
        IUserRepository userRepository,
        ICurrentUserContext currentUserContext,
        IDateTimeProvider dateTimeProvider)
    {
        _userRepository = userRepository;
        _currentUserContext = currentUserContext;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<CompleteOnboardingResponse>> HandleAsync(
        CompleteOnboardingCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        CompleteOnboardingValidator.Validate(command);

        // Get current user
        var user = await _userRepository.GetByIdAsync(
            _currentUserContext.UserId,
            cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", _currentUserContext.UserId);
        }

        // Check username uniqueness (cannot take another user's username)
        var existingByUsername = await _userRepository.GetByUsernameAsync(command.Username, cancellationToken);
        if (existingByUsername != null && existingByUsername.Id != user.Id)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["username"] = new[] { "Username is already taken." }
            });
        }

        // Complete onboarding (email already set at registration)
        user.CompleteOnboarding(
            command.FullName,
            command.Username,
            command.AvatarUrl,
            command.UsageType,
            command.Theme,
            command.NotificationsEnabled,
            _dateTimeProvider.UtcNow);

        // Save
        await _userRepository.UpdateAsync(user, cancellationToken);

        return Result<CompleteOnboardingResponse>.Success(new CompleteOnboardingResponse(
            user.Id,
            user.FullName!,
            user.Username,
            user.OnboardingCompleted));
    }
}
