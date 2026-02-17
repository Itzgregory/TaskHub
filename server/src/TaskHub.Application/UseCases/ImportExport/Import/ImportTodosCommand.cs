namespace TaskHub.Application.UseCases.ImportExport.Import;

public record ImportTodosCommand(
    Guid OrgId,
    string Content,
    string Format = "json"
);