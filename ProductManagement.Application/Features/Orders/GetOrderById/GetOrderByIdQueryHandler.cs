// ============================================================
// File: GetOrderByIdQueryHandler.cs – Feature: Orders / GetOrderById
// Vai trò: Handler lấy chi tiết đơn hàng với Data Scoping theo Role.
//
// SCOPING RULES:
//   Admin        → xem tất cả đơn, nhận OrderDetailDto (có UserId, email)
//   SalesStaff   → xem tất cả đơn (không giới hạn userId), nhận OrderDetailStaffDto
//   Auditor      → xem tất cả đơn (readonly), nhận OrderDetailStaffDto
//   InventoryManager → xem tất cả đơn, nhận OrderDetailStaffDto
//   Customer/User → chỉ xem đơn của chính mình, nhận OrderDetailStaffDto
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;
using DomainRoles = ProductManagement.Domain.Constants.Roles;

namespace ProductManagement.Application.Features.Orders.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, object>
{
    private readonly IOrderService _orderService;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUser;

    public GetOrderByIdQueryHandler(
        IOrderService orderService,
        IIdentityService identityService,
        ICurrentUserService currentUser)
    {
        _orderService = orderService;
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task<object> Handle(
        GetOrderByIdQuery request,
        CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng", request.OrderId);

        // ── Data Scope: User/Customer chỉ xem đơn của chính mình ────
        bool isStaff = _currentUser.IsInAnyRole(
            DomainRoles.Admin, DomainRoles.SalesStaff, DomainRoles.Auditor, DomainRoles.InventoryManager);

        if (!isStaff && order.UserId != request.RequestingUserId)
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này.");

        // ── Lấy thông tin user ───────────────────────────────────────
        var userSummary = await _identityService.GetUserSummaryAsync(order.UserId, cancellationToken);

        // ── Build items ──────────────────────────────────────────────
        var itemDtos = order.Items.Select(i => new OrderItemDetailDto(
            i.ProductId,
            i.Product?.Name ?? "Sản phẩm không còn tồn tại",
            i.Product?.SKU ?? "N/A",
            i.Quantity,
            i.UnitPrice,
            i.TotalPrice
        )).ToList().AsReadOnly();

        string orderCode = order.Id.ToString()[..8].ToUpper();
        string customerName = userSummary.HasValue && !string.IsNullOrEmpty(userSummary.Value.FullName)
            ? userSummary.Value.FullName
            : "Khách hàng";

        // ── DTO Mapping theo Role ────────────────────────────────────
        if (_currentUser.IsInRole(DomainRoles.Admin))
        {
            return new OrderDetailDto(
                order.Id,
                order.UserId,
                customerName,
                userSummary?.Email ?? "",
                orderCode,
                order.TotalAmount,
                order.Status.ToString(),
                order.CreatedAt,
                itemDtos);
        }

        // SalesStaff / Auditor / InventoryManager / Customer
        return new OrderDetailStaffDto(
            order.Id,
            customerName,
            orderCode,
            order.TotalAmount,
            order.Status.ToString(),
            order.CreatedAt,
            itemDtos);
    }
}
