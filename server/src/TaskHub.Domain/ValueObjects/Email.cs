using TaskHub.Domain.Common;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Domain.ValueObjects;

public class Email : ValueObject
{
    public string Value { get; }

    private const int MaxLength = 254;
    private static readonly System.Text.RegularExpressions.Regex ValidPattern =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", System.Text.RegularExpressions.RegexOptions.Compiled);

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException("email", "Email cannot be empty.");

        if (value.Length > MaxLength)
            throw new ValidationException("email", $"Email cannot exceed {MaxLength} characters.");

        if (!ValidPattern.IsMatch(value))
            throw new ValidationException("email", "Email format is invalid.");

        Value = value.ToLowerInvariant();
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}