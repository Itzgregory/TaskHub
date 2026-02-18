using System.Text.Json;

namespace TaskHub.Infrastructure.Persistence.File.Migrations;

public class V1ToV2Migration : IMigration
{
    public int FromVersion => 1;
    public int ToVersion => 2;

    public JsonDocument Apply(JsonDocument document)
    {
        // Example migration: Add a new field or transform data structure
        // For now, this is a no-op migration that just updates the version
        // In a real scenario, you'd transform the JSON structure here

        using var stream = new MemoryStream();
        using (var writer = new Utf8JsonWriter(stream))
        {
            writer.WriteStartObject();
            writer.WriteNumber("schemaVersion", ToVersion);

            // Copy all other properties from the original document
            foreach (var property in document.RootElement.EnumerateObject())
            {
                if (property.Name != "schemaVersion")
                {
                    property.WriteTo(writer);
                }
            }

            writer.WriteEndObject();
        }

        stream.Position = 0;
        return JsonDocument.Parse(stream);
    }
}