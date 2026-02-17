namespace TaskHub.Application.UseCases.Audit.List;

public record ListAuditQuery(
    Guid OrgId,
    int Page = 1,
    int PageSize = 50
);