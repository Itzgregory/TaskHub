namespace TaskHub.Domain.Exceptions;

public class ValidationException : DomainException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(Dictionary<string, string[]> errors)
        : base("validation_failed", "One or more validation errors occurred.")
    {
        Errors = errors;
    }

    public ValidationException(string field, string error)
        : base("validation_failed", "One or more validation errors occurred.")
    {
        Errors = new Dictionary<string, string[]>
        {
            { field, new[] { error } }
        };
    }
}