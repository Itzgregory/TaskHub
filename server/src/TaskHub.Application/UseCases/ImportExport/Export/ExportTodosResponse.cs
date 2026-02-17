namespace TaskHub.Application.UseCases.ImportExport.Export;

public record ExportTodosResponse(
    string Content,
    string ContentType,
    string FileName
);