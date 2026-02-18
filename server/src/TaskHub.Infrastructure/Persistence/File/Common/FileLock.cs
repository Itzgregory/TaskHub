using System.Collections.Concurrent;

namespace TaskHub.Infrastructure.Persistence.File.Common;

public class FileLock
{
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    public static async Task<T> ExecuteWithLockAsync<T>(
        string filePath,
        Func<Task<T>> action,
        CancellationToken cancellationToken = default)
    {
        var semaphore = _locks.GetOrAdd(filePath, _ => new SemaphoreSlim(1, 1));

        await semaphore.WaitAsync(cancellationToken);
        try
        {
            return await action();
        }
        finally
        {
            semaphore.Release();
        }
    }

    public static async Task ExecuteWithLockAsync(
        string filePath,
        Func<Task> action,
        CancellationToken cancellationToken = default)
    {
        var semaphore = _locks.GetOrAdd(filePath, _ => new SemaphoreSlim(1, 1));

        await semaphore.WaitAsync(cancellationToken);
        try
        {
            await action();
        }
        finally
        {
            semaphore.Release();
        }
    }
}