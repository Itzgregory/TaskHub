using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Auth.Login;

public class LoginHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditRepository _auditRepository;
    private readonly ICorrelationContext _correlationContext;

    public LoginHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider,
        IAuditRepository auditRepository,
        ICorrelationContext correlationContext)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
        _auditRepository = auditRepository;
        _correlationContext = correlationContext;
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

                // Create audit entry manually (user isn't authenticated yet)
                var failedAudit = AuditEntry.Create(
                    user.Id,
                    Guid.Empty,
                    AuditAction.LoginFailed,
                    EntityType.User,
                    user.Id,
                    _correlationContext.CorrelationId,
                    $"Failed login attempt for user {user.Username}");

                await _auditRepository.AddAsync(failedAudit, cancellationToken);
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

        // Log successful login (user isn't authenticated yet, so create audit entry manually)
        var successAudit = AuditEntry.Create(
            user.Id,
            Guid.Empty,
            AuditAction.LoginSuccess,
            EntityType.User,
            user.Id,
            _correlationContext.CorrelationId,
            null);

        await _auditRepository.AddAsync(successAudit, cancellationToken);

        return Result<LoginResponse>.Success(new LoginResponse(
            user.Id,
            user.Username));
    }
}