using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;
using TaskHub.Infrastructure.Persistence.File.Common;
using TaskHub.Infrastructure.Persistence.File.Migrations;

namespace TaskHub.Infrastructure.Persistence.File;

public class FileOrganisationRepository : IOrganisationRepository
{
    private readonly string _filePath;
    private readonly MigrationRunner _migrationRunner;
    private readonly string _membershipFilePath;

    public FileOrganisationRepository(string basePath)
    {
        _filePath = Path.Combine(basePath, "organisations.json");
        _membershipFilePath = Path.Combine(basePath, "memberships.json");
        _migrationRunner = new MigrationRunner();
    }

    public async Task<Organisation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var orgs = await LoadAllAsync(cancellationToken);
        return orgs.FirstOrDefault(o => o.Id == id);
    }

    public async Task<IReadOnlyList<Organisation>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await LoadAllAsync(cancellationToken);
    }

    public async Task AddAsync(Organisation entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var orgs = await LoadAllAsync(cancellationToken);
            
            if (orgs.Any(o => o.Id == entity.Id))
            {
                throw new InvalidOperationException($"Organisation with id {entity.Id} already exists.");
            }

            var orgsList = orgs.ToList();
            orgsList.Add(entity);
            await SaveAllAsync(orgsList, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateAsync(Organisation entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var orgs = await LoadAllAsync(cancellationToken);
            var orgsList = orgs.ToList();
            
            var index = orgsList.FindIndex(o => o.Id == entity.Id);
            if (index == -1)
            {
                throw new NotFoundException("Organisation", entity.Id);
            }

            orgsList[index] = entity;
            await SaveAllAsync(orgsList, cancellationToken);
        }, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var orgs = await LoadAllAsync(cancellationToken);
            var orgsList = orgs.ToList();
            
            orgsList.RemoveAll(o => o.Id == id);
            await SaveAllAsync(orgsList, cancellationToken);
        }, cancellationToken);
    }

    public async Task<IReadOnlyList<Organisation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var memberships = await LoadMembershipsAsync(cancellationToken);
        var orgIds = memberships
            .Where(m => m.UserId == userId)
            .Select(m => m.OrganisationId)
            .ToHashSet();

        var orgs = await LoadAllAsync(cancellationToken);
        return orgs.Where(o => orgIds.Contains(o.Id)).ToList();
    }

    private async Task<IReadOnlyList<Organisation>> LoadAllAsync(CancellationToken cancellationToken)
    {
        if (!System.IO.File.Exists(_filePath))
        {
            return new List<Organisation>();
        }

        if (await _migrationRunner.NeedsMigrationAsync(_filePath))
        {
            await _migrationRunner.MigrateAsync(_filePath, cancellationToken);
        }

        var json = await System.IO.File.ReadAllTextAsync(_filePath, cancellationToken);
        
        using var document = JsonDocument.Parse(json);
        var orgsElement = document.RootElement.GetProperty("organisations");
        
        var orgs = JsonSerializer.Deserialize<List<Organisation>>(orgsElement.GetRawText());
        return orgs ?? new List<Organisation>();
    }

    private async Task SaveAllAsync(List<Organisation> orgs, CancellationToken cancellationToken)
    {
        var data = new
        {
            schemaVersion = SchemaVersion.Current,
            organisations = orgs
        };

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await AtomicFileWriter.WriteAsync(_filePath, json, cancellationToken);
    }

    private async Task<IReadOnlyList<Membership>> LoadMembershipsAsync(CancellationToken cancellationToken)
    {
        if (!System.IO.File.Exists(_membershipFilePath))
        {
            return new List<Membership>();
        }

        var json = await System.IO.File.ReadAllTextAsync(_membershipFilePath, cancellationToken);
        
        using var document = JsonDocument.Parse(json);
        var membershipsElement = document.RootElement.GetProperty("memberships");
        
        var memberships = JsonSerializer.Deserialize<List<Membership>>(membershipsElement.GetRawText());
        return memberships ?? new List<Membership>();
    }
}