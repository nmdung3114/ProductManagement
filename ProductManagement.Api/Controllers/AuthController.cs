using MediatR;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Auth.Register;
using ProductManagement.Application.Features.Auth.Login;
using ProductManagement.Application.Features.Auth.RefreshToken;
using ProductManagement.Application.Features.Auth.RevokeToken;
using ProductManagement.Application.Features.Auth.GoogleLogin;


namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;   

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "đăng kí thành công" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new 
        { 
            message = "đăng nhập thành công", 
            token = result.AccessToken, 
            refreshToken = result.RefreshToken, // <-- Bổ sung trả về refreshToken
            expiresAt = result.ExpiresAt,
            user = result.User
        });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new
        {
            message = "Làm mới token thành công",
            token = result.AccessToken,
            refreshToken = result.RefreshToken,
            expiresAt = result.ExpiresAt,
            user = result.User
        });
    }

    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Thu hồi token thành công" });
    }
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new
        {
            message = "Đăng nhập bằng Google thành công",
            token = result.AccessToken,
            refreshToken = result.RefreshToken,
            expiresAt = result.ExpiresAt,
            user = result.User
        });
    }
}
