using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Auth.Register;

public class RegisterHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;

    public RegisterHandler(
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        ISessionRepository sessionRepository,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider)
    {
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _sessionRepository = sessionRepository;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<RegisterResponse>> HandleAsync(
        RegisterCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        RegisterValidator.Validate(command);

        // Check email uniqueness
        var existingUser = await _userRepository.GetByEmailAsync(
            command.Email,
            cancellationToken);

        if (existingUser != null)
        {
            return Result<RegisterResponse>.Failure(
                "email_taken",
                "Email is already registered.");
        }

        var now = _dateTimeProvider.UtcNow;

        // Hash password
        var passwordHash = _passwordHasher.Hash(command.Password);

        // Create user
        var user = User.Create(command.Email, passwordHash, now);
        await _userRepository.AddAsync(user, cancellationToken);

        // Auto-create personal organisation (use email local part for display until onboarding)
        var displayName = user.Email?.Value.Split('@')[0] ?? user.Username;
        var orgName = $"{displayName}'s Workspace";
        var org = Organisation.Create(orgName, user.Id, now);
        await _organisationRepository.AddAsync(org, cancellationToken);

        // Create membership as OrgAdmin
        var membership = Membership.Create(user.Id, org.Id, UserRole.OrgAdmin, now);
        await _membershipRepository.AddAsync(membership, cancellationToken);

        // Create session so user is authenticated immediately (no separate login needed)
        var session = Session.Create(user.Id, now, expiryHours: 24);
        session.SetActiveOrg(org.Id);
        await _sessionRepository.AddAsync(session, cancellationToken);

        return Result<RegisterResponse>.Success(new RegisterResponse(
            user.Id,
            user.Email!.Value,
            org.Id,
            session.SessionToken));
    }
}
