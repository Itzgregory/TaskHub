using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;

namespace TaskHub.Application.UseCases.Organisations.Create;

public class CreateOrgHandler
{
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public CreateOrgHandler(
        IOrganisationRepository organisationRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _organisationRepository = organisationRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<Result<CreateOrgResponse>> HandleAsync(
        CreateOrgCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate input
        CreateOrgValidator.Validate(command);

        var now = _dateTimeProvider.UtcNow;

        // Create organisation
        var org = Organisation.Create(
            command.Name,
            _currentUserContext.UserId,
            now);

        await _organisationRepository.AddAsync(org, cancellationToken);

        // Create membership for owner as OrgAdmin
        var membership = Membership.Create(
            _currentUserContext.UserId,
            org.Id,
            UserRole.OrgAdmin,
            now);

        await _membershipRepository.AddAsync(membership, cancellationToken);

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.OrgCreated,
            EntityType.Organisation,
            org.Id,
            org.Id,
            null,
            cancellationToken);

        return Result<CreateOrgResponse>.Success(new CreateOrgResponse(
            org.Id,
            org.Name,
            org.OwnerId));
    }
}