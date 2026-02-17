using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Auth.Login;

public class LoginHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public LoginHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<Result<LoginResponse>> HandleAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        LoginValidator.Validate(command);

        // Get user
        var user = await _userRepository.GetByUsernameAsync(
            command.Username,
            cancellationToken);

        // Check if user exists and password matches - use same error for both
        // to prevent user enumeration
        if (user == null || !_passwordHasher.Verify(command.Password, user.PasswordHash))
        {
            // Log failed attempt if user exists
            if (user != null)
            {
                user.RecordFailedLogin(_dateTimeProvider.UtcNow);
                await _userRepository.UpdateAsync(user, cancellationToken);

                await _auditLogger.LogAsync(
                    AuditAction.LoginFailed,
                    EntityType.User,
                    user.Id,
                    null,
                    $"Failed login attempt for user {user.Username}",
                    cancellationToken);
            }

            return Result<LoginResponse>.Failure(
                "invalid_credentials",
                "Invalid username or password.");
        }

        // Check if account is locked
        if (user.IsLockedOut)
        {
            // Check if lockout has expired
            if (user.IsLockoutExpired(_dateTimeProvider.UtcNow))
            {
                user.UnlockAccount(_dateTimeProvider.UtcNow);
                await _userRepository.UpdateAsync(user, cancellationToken);
            }
            else
            {
                return Result<LoginResponse>.Failure(
                    "account_locked",
                    "Account is locked due to too many failed login attempts. Please try again later.");
            }
        }

        // Reset failed login attempts on successful login
        user.ResetLoginAttempts(_dateTimeProvider.UtcNow);
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Log successful login
        await _auditLogger.LogAsync(
            AuditAction.LoginSuccess,
            EntityType.User,
            user.Id,
            null,
            null,
            cancellationToken);

        return Result<LoginResponse>.Success(new LoginResponse(
            user.Id,
            user.Username));
    }
}