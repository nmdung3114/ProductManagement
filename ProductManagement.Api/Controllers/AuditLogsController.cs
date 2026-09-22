using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.AuditLogs.GetAuditLogs;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Lấy danh sách nhật ký thao tác hệ thống (Audit Logs) – chỉ Admin.</summary>
    [HttpGet]
    [Authorize(Policy = Permissions.Role.View)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? entityName,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetAuditLogsQuery(entityName, action, page, pageSize),
            cancellationToken);

        return Ok(new
        {
            success = true,
            data = result.Items,
            pagination = new
            {
                result.Page,
                result.PageSize,
                result.TotalCount,
                result.TotalPages,
                result.HasPreviousPage,
                result.HasNextPage
            }
        });
    }
}
