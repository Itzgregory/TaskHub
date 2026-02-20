using System.Collections.Concurrent;
using TaskHub.Domain.Entities;

namespace TaskHub.Infrastructure.Persistence.InMemory;

public class InMemoryDatabase
{
    public ConcurrentDictionary<Guid, User> Users { get; } = new();
    public ConcurrentDictionary<Guid, Organisation> Organisations { get; } = new();
    public ConcurrentDictionary<Guid, Membership> Memberships { get; } = new();
    public ConcurrentDictionary<Guid, TodoItem> Todos { get; } = new();
    public ConcurrentDictionary<Guid, AuditEntry> AuditEntries { get; } = new();
    public ConcurrentDictionary<Guid, Session> Sessions { get; } = new();
}
