namespace TaskHub.Application.UseCases.Todos.Archive;

public record ArchiveTodosCommand(
    Guid OrgId,
    int ArchiveAfterDays
);