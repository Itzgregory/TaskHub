using System.Text.RegularExpressions;

namespace TaskHub.Application.Common.Security;

public static class SecuritySanitizer
{
    // SQL injection detection patterns
    private static readonly string[] SqlInjectionPatterns = new[]
    {
        "--",
        ";",
        "/*",
        "*/",
        "@@",
        "@",
        "char",
        "nchar",
        "varchar",
        "nvarchar",
        "alter",
        "begin",
        "cast",
        "create",
        "cursor",
        "declare",
        "delete",
        "drop",
        "end",
        "exec",
        "execute",
        "fetch",
        "insert",
        "kill",
        "select",
        "sys",
        "sysobjects",
        "syscolumns",
        "table",
        "update"
    };

    /// <summary>
    /// Sanitizes input by trimming and removing control characters
    /// </summary>
    public static string SanitizeInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Trim whitespace
        var sanitized = input.Trim();

        // Remove any null characters
        sanitized = sanitized.Replace("\0", string.Empty);

        // Remove any control characters except common ones
        sanitized = new string(sanitized
            .Where(c => !char.IsControl(c) || c == '\r' || c == '\n')
            .ToArray());

        return sanitized;
    }

    /// <summary>
    /// Checks if input contains potential SQL injection patterns
    /// </summary>
   public static bool ContainsSqlInjection(string input)
{
    if (string.IsNullOrWhiteSpace(input))
        return false;

    var lowerInput = input.ToLowerInvariant();

    // Check for SQL injection patterns
    foreach (var pattern in SqlInjectionPatterns)
    {
        // Skip "@" pattern if it's part of an email format
        if (pattern == "@" && input.Contains('@') && IsValidEmailFormat(input))
        {
            continue;  // Skip this check for email addresses
        }
        
        if (lowerInput.Contains(pattern.ToLowerInvariant()))
        {
            return true;
        }
    }

    // Check for SQL comments
    if (input.Contains("--") || 
        input.Contains("/*") || 
        input.Contains("*/"))
    {
        return true;
    }

    // Check for stacked queries
    if (input.Contains(';') && 
        !input.Contains("&#59;") && // HTML encoded
        !input.Contains("%3B"))     // URL encoded
    {
        return true;
    }

    // Check for common SQL functions with parentheses
    var sqlFunctionPattern = @"\b(select|insert|update|delete|drop|union|exec|execute)\s*\(";
    if (Regex.IsMatch(lowerInput, sqlFunctionPattern, RegexOptions.IgnoreCase, TimeSpan.FromSeconds(1)))
    {
        return true;
    }

    return false;
}

// Helper method
private static bool IsValidEmailFormat(string input)
{
    return input.Contains('@') && 
           input.IndexOf('@') == input.LastIndexOf('@') && // Only one @
           input.IndexOf('@') > 0 && // Something before @
           input.IndexOf('@') < input.Length - 1; // Something after @
}
    /// <summary>
    /// Comprehensive input validation - sanitizes AND checks for SQL injection
    /// </summary>
    public static string ValidateAndSanitize(string input, string fieldName, Dictionary<string, string[]> errors)
    {
        var sanitized = SanitizeInput(input);

        if (ContainsSqlInjection(sanitized))
        {
            errors[fieldName] = new[] { $"{fieldName} contains invalid characters." };
            return string.Empty;
        }

        return sanitized;
    }

    /// <summary>
    /// HTML encodes a string to prevent XSS attacks
    /// </summary>
    public static string HtmlEncode(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return System.Net.WebUtility.HtmlEncode(input);
    }

    /// <summary>
    /// URL encodes a string
    /// </summary>
    public static string UrlEncode(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return System.Net.WebUtility.UrlEncode(input);
    }

    /// <summary>
    /// Removes any potentially dangerous HTML/JavaScript tags
    /// </summary>
    public static string StripHtmlTags(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return Regex.Replace(input, @"<[^>]*>", string.Empty);
    }
}