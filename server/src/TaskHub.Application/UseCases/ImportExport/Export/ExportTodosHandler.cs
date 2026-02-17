using System.Text;
using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.ImportExport.Export;

public class ExportTodosHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IAuditLogger _auditLogger;

    public ExportTodosHandler(
        ITodoRepository todoRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IAuditLogger auditLogger)
    {
        _todoRepository = todoRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _auditLogger = auditLogger;
    }

    public async Task<Result<ExportTodosResponse>> HandleAsync(
        ExportTodosQuery query,
        CancellationToken cancellationToken = default)
    {
        // Check user is member of org
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            query.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        // Get all todos (excluding deleted)
        var todos = await _todoRepository.GetByOrgIdAsync(
            query.OrgId,
            includeDeleted: false,
            includeArchived: true,
            cancellationToken);

        string content;
        string contentType;
        string fileName;

        if (query.Format.ToLower() == "csv")
        {
            content = ExportToCsv(todos);
            contentType = "text/csv";
            fileName = $"todos-export-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
        }
        else
        {
            content = ExportToJson(todos);
            contentType = "application/json";
            fileName = $"todos-export-{DateTime.UtcNow:yyyyMMddHHmmss}.json";
        }

        // Log audit
        await _auditLogger.LogAsync(
            Domain.Enums.AuditAction.TodosExported,
            Domain.Enums.EntityType.Todo,
            Guid.Empty,
            query.OrgId,
            $"Exported {todos.Count} todos as {query.Format}",
            cancellationToken);

        return Result<ExportTodosResponse>.Success(new ExportTodosResponse(
            content,
            contentType,
            fileName));
    }

    private string ExportToJson(IReadOnlyList<Domain.Entities.TodoItem> todos)
    {
        var exportData = todos.Select(t => new
        {
            t.Id,
            t.Title,
            t.Description,
            Status = t.Status.ToString(),
            Priority = t.Priority.ToString(),
            Tags = t.Tags.Select(tag => tag.Value).ToList(),
            DueDate = t.DueDate?.ToString("yyyy-MM-dd"),
            IsArchived = t.IsArchived
        }).ToList();

        return JsonSerializer.Serialize(exportData, new JsonSerializerOptions
        {
            WriteIndented = true
        });
    }

    private string ExportToCsv(IReadOnlyList<Domain.Entities.TodoItem> todos)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Id,Title,Description,Status,Priority,Tags,DueDate,IsArchived");

        foreach (var todo in todos)
        {
            csv.AppendLine($"\"{todo.Id}\",\"{EscapeCsv(todo.Title)}\",\"{EscapeCsv(todo.Description)}\",\"{todo.Status}\",\"{todo.Priority}\",\"{string.Join(";", todo.Tags.Select(t => t.Value))}\",\"{todo.DueDate?.ToString("yyyy-MM-dd")}\",\"{todo.IsArchived}\"");
        }

        return csv.ToString();
    }

    private string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return string.Empty;

        return value.Replace("\"", "\"\"");
    }
}