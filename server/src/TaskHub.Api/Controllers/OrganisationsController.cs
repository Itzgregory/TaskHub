using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.UseCases.Organisations.AddMember;
using TaskHub.Application.UseCases.Organisations.ChangeRole;
using TaskHub.Application.UseCases.Organisations.Create;
using TaskHub.Application.UseCases.Organisations.ListUserOrgs;
using TaskHub.Application.UseCases.Organisations.ListMembers;
using TaskHub.Application.UseCases.Organisations.RemoveMember;
using TaskHub.Application.UseCases.Organisations.SetActiveOrg;

namespace TaskHub.Api.Controllers;

public class OrganisationsController : BaseApiController
{
    private readonly CreateOrgHandler _createHandler;
    private readonly AddMemberHandler _addMemberHandler;
    private readonly RemoveMemberHandler _removeMemberHandler;
    private readonly ChangeRoleHandler _changeRoleHandler;
    private readonly ListUserOrgsHandler _listUserOrgsHandler;
    private readonly ListMembersHandler _listMembersHandler;
    private readonly SetActiveOrgHandler _setActiveOrgHandler;

    public OrganisationsController(
        CreateOrgHandler createHandler,
        AddMemberHandler addMemberHandler,
        RemoveMemberHandler removeMemberHandler,
        ChangeRoleHandler changeRoleHandler,
        ListUserOrgsHandler listUserOrgsHandler,
        SetActiveOrgHandler setActiveOrgHandler,
        ListMembersHandler listMembersHandler)
    {
        _createHandler = createHandler;
        _addMemberHandler = addMemberHandler;
        _removeMemberHandler = removeMemberHandler;
        _changeRoleHandler = changeRoleHandler;
        _listUserOrgsHandler = listUserOrgsHandler;
        _setActiveOrgHandler = setActiveOrgHandler;
        _listMembersHandler = listMembersHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrgCommand command)
    {
        var result = await _createHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Created(result.Value);
    }

    [HttpGet("me")]
    public async Task<IActionResult> ListMyOrganisations()
    {
        var result = await _listUserOrgsHandler.HandleAsync(new ListUserOrgsQuery());

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }

    [HttpPost("set-active")]
    public async Task<IActionResult> SetActiveOrg([FromBody] SetActiveOrgCommand command)
    {
        var result = await _setActiveOrgHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return NoContent();
    }

    [HttpGet("{orgId:guid}/members")]
    public async Task<IActionResult> ListMembers(Guid orgId)
    {
        var result = await _listMembersHandler.HandleAsync(
            new ListMembersQuery(orgId));

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }

    [HttpPost("{orgId}/members")]
    public async Task<IActionResult> AddMember(Guid orgId, [FromBody] AddMemberCommand command)
    {
        if (orgId != command.OrgId)
            return BadRequest("Organisation ID mismatch");

        var result = await _addMemberHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Created(result.Value);
    }

    [HttpDelete("{orgId}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(Guid orgId, Guid userId)
    {
        var command = new RemoveMemberCommand(orgId, userId);
        var result = await _removeMemberHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return NoContent();
    }

    [HttpPatch("{orgId}/members/{userId}/role")]
    public async Task<IActionResult> ChangeRole(Guid orgId, Guid userId, [FromBody] ChangeRoleCommand command)
    {
        if (orgId != command.OrgId || userId != command.UserId)
            return BadRequest("ID mismatch");

        var result = await _changeRoleHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return NoContent();
    }
}
