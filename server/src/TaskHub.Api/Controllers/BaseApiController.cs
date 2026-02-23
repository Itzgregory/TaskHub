using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.Common.Models;

namespace TaskHub.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected IActionResult Ok<T>(T data)
    {
        return base.Ok(new
        {
            success = true,
            data
        });
    }

    protected IActionResult Created<T>(T data)
    {
        return StatusCode(201, new
        {
            success = true,
            data
        });
    }

    protected new IActionResult NoContent()
    {
        return base.NoContent();
    }

    /// <summary>
    /// Returns a 400 Bad Request using Result failure — ProblemDetails format.
    /// </summary>
    protected IActionResult BadRequest<T>(Result<T> result)
    {
        return base.BadRequest(CreateProblemDetails(
            title: "Bad Request",
            detail: result.ErrorMessage ?? "An error occurred.",
            code: result.ErrorCode
        ));
    }

    /// <summary>
    /// Returns a 400 Bad Request from a plain error message — ProblemDetails format.
    /// </summary>
    protected IActionResult BadRequest(string detail, string code = "BAD_REQUEST")
    {
        return base.BadRequest(CreateProblemDetails(
            title: "Bad Request",
            detail: detail,
            code: code
        ));
    }

    private object CreateProblemDetails(string title, string detail, string? code = null)
    {
        var correlationId = HttpContext.Items["CorrelationId"]?.ToString() ?? "unknown";

        return new
        {
            type = "https://tools.ietf.org/html/rfc7807",
            title,
            status = 400,
            detail,
            code = code ?? "BAD_REQUEST",
            instance = HttpContext.Request.Path.ToString(),
            correlationId
        };
    }
}