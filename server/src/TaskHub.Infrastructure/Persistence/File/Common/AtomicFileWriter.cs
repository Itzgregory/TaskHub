namespace TaskHub.Infrastructure.Persistence.File.Common;

public static class AtomicFileWriter
{
    public static async Task WriteAsync(
        string filePath,
        string content,
        CancellationToken cancellationToken = default)
    {
        var directory = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var tempPath = $"{filePath}.tmp";

        try
        {
            // Write to temp file
            await System.IO.File.WriteAllTextAsync(tempPath, content, cancellationToken);

            // Atomic rename
            System.IO.File.Move(tempPath, filePath, overwrite: true);
        }
        catch
        {
            // Clean up temp file if something failed
            if (System.IO.File.Exists(tempPath))
            {
                System.IO.File.Delete(tempPath);
            }
            throw;
        }
    }
}