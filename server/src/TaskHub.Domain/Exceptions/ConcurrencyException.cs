namespace TaskHub.Domain.Exceptions;

public class ConcurrencyConflictException : DomainException
{
    public ConcurrencyConflictException(string entityName, Guid id)
        : base("concurrency_conflict", 
            $"{entityName} with id '{id}' was modified by another request. Please reload and try again.")
    {
    }
}