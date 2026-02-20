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
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;

    public RegisterHandler(
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider)
    {
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<RegisterResponse>> HandleAsync(
        RegisterCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        RegisterValidator.Validate(command);

        // Check username uniqueness
        var existingUser = await _userRepository.GetByUsernameAsync(
            command.Username,
            cancellationToken);

        if (existingUser != null)
        {
            return Result<RegisterResponse>.Failure(
                "username_taken",
                "Username is already taken.");
        }

        var now = _dateTimeProvider.UtcNow;

        // Hash password
        var passwordHash = _passwordHasher.Hash(command.Password);

        // Create user
        var user = User.Create(command.Username, passwordHash, now);
        await _userRepository.AddAsync(user, cancellationToken);

        // Auto-create personal organisation
        var orgName = $"{user.Username}'s Workspace";
        var org = Organisation.Create(orgName, user.Id, now);
        await _organisationRepository.AddAsync(org, cancellationToken);

        // Create membership as OrgAdmin
        var membership = Membership.Create(user.Id, org.Id, UserRole.OrgAdmin, now);
        await _membershipRepository.AddAsync(membership, cancellationToken);

        return Result<RegisterResponse>.Success(new RegisterResponse(
            user.Id,
            user.Username,
            org.Id));
    }
}
