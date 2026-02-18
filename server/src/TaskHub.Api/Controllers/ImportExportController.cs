using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.UseCases.ImportExport.Export;
using TaskHub.Application.UseCases.ImportExport.Import;

namespace TaskHub.Api.Controllers;

public class ImportExportController : BaseApiController
{
    private readonly ExportTodosHandler _exportHandler;
    private readonly ImportTodosHandler _importHandler;

    public ImportExportController(
        ExportTodosHandler exportHandler,
        ImportTodosHandler importHandler)
    {
        _exportHandler = exportHandler;
        _importHandler = importHandler;
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] ExportTodosQuery query)
    {
        var result = await _exportHandler.HandleAsync(query);

        if (!result.IsSuccess)
            return BadRequest(result);

        var export = result.Value!;
        return File(
            System.Text.Encoding.UTF8.GetBytes(export.Content),
            export.ContentType,
            export.FileName);
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] ImportTodosCommand command)
    {
        var result = await _importHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }
}