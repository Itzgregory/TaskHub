using System.Collections.Concurrent;
using Xunit;

public class SingleFlightCacheTests
{
    [Fact]
    public async Task Coalesces_Concurrent_Calls_Per_Key()
    {
        var cache = new SingleFlightCache<string, int>();
        var started = 0;

        Task<int> Factory(CancellationToken ct)
        {
            Interlocked.Increment(ref started);
            return Task.Run(async () =>
            {
                await Task.Delay(80, ct);
                return 42;
            }, ct);
        }

        var tasks = Enumerable.Range(0, 25)
            .Select(_ => cache.GetOrAddAsync("k", Factory, TimeSpan.FromSeconds(10)))
            .ToArray();

        var results = await Task.WhenAll(tasks);

        Assert.All(results, r => Assert.Equal(42, r));
        Assert.Equal(1, started);
    }

    [Fact]
    public async Task Does_Not_Cache_Exceptions()
    {
        var cache = new SingleFlightCache<string, int>();
        var attempts = 0;

        async Task<int> Factory(CancellationToken ct)
        {
            attempts++;
            await Task.Delay(10, ct);
            throw new InvalidOperationException("boom");
        }

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            cache.GetOrAddAsync("k", Factory, TimeSpan.FromSeconds(10)));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            cache.GetOrAddAsync("k", Factory, TimeSpan.FromSeconds(10)));

        Assert.Equal(2, attempts);
    }

    [Fact]
    public async Task Caller_Can_Cancel_Wait_Without_Cancelling_Shared_InFlight()
    {
        var cache = new SingleFlightCache<string, int>();
        var factoryCtsObserved = new ConcurrentBag<bool>();

        async Task<int> Factory(CancellationToken ct)
        {
            try
            {
                await Task.Delay(120, ct);
                return 7;
            }
            finally
            {
                factoryCtsObserved.Add(ct.IsCancellationRequested);
            }
        }

        using var callerCts = new CancellationTokenSource(30);

        var cancelledCaller = await Assert.ThrowsAsync<OperationCanceledException>(() =>
            cache.GetOrAddAsync("k", Factory, TimeSpan.FromSeconds(10), callerCts.Token));

        // Another caller should still get the result.
        var ok = await cache.GetOrAddAsync("k", Factory, TimeSpan.FromSeconds(10));
        Assert.Equal(7, ok);

        // The factory should not have been cancelled just because one caller stopped waiting.
        Assert.Contains(false, factoryCtsObserved);
    }
}
 