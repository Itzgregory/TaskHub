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

        // Set session cookie so user is authenticated for onboarding
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(24)
        };
        Response.Cookies.Append("session_token", result.Value!.SessionToken, cookieOptions);

        return Created(result.Value);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _loginHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        // Set session cookie (Secure = false in dev so cookie is sent over HTTP)
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(24)
        };

        Response.Cookies.Append("session_token", result.Value!.SessionToken, cookieOptions);

        return Ok(result.Value);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _logoutHandler.HandleAsync(new LogoutCommand());

        // Clear session cookie
        Response.Cookies.Delete("session_token");

        return NoContent();
    }
}
