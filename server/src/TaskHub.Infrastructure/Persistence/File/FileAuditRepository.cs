using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;
using TaskHub.Infrastructure.Persistence.File.Common;
using TaskHub.Infrastructure.Persistence.File.Migrations;

namespace TaskHub.Infrastructure.Persistence.File;

public class FileAuditRepository : IAuditRepository
{
    private readonly string _filePath;
    private readonly MigrationRunner _migrationRunner;

    public FileAuditRepository(string basePath)
    {
        _filePath = Path.Combine(basePath, "audit.json");
        _migrationRunner = new MigrationRunner();
    }

    public async Task<AuditEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entries = await LoadAllAsync(cancellationToken);
        return entries.FirstOrDefault(e => e.Id == id);
    }

    public async Task<IReadOnlyList<AuditEntry>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await LoadAllAsync(cancellationToken);
    }

    public async Task AddAsync(AuditEntry entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var entries = await LoadAllAsync(cancellationToken);
            
            if (entries.Any(e => e.Id == entity.Id))
            {
                throw new InvalidOperationException($"AuditEntry with id {entity.Id} already exists.");
            }

            var entriesList = entries.ToList();
            entriesList.Add(entity);
            await SaveAllAsync(entriesList, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateAsync(AuditEntry entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var entries = await LoadAllAsync(cancellationToken);
            var entriesList = entries.ToList();
            
            var index = entriesList.FindIndex(e => e.Id == entity.Id);
            if (index == -1)
            {
                throw new NotFoundException("AuditEntry", entity.Id);
            }

            entriesList[index] = entity;
            await SaveAllAsync(entriesList, cancellationToken);
        }, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var entries = await LoadAllAsync(cancellationToken);
            var entriesList = entries.ToList();
            
            entriesList.RemoveAll(e => e.Id == id);
            await SaveAllAsync(entriesList, cancellationToken);
        }, cancellationToken);
    }

    public async Task<(IReadOnlyList<AuditEntry> Items, int TotalCount)> GetPagedByOrgAsync(
        Guid orgId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var entries = await LoadAllAsync(cancellationToken);
        var query = entries
            .Where(e => e.OrgId == orgId)
            .OrderByDescending(e => e.Timestamp);

        var totalCount = query.Count();
        var items = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return (items, totalCount);
    }

    private async Task<IReadOnlyList<AuditEntry>> LoadAllAsync(CancellationToken cancellationToken)
    {
        if (!System.IO.File.Exists(_filePath))
        {
            return new List<AuditEntry>();
        }

        if (await _migrationRunner.NeedsMigrationAsync(_filePath))
        {
            await _migrationRunner.MigrateAsync(_filePath, cancellationToken);
        }

        var json = await System.IO.File.ReadAllTextAsync(_filePath, cancellationToken);
        
        using var document = JsonDocument.Parse(json);
        var entriesElement = document.RootElement.GetProperty("auditEntries");
        
        var entries = JsonSerializer.Deserialize<List<AuditEntry>>(entriesElement.GetRawText());
        return entries ?? new List<AuditEntry>();
    }

    private async Task SaveAllAsync(List<AuditEntry> entries, CancellationToken cancellationToken)
    {
        var data = new
        {
            schemaVersion = SchemaVersion.Current,
            auditEntries = entries
        };

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await AtomicFileWriter.WriteAsync(_filePath, json, cancellationToken);
    }
}