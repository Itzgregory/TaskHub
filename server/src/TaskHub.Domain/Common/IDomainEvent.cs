namespace TaskHub.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredAt { get; }
}