using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Organisations.SetActiveOrg;

public class SetActiveOrgHandler
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;

    public SetActiveOrgHandler(
        ISessionRepository sessionRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext)
    {
        _sessionRepository = sessionRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
    }

    public async Task<Result<Unit>> HandleAsync(
        SetActiveOrgCommand command,
        CancellationToken cancellationToken = default)
    {
        // Verify user is member of org
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            command.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        // Get user's session
        var session = await _sessionRepository.GetByUserIdAsync(
            _currentUserContext.UserId,
            cancellationToken);

        if (session == null)
        {
            throw new UnauthorizedAccessException("No active session found.");
        }

        // Set active org
        session.SetActiveOrg(command.OrgId);
        await _sessionRepository.UpdateAsync(session, cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
