

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Orders.CreateOrder;
using ProductManagement.Application.Features.Orders.GetAllOrders;
using ProductManagement.Application.Features.Orders.GetMyOrders;
using ProductManagement.Application.Features.Orders.GetOrderById;
using ProductManagement.Application.Features.Orders.UpdateOrderStatus;
using ProductManagement.Domain.Constants;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoints yêu cầu đăng nhập
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Helper: Lấy UserId từ JWT token
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Không thể xác định người dùng.");
    }

    // Helper: Kiểm tra người dùng hiện tại có phải Admin không
    private bool IsAdmin() => User.IsInRole(Roles.Admin)
                              || User.HasClaim(ClaimTypes.Role, Roles.Admin)
                              || User.HasClaim("role", Roles.Admin);

    /// <summary>Tạo đơn hàng mới – tất cả đã đăng nhập.</summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        var items = request.Items.Select(i => new OrderItemRequest(i.ProductId, i.Quantity)).ToList();

        var orderId = await _mediator.Send(new CreateOrderCommand(userId, items), cancellationToken);

        return CreatedAtAction(nameof(GetOrderById), new { id = orderId },
            new { success = true, message = "Tạo đơn hàng thành công.", orderId });
    }

    /// <summary>Xem đơn hàng của bản thân – tất cả đã đăng nhập.</summary>
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(
            new GetMyOrdersQuery(userId, status, page, pageSize),
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

    /// <summary>Xem tất cả đơn hàng – chỉ Admin.</summary>
    [HttpGet]
    [Authorize(Policy = Permissions.Order.View)]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] Guid? userId,
        [FromQuery] OrderStatus? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetAllOrdersQuery(userId, status, fromDate, toDate, page, pageSize),
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

    /// <summary>Xem chi tiết đơn hàng – Admin xem tất cả, User chỉ xem của mình.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var requestingUserId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        var result = await _mediator.Send(
            new GetOrderByIdQuery(id, requestingUserId, isAdmin),
            cancellationToken);

        return Ok(new { success = true, data = result });
    }

    /// <summary>Cập nhật trạng thái đơn hàng.</summary>
    /// <remarks>
    /// Admin: Confirm, Complete, Cancel.
    /// User: chỉ Cancel đơn của mình khi còn Pending.
    /// </remarks>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "Order.UpdateStatus")]
    public async Task<IActionResult> UpdateOrderStatus(
        Guid id,
        [FromBody] UpdateOrderStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var requestingUserId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        await _mediator.Send(
            new UpdateOrderStatusCommand(id, request.Action, requestingUserId, isAdmin),
            cancellationToken);

        return Ok(new { success = true, message = "Cập nhật trạng thái đơn hàng thành công." });
    }
}

/// <summary>Item khi tạo đơn hàng.</summary>
public record CreateOrderItemRequest(Guid ProductId, int Quantity);

/// <summary>Request body khi tạo đơn hàng.</summary>
public record CreateOrderRequest(List<CreateOrderItemRequest> Items);

/// <summary>Request body khi cập nhật trạng thái đơn hàng.</summary>
public record UpdateOrderStatusRequest(OrderAction Action);
