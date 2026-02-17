using System.Text;
using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.Common.Models;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Domain.ValueObjects;

namespace TaskHub.Application.UseCases.ImportExport.Import;

public class ImportTodosHandler
{
    private readonly ITodoRepository _todoRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogger _auditLogger;

    public ImportTodosHandler(
        ITodoRepository todoRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserContext currentUserContext,
        IDateTimeProvider dateTimeProvider,
        IAuditLogger auditLogger)
    {
        _todoRepository = todoRepository;
        _membershipRepository = membershipRepository;
        _currentUserContext = currentUserContext;
        _dateTimeProvider = dateTimeProvider;
        _auditLogger = auditLogger;
    }

    public async Task<Result<ImportTodosResponse>> HandleAsync(
        ImportTodosCommand command,
        CancellationToken cancellationToken = default)
    {
        // Check user is member of org
        var membership = await _membershipRepository.GetByUserAndOrgAsync(
            _currentUserContext.UserId,
            command.OrgId,
            cancellationToken);

        if (membership == null)
        {
            throw new ForbiddenException(
                "You do not have access to this organisation.");
        }

        List<ImportRow> rows;

        try
        {
            if (command.Format.ToLower() == "csv")
            {
                rows = ParseCsv(command.Content);
            }
            else
            {
                rows = ParseJson(command.Content);
            }
        }
        catch (Exception ex)
        {
            throw new ValidationException("content", $"Failed to parse {command.Format}: {ex.Message}");
        }

        var acceptedTodos = new List<TodoItem>();
        var rejectedRows = new List<RejectedRow>();

        for (int i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var rowErrors = new List<string>();

            try
            {
                // Validate and parse
                if (string.IsNullOrWhiteSpace(row.Title))
                {
                    rowErrors.Add("Title is required.");
                }

                if (!Enum.TryParse<Priority>(row.Priority, true, out var priority))
                {
                    rowErrors.Add($"Invalid priority: {row.Priority}");
                }

                var tags = new List<Tag>();
                if (row.Tags != null && row.Tags.Any())
                {
                    foreach (var tagValue in row.Tags)
                    {
                        try
                        {
                            tags.Add(new Tag(tagValue));
                        }
                        catch (ValidationException ex)
                        {
                            rowErrors.Add($"Invalid tag '{tagValue}': {ex.Message}");
                        }
                    }
                }

                DateTime? dueDate = null;
                if (!string.IsNullOrWhiteSpace(row.DueDate))
                {
                    if (!DateTime.TryParse(row.DueDate, out var parsedDate))
                    {
                        rowErrors.Add($"Invalid due date: {row.DueDate}");
                    }
                    else
                    {
                        dueDate = parsedDate;
                    }
                }

                if (rowErrors.Any())
                {
                    rejectedRows.Add(new RejectedRow(i + 1, rowErrors));
                    continue;
                }

                // Create todo
                var todo = TodoItem.Create(
                    command.OrgId,
                    _currentUserContext.UserId,
                    row.Title!,
                    row.Description,
                    priority,
                    tags,
                    dueDate,
                    _dateTimeProvider.UtcNow);

                acceptedTodos.Add(todo);
            }
            catch (Exception ex)
            {
                rowErrors.Add(ex.Message);
                rejectedRows.Add(new RejectedRow(i + 1, rowErrors));
            }
        }

        // Save accepted todos
        foreach (var todo in acceptedTodos)
        {
            await _todoRepository.AddAsync(todo, cancellationToken);
        }

        // Log audit
        await _auditLogger.LogAsync(
            AuditAction.TodosImported,
            EntityType.Todo,
            Guid.Empty,
            command.OrgId,
            $"Imported {acceptedTodos.Count} todos, rejected {rejectedRows.Count}",
            cancellationToken);

        var report = new ImportReport(acceptedTodos.Count, rejectedRows);

        return Result<ImportTodosResponse>.Success(new ImportTodosResponse(report));
    }

    private List<ImportRow> ParseJson(string content)
    {
        var jsonRows = JsonSerializer.Deserialize<List<JsonImportRow>>(content);
        if (jsonRows == null)
            throw new Exception("Invalid JSON format");

        return jsonRows.Select(r => new ImportRow
        {
            Title = r.Title,
            Description = r.Description,
            Priority = r.Priority ?? "Medium",
            Tags = r.Tags,
            DueDate = r.DueDate
        }).ToList();
    }

    private List<ImportRow> ParseCsv(string content)
    {
        var rows = new List<ImportRow>();
        var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        // Skip header
        for (int i = 1; i < lines.Length; i++)
        {
            var values = ParseCsvLine(lines[i]);
            if (values.Length < 4)
                continue;

            rows.Add(new ImportRow
            {
                Title = values.Length > 0 ? values[0] : null,
                Description = values.Length > 1 ? values[1] : null,
                Priority = values.Length > 3 ? values[3] : "Medium",
                Tags = values.Length > 4 ? values[4].Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() : null,
                DueDate = values.Length > 5 ? values[5] : null
            });
        }

        return rows;
    }

    private string[] ParseCsvLine(string line)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];

            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }

        result.Add(current.ToString());
        return result.ToArray();
    }

    private class ImportRow
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string Priority { get; set; } = "Medium";
        public List<string>? Tags { get; set; }
        public string? DueDate { get; set; }
    }

    private class JsonImportRow
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public List<string>? Tags { get; set; }
        public string? DueDate { get; set; }
    }
}