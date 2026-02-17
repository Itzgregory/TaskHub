namespace TaskHub.Domain.Exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, Guid id)
        : base("not_found", $"{entityName} with id '{id}' was not found.")
    {
    }
}