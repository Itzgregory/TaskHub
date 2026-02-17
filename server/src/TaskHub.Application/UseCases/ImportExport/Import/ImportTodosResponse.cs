using TaskHub.Application.Common.Models;

namespace TaskHub.Application.UseCases.ImportExport.Import;

public record ImportTodosResponse(
    ImportReport Report
);