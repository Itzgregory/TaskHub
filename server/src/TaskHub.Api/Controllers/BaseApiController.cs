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

    protected IActionResult NoContent()
    {
        return base.NoContent();
    }

    protected IActionResult BadRequest<T>(Result<T> result)
    {
        return base.BadRequest(new
        {
            success = false,
            error = new
            {
                code = result.ErrorCode,
                message = result.ErrorMessage
            }
        });
    }
}