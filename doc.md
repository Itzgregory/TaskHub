# Exercise 1: Single-flight async cache (C#/.NET)  

You’re implementing an async cache method:

```csharp
Task<TValue> GetOrAddAsync(
  TKey key,
  Func<CancellationToken, Task<TValue>> factory,
  TimeSpan ttl,
  CancellationToken callerToken = default)
```

## Objective

Build a **thread-safe per-key async cache** that behaves correctly under heavy concurrency:

1. **Single-flight per key**
   If multiple callers request the same `key` concurrently, **only one** `factory` call may run at a time for that key. All other callers must **join** and await the same in-flight task.

2. **Cache only successful results with TTL**
   If `factory` completes successfully with `value`:

* Cache `value` for `ttl` duration.
* Calls within the TTL return the cached value (no factory call).
* TTL starts when the successful value is written to the cache (around completion time).

3. **Do not cache failures**
   If `factory` throws/faults (or is cancelled):

* Propagate the exception/cancellation to current waiters.
* Do **not** store it as a cached outcome.
* Ensure the entry is not “poisoned”: future calls must be able to retry.

4. **Per-caller cancellation should cancel only waiting**
   If `callerToken` is cancelled while a caller is waiting:

* That caller must stop waiting and throw `OperationCanceledException`.
* This must **not** cancel the shared in-flight factory just because one caller cancelled.

5. **Shared cancellation only when everyone cancelled**
   If **all** current waiters for a key have cancelled and the `factory` is still running:

* You may cancel the shared in-flight token (the one passed to `factory`) to avoid wasted work.

6. **No global lock**
   Your solution must not serialise different keys behind one lock. Per-key synchronisation is expected.

---

## Required semantics 

### Cache hit

If there is a cached value and `now < expiresAt`, return it immediately.

### Cache miss / expired

If missing or expired:

* If there is an in-flight task for this key, join it.
* Otherwise, start a new in-flight factory run.

### TTL edge cases

* If `ttl <= TimeSpan.Zero`, treat it as “immediately expired”: dedupe in-flight is still required, but there may be no meaningful cache hit afterwards.

### Locking rule

* Do not `await factory(...)` while holding a lock/semaphore. Use the lock only to decide start/join and to update shared state.

---

## Timeline examples

### A) Single-flight success

```
t0     A calls GetOrAdd(k)  -> starts factory F
t0+1ms B calls GetOrAdd(k)  -> joins F (no new factory)
t0+80  F completes with 42  -> cache set (expires at t0+80+ttl)
       A returns 42, B returns 42
```

### B) Caller cancellation does NOT cancel shared work

```
t0     A starts factory F
t0+1ms B joins F with callerToken cancelling at t0+30ms
t0+30  B cancels waiting -> B throws OperationCanceledException
t0+120 F completes -> A returns result, cache set
```

### C) Everyone cancels -> shared work may be cancelled

```
t0     A starts F
t0+1ms B joins F
t0+10  A cancels waiting
t0+20  B cancels waiting (waiters now 0) -> you may cancel shared token
       F observes cancellation -> no cache written
```

---

## What you may assume

* `factory` may complete fast or slow, throw synchronously or asynchronously, or honour cancellation.
* Many concurrent calls will happen.
* Correctness matters more than micro-optimisation, but avoid obvious bottlenecks.

---

## What is NOT required

* LRU/size-based eviction (bonus only).
* Background refresh/stale-while-revalidate.
* Distributed caching.

---

## Hints 

* `ConcurrentDictionary<TKey, Entry>` for entries.
* Per-entry synchronisation (e.g., `SemaphoreSlim`) to guard per-key state transitions.
* “Double-check” pattern: check cache → take gate → re-check cache/in-flight → start/join → release gate.
* Implement per-caller cancellation by racing the in-flight task against a cancellation signal (don’t cancel the shared task).

---

## Deliverable

Implement `GetOrAddAsync` and any helpers needed so it satisfies all behaviours above, including the cancellation semantics.
 