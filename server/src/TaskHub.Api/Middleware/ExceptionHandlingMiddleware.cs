using System.Text.Json;
using TaskHub.Domain.Exceptions;

namespace TaskHub.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? "unknown";

        _logger.LogError(exception, "Unhandled exception. CorrelationId: {CorrelationId}", correlationId);

        var (statusCode, problemDetails) = exception switch
        {
            ValidationException validationEx => (422, CreateProblemDetails(
                "Validation Failed",
                "One or more validation errors occurred.",
                422,
                context.Request.Path,
                correlationId,
                "VALIDATION_FAILED",
                validationEx.Errors)),

            NotFoundException notFoundEx => (404, CreateProblemDetails(
                "Not Found",
                notFoundEx.Message,
                404,
                context.Request.Path,
                correlationId,
                "NOT_FOUND")),

            ForbiddenException forbiddenEx => (403, CreateProblemDetails(
                "Forbidden",
                forbiddenEx.Message,
                403,
                context.Request.Path,
                correlationId,
                "FORBIDDEN")),

            ConcurrencyConflictException concurrencyEx => (412, CreateProblemDetails(
                "Precondition Failed",
                concurrencyEx.Message,
                412,
                context.Request.Path,
                correlationId,
                "CONCURRENCY_CONFLICT")),

            BusinessRuleException businessEx => (400, CreateProblemDetails(
                "Business Rule Violation",
                businessEx.Message,
                400,
                context.Request.Path,
                correlationId,
                "BUSINESS_RULE_VIOLATION")),

            DomainException domainEx => (400, CreateProblemDetails(
                "Domain Error",
                domainEx.Message,
                400,
                context.Request.Path,
                correlationId,
                "DOMAIN_ERROR")),

            _ => (500, CreateProblemDetails(
                "Internal Server Error",
                "An unexpected error occurred. Please try again later.",
                500,
                context.Request.Path,
                correlationId,
                "INTERNAL_SERVER_ERROR"))
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }

    private static object CreateProblemDetails(
        string title,
        string detail,
        int status,
        string instance,
        string correlationId,
        string code = "UNKNOWN_ERROR",
        IReadOnlyDictionary<string, string[]>? errors = null)
    {
        var problemDetails = new Dictionary<string, object>
        {
            ["type"] = "https://tools.ietf.org/html/rfc7807",
            ["title"] = title,
            ["status"] = status,
            ["detail"] = detail,
            ["code"] = code,
            ["instance"] = instance,
            ["correlationId"] = correlationId
        };

        if (errors != null && errors.Any())
        {
            problemDetails["errors"] = errors;
        }

        return problemDetails;
    }
}