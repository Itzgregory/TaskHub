namespace TaskHub.Application.UseCases.Todos.Archive;

public record ArchiveTodosResponse(
    int ArchivedCount,
    List<Guid> ArchivedTodoIds
);