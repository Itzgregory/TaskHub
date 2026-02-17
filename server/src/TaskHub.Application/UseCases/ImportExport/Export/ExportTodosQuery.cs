namespace TaskHub.Application.UseCases.ImportExport.Export;

public record ExportTodosQuery(
    Guid OrgId,
    string Format = "json" 
);