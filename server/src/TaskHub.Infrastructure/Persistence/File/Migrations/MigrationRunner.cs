using System.Text.Json;
using TaskHub.Infrastructure.Persistence.File.Common;

namespace TaskHub.Infrastructure.Persistence.File.Migrations;

public class MigrationRunner
{
    private readonly List<IMigration> _migrations;

    public MigrationRunner()
    {
        _migrations = new List<IMigration>
        {
            new V1ToV2Migration()
        };
    }

    public async Task<bool> NeedsMigrationAsync(string filePath)
    {
        if (!System.IO.File.Exists(filePath))
            return false;

        var content = await System.IO.File.ReadAllTextAsync(filePath);
        using var document = JsonDocument.Parse(content);

        if (!document.RootElement.TryGetProperty("schemaVersion", out var versionElement))
            return true; // No version means v1, needs migration

        var currentVersion = versionElement.GetInt32();
        return currentVersion < SchemaVersion.Current;
    }

    public async Task MigrateAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (!System.IO.File.Exists(filePath))
            return;

        await FileLock.ExecuteWithLockAsync(filePath, async () =>
        {
            var content = await System.IO.File.ReadAllTextAsync(filePath, cancellationToken);
            using var document = JsonDocument.Parse(content);

            var currentVersion = 1;
            if (document.RootElement.TryGetProperty("schemaVersion", out var versionElement))
            {
                currentVersion = versionElement.GetInt32();
            }

            if (currentVersion >= SchemaVersion.Current)
                return;

            // Apply migrations in sequence
            var migratedDocument = document;
            foreach (var migration in _migrations.OrderBy(m => m.FromVersion))
            {
                if (migration.FromVersion >= currentVersion && migration.ToVersion <= SchemaVersion.Current)
                {
                    migratedDocument = migration.Apply(migratedDocument);
                    currentVersion = migration.ToVersion;
                }
            }

            // Write migrated content back
            var migratedJson = JsonSerializer.Serialize(
                migratedDocument,
                new JsonSerializerOptions { WriteIndented = true });

            await AtomicFileWriter.WriteAsync(filePath, migratedJson, cancellationToken);

        }, cancellationToken);
    }
}