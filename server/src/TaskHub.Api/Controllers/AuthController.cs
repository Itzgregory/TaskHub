using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.UseCases.Auth.Login;
using TaskHub.Application.UseCases.Auth.Logout;
using TaskHub.Application.UseCases.Auth.Register;

namespace TaskHub.Api.Controllers;

public class AuthController : BaseApiController
{
    private readonly RegisterHandler _registerHandler;
    private readonly LoginHandler _loginHandler;
    private readonly LogoutHandler _logoutHandler;

    public AuthController(
        RegisterHandler registerHandler,
        LoginHandler loginHandler,
        LogoutHandler logoutHandler)
    {
        _registerHandler = registerHandler;
        _loginHandler = loginHandler;
        _logoutHandler = logoutHandler;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _registerHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Created(result.Value);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _loginHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        // TODO: Set session cookie with user info
        // For now just return success
        return Ok(result.Value);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _logoutHandler.HandleAsync(new LogoutCommand());

        // TODO: Clear session cookie
        return NoContent();
    }
}