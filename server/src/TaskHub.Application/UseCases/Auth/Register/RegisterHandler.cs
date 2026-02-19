using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Application.Common.Security; 
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Auth.Register;

public class RegisterHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public RegisterHandler(
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

    public async Task<Result<RegisterResponse>> HandleAsync(
        RegisterCommand command,
        CancellationToken cancellationToken = default)
    {
        // CHANGE THIS: Replace Validate with SanitizeAndValidate
        var sanitizedCommand = RegisterValidator.SanitizeAndValidate(command);

        // Check if username already exists (using sanitized username)
        var existingUser = await _userRepository.GetByUsernameAsync(
            sanitizedCommand.Username,  // Use sanitized version
            cancellationToken);

        if (existingUser != null)
        {
            return Result<RegisterResponse>.Failure(
                "username_taken",
                "This username is already taken.");
        }

        // Hash password (using sanitized password)
        var passwordHash = _passwordHasher.Hash(sanitizedCommand.Password);  // Use sanitized version

        // Create user (with sanitized and normalized username)
        var user = User.Create(
            sanitizedCommand.Username,  // Already lowercase and sanitized
            passwordHash,
            _dateTimeProvider.UtcNow);

        // Save user
        await _userRepository.AddAsync(user, cancellationToken);

        // Return response
        return Result<RegisterResponse>.Success(new RegisterResponse(
            user.Id,
            user.Username));
    }
}