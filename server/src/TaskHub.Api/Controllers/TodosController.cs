using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.UseCases.Todos.Archive;
using TaskHub.Application.UseCases.Todos.Create;
using TaskHub.Application.UseCases.Todos.Delete;
using TaskHub.Application.UseCases.Todos.List;
using TaskHub.Application.UseCases.Todos.Restore;
using TaskHub.Application.UseCases.Todos.ToggleStatus;
using TaskHub.Application.UseCases.Todos.Update;

namespace TaskHub.Api.Controllers;

public class TodosController : BaseApiController
{
    private readonly CreateTodoHandler _createHandler;
    private readonly UpdateTodoHandler _updateHandler;
    private readonly ToggleStatusHandler _toggleStatusHandler;
    private readonly SoftDeleteTodoHandler _softDeleteHandler;
    private readonly HardDeleteTodoHandler _hardDeleteHandler;
    private readonly RestoreTodoHandler _restoreHandler;
    private readonly ListTodosHandler _listHandler;
    private readonly ArchiveTodosHandler _archiveHandler;

    public TodosController(
        CreateTodoHandler createHandler,
        UpdateTodoHandler updateHandler,
        ToggleStatusHandler toggleStatusHandler,
        SoftDeleteTodoHandler softDeleteHandler,
        HardDeleteTodoHandler hardDeleteHandler,
        RestoreTodoHandler restoreHandler,
        ListTodosHandler listHandler,
        ArchiveTodosHandler archiveHandler)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _toggleStatusHandler = toggleStatusHandler;
        _softDeleteHandler = softDeleteHandler;
        _hardDeleteHandler = hardDeleteHandler;
        _restoreHandler = restoreHandler;
        _listHandler = listHandler;
        _archiveHandler = archiveHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoCommand command)
    {
        var result = await _createHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        Response.Headers.Append("ETag", result.Value!.ETag);
        return Created(result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, error = "ID mismatch" });

        var result = await _updateHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        Response.Headers.Append("ETag", result.Value!.ETag);
        return Ok(result.Value);
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] ToggleStatusCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, error = "ID mismatch" });

        var result = await _toggleStatusHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        Response.Headers.Append("ETag", result.Value!.ETag);
        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(Guid id, [FromQuery] Guid orgId, [FromQuery] int version)
    {
        var command = new SoftDeleteTodoCommand(id, orgId, version);
        var result = await _softDeleteHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return NoContent();
    }

    [HttpDelete("{id}/hard")]
    public async Task<IActionResult> HardDelete(Guid id, [FromQuery] Guid orgId)
    {
        var command = new HardDeleteTodoCommand(id, orgId);
        var result = await _hardDeleteHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return NoContent();
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> Restore(Guid id, [FromBody] RestoreTodoCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, error = "ID mismatch" });

        var result = await _restoreHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ListTodosQuery query)
    {
        var result = await _listHandler.HandleAsync(query);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }

    [HttpPost("archive")]
    public async Task<IActionResult> Archive([FromBody] ArchiveTodosCommand command)
    {
        var result = await _archiveHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }
}