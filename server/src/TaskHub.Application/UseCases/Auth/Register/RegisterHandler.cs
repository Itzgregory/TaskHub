using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
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
        // Validate input
        RegisterValidator.Validate(command);

        // Check if username already exists
        var existingUser = await _userRepository.GetByUsernameAsync(
            command.Username,
            cancellationToken);

        if (existingUser != null)
        {
            return Result<RegisterResponse>.Failure(
                "username_taken",
                "This username is already taken.");
        }

        // Hash password
        var passwordHash = _passwordHasher.Hash(command.Password);

        // Create user
        var user = User.Create(
            command.Username,
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