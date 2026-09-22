// ============================================================
// File: UpdateOrderStatusCommand.cs – Feature: Orders / UpdateOrderStatus
// Vai trò: Command cập nhật trạng thái đơn hàng.
// - Admin: có thể Confirm, Complete bất kỳ đơn nào
// - User: chỉ được Cancel đơn của mình khi còn ở trạng thái Pending
// Logic phân quyền được xử lý trong Handler.
// ============================================================

using MediatR;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Features.Orders.UpdateOrderStatus;

/// <summary>Các hành động có thể thực hiện trên đơn hàng.</summary>
public enum OrderAction
{
    Confirm,   // Admin: Pending → Confirmed
    Complete,  // Admin: Confirmed → Completed
    Cancel     // Admin: Pending; User: Pending + là chủ đơn
}

/// <summary>Command cập nhật trạng thái đơn hàng.</summary>
public record UpdateOrderStatusCommand(
    Guid OrderId,
    OrderAction Action,
    Guid RequestingUserId,  // Từ JWT
    bool IsAdmin            // Từ JWT claims
) : IRequest<Unit>;
