using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Roles.CreateRole;
using ProductManagement.Application.Features.Roles.DeleteRole;
using ProductManagement.Application.Features.Roles.GetRoleById;
using ProductManagement.Application.Features.Roles.GetRoles;
using ProductManagement.Application.Features.Roles.UpdateRolePermissions;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RolesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Policy = Permissions.Role.View)] // Xem danh sách Role
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetRolesQuery(), cancellationToken);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.Role.View)] // Xem chi tiết Role
    public async Task<IActionResult> GetRoleById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetRoleByIdQuery(id), cancellationToken);
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    [Authorize(Policy = Permissions.Role.Create)] // Tạo Role mới
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleCommand command, CancellationToken cancellationToken)
    {
        var roleId = await _mediator.Send(command, cancellationToken);
        return Ok(new { success = true, data = roleId, message = "Tạo Role thành công." });
    }

    [HttpPut("{id:guid}/permissions")]
    [Authorize(Policy = Permissions.Role.Update)] // Cập nhật quyền cho Role
    public async Task<IActionResult> UpdateRolePermissions(Guid id, [FromBody] UpdatePermissionsRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new UpdateRolePermissionsCommand(id, request.PermissionIds), cancellationToken);
        return Ok(new { success = true, message = "Cập nhật quyền thành công." });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.Role.Delete)] // Xóa Role
    public async Task<IActionResult> DeleteRole(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteRoleCommand(id), cancellationToken);
        return Ok(new { success = true, message = "Xóa Role thành công." });
    }
}

public record UpdatePermissionsRequest(List<Guid> PermissionIds);
