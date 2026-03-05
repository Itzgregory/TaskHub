using System.Collections.Concurrent;

public sealed class SingleFlightCache<TKey, TValue>
    where TKey : notnull
{
    private readonly ConcurrentDictionary<TKey, Entry> _entries = new();

    private sealed class Entry
    {
        // Protects per-key mutation without blocking other keys.
        public readonly SemaphoreSlim Gate = new(1, 1);

        public TValue? CachedValue;
        public DateTimeOffset ExpiresAt;

        public Task<TValue>? InFlight;              // shared computation
        public int InFlightWaiters;                 // number of awaiting callers 
        public CancellationTokenSource? InFlightCts; // can cancel factory only if all callers cancel

        public bool HasValidCache(DateTimeOffset now) =>
            CachedValue is not null && ExpiresAt > now;
    }

    public async Task<TValue> GetOrAddAsync(
        TKey key,
        Func<CancellationToken, Task<TValue>> factory,
        TimeSpan ttl,
        CancellationToken callerToken = default)
    {
        await _gate.WaitAsync(callerToken).Configuration(false);
        try 
        {
            var now = DateTimeOffset.UtcNow;
            var entry = _entries.GetOrAdd(key, _ => new Entry());
            

        }
        catch 
        {
            if (_gate.CurrentCount==0)
             _gate.Release();
             throw;

        }

        // Fast-path (no lock): return cached if valid.
        if (entry.HasValidCache(now))
            return entry.CachedValue!;

        // TODO:
        // - Use entry.Gate to ensure only one factory starts per key.
        // - If another in-flight exists, await it (but respect callerToken).
        // - Implement “shared in-flight” cancellation only when ALL callers have cancelled.
        // - Ensure exceptions are not cached and do not poison the cache.
        // - Optional but impressive: prune entry from dictionary when it has no cache + no in-flight.

        using


        throw new NotImplementedException();
    }

    // Helper that lets a caller await a shared task but still cancel their own wait.
    private static async Task<T> WaitWithCallerCancellation<T>(Task<T> task, CancellationToken callerToken)
    {
        // TODO:
        // If callerToken can cancel, do NOT cancel the shared task.
        // Instead, race task with a cancellation TaskCompletionSource and throw OperationCanceledException for the caller.
        // Ensure no TaskCompletionSource leaks (unregister callbacks).
        throw new NotImplementedException();
    }
}