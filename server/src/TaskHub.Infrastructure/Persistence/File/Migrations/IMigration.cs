using System.Text.Json;

namespace TaskHub.Infrastructure.Persistence.File.Migrations;

public interface IMigration
{
    int FromVersion { get; }
    int ToVersion { get; }
    JsonDocument Apply(JsonDocument document);
}