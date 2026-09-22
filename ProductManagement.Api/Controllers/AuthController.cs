using MediatR;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Auth.Register;
using ProductManagement.Application.Features.Auth.Login;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Infrastructure.Identity;
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
            expiresAt = result.ExpiresAt,
            user = result.User
        });
    }
}