using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.UseCases.Audit.List;

namespace TaskHub.Api.Controllers;

public class AuditController : BaseApiController
{
    private readonly ListAuditHandler _listHandler;

    public AuditController(ListAuditHandler listHandler)
    {
        _listHandler = listHandler;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ListAuditQuery query)
    {
        var result = await _listHandler.HandleAsync(query);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }
}