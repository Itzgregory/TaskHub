using System.Text.Json;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Exceptions;
using TaskHub.Infrastructure.Persistence.File.Common;
using TaskHub.Infrastructure.Persistence.File.Migrations;

namespace TaskHub.Infrastructure.Persistence.File;

public class FileUserRepository : IUserRepository
{
    private readonly string _filePath;
    private readonly MigrationRunner _migrationRunner;

    public FileUserRepository(string basePath)
    {
        _filePath = Path.Combine(basePath, "users.json");
        _migrationRunner = new MigrationRunner();
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var users = await LoadAllAsync(cancellationToken);
        return users.FirstOrDefault(u => u.Id == id);
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await LoadAllAsync(cancellationToken);
    }

    public async Task AddAsync(User entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var users = await LoadAllAsync(cancellationToken);
            
            if (users.Any(u => u.Id == entity.Id))
            {
                throw new InvalidOperationException($"User with id {entity.Id} already exists.");
            }

            var usersList = users.ToList();
            usersList.Add(entity);
            await SaveAllAsync(usersList, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateAsync(User entity, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var users = await LoadAllAsync(cancellationToken);
            var usersList = users.ToList();
            
            var index = usersList.FindIndex(u => u.Id == entity.Id);
            if (index == -1)
            {
                throw new NotFoundException("User", entity.Id);
            }

            usersList[index] = entity;
            await SaveAllAsync(usersList, cancellationToken);
        }, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await FileLock.ExecuteWithLockAsync(_filePath, async () =>
        {
            var users = await LoadAllAsync(cancellationToken);
            var usersList = users.ToList();
            
            usersList.RemoveAll(u => u.Id == id);
            await SaveAllAsync(usersList, cancellationToken);
        }, cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var users = await LoadAllAsync(cancellationToken);
        return users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<bool> ExistsAsync(string username, CancellationToken cancellationToken = default)
    {
        var users = await LoadAllAsync(cancellationToken);
        return users.Any(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
    }

    private async Task<IReadOnlyList<User>> LoadAllAsync(CancellationToken cancellationToken)
    {
        if (!System.IO.File.Exists(_filePath))
        {
            return new List<User>();
        }

        // Run migrations if needed
        if (await _migrationRunner.NeedsMigrationAsync(_filePath))
        {
            await _migrationRunner.MigrateAsync(_filePath, cancellationToken);
        }

        var json = await System.IO.File.ReadAllTextAsync(_filePath, cancellationToken);
        
        using var document = JsonDocument.Parse(json);
        var usersElement = document.RootElement.GetProperty("users");
        
        var users = JsonSerializer.Deserialize<List<User>>(usersElement.GetRawText());
        return users ?? new List<User>();
    }

    private async Task SaveAllAsync(List<User> users, CancellationToken cancellationToken)
    {
        var data = new
        {
            schemaVersion = SchemaVersion.Current,
            users = users
        };

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await AtomicFileWriter.WriteAsync(_filePath, json, cancellationToken);
    }
}