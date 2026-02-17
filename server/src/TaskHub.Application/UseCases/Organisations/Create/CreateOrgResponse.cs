namespace TaskHub.Application.UseCases.Organisations.Create;

public record CreateOrgResponse(
    Guid Id,
    string Name,
    Guid OwnerId
);