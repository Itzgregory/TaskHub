using TaskHub.Domain.Common;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Domain.ValueObjects;

public class Tag : ValueObject
{
    public string Value { get; }

    private const int MaxLength = 50;
    private static readonly System.Text.RegularExpressions.Regex ValidPattern =
        new(@"^[a-zA-Z0-9\-]+$", System.Text.RegularExpressions.RegexOptions.Compiled);

    public Tag(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException("tag", "Tag cannot be empty.");

        if (value.Length > MaxLength)
            throw new ValidationException("tag", $"Tag cannot exceed {MaxLength} characters.");

        if (!ValidPattern.IsMatch(value))
            throw new ValidationException("tag", "Tag can only contain letters, numbers, and hyphens.");

        Value = value.ToLowerInvariant();
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}