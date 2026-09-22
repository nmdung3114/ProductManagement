// ============================================================
// File: CreateOrderCommand.cs – Feature: Orders / CreateOrder
// Vai trò: Command tạo đơn hàng mới. Cả Admin và User đều có thể
// tạo đơn. UserId được truyền vào từ Controller (lấy từ JWT token).
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Orders.CreateOrder;

/// <summary>Item trong đơn hàng khi tạo mới.</summary>
public record OrderItemRequest(
    Guid ProductId,
    int Quantity);

/// <summary>Command tạo đơn hàng – tất cả vai trò đã đăng nhập.</summary>
public record CreateOrderCommand(
    Guid UserId,
    List<OrderItemRequest> Items) : IRequest<Guid>;
