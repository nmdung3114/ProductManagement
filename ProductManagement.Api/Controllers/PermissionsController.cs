using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Roles.GetPermissions;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PermissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Policy = Permissions.Role.View)]
    public async Task<IActionResult> GetPermissions(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPermissionsQuery(), cancellationToken);
        return Ok(new { success = true, data = result });
    }
}
