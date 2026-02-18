using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Infrastructure.Persistence.File.Common;
using TaskHub.Infrastructure.Persistence.File.Migrations;

namespace TaskHub.Infrastructure.Persistence.File;

public class FileMembershipRepository : IMembershipRepository
{
    private readonly string _filePath;
    private readonly MigrationRunner _migrationRunner;

    public FileMembershipRepository(string basePath)
    {
        _filePath = Path.Combine(basePath, "memberships.json");
        _migrationRunner = new MigrationRunner();
    }

    public async Task<Membership?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var memberships = await LoadAllAsync(cancellationToken);
        return memberships.FirstOrDefault(m => m.Id == id);
    }

    public async Task<IReadOnlyList<Membership>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await LoadAllAsync(cancellationToken);
    }

    public async Task AddAsync(Membership entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var memberships = await LoadAllAsync(cancellationToken);
            
            if (memberships.Any(m => m.Id == entity.Id))
            {
                throw new InvalidOperationException($"Membership with id {entity.Id} already exists.");
            }

            var membershipsList = memberships.ToList();
            membershipsList.Add(entity);
            await SaveAllAsync(membershipsList, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateAsync(Membership entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var memberships = await LoadAllAsync(cancellationToken);
            var membershipsList = memberships.ToList();
            
            var index = membershipsList.FindIndex(m => m.Id == entity.Id);
            if (index == -1)
            {
                throw new NotFoundException("Membership", entity.Id);
            }

            membershipsList[index] = entity;
            await SaveAllAsync(membershipsList, cancellationToken);
        }, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var memberships = await LoadAllAsync(cancellationToken);
            var membershipsList = memberships.ToList();
            
            membershipsList.RemoveAll(m => m.Id == id);
            await SaveAllAsync(membershipsList, cancellationToken);
        }, cancellationToken);
    }

    public async Task<IReadOnlyList<Membership>> GetByOrganisationIdAsync(Guid organisationId, CancellationToken cancellationToken = default)
    {
        var memberships = await LoadAllAsync(cancellationToken);
        return memberships.Where(m => m.OrganisationId == organisationId).ToList();
    }

    public async Task<IReadOnlyList<Membership>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var memberships = await LoadAllAsync(cancellationToken);
        return memberships.Where(m => m.UserId == userId).ToList();
    }

    public async Task<Membership?> GetByUserAndOrgAsync(Guid userId, Guid organisationId, CancellationToken cancellationToken = default)
    {
        var memberships = await LoadAllAsync(cancellationToken);
        return memberships.FirstOrDefault(m => m.UserId == userId && m.OrganisationId == organisationId);
    }

    public async Task<int> CountAdminsInOrgAsync(Guid organisationId, CancellationToken cancellationToken = default)
    {
        var memberships = await LoadAllAsync(cancellationToken);
        return memberships.Count(m => m.OrganisationId == organisationId && m.Role == UserRole.OrgAdmin);
    }

    private async Task<IReadOnlyList<Membership>> LoadAllAsync(CancellationToken cancellationToken)
    {
        if (!System.IO.File.Exists(_filePath))
        {
            return new List<Membership>();
        }

        if (await _migrationRunner.NeedsMigrationAsync(_filePath))
        {
            await _migrationRunner.MigrateAsync(_filePath, cancellationToken);
        }

        var json = await System.IO.File.ReadAllTextAsync(_filePath, cancellationToken);
        
        using var document = JsonDocument.Parse(json);
        var membershipsElement = document.RootElement.GetProperty("memberships");
        
        var memberships = JsonSerializer.Deserialize<List<Membership>>(membershipsElement.GetRawText());
        return memberships ?? new List<Membership>();
    }

    private async Task SaveAllAsync(List<Membership> memberships, CancellationToken cancellationToken)
    {
        var data = new
        {
            schemaVersion = SchemaVersion.Current,
            memberships = memberships
        };

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await AtomicFileWriter.WriteAsync(_filePath, json, cancellationToken);
    }
}