// ============================================================
// File: IOrderService.cs – Tầng Application / Common / Interfaces
// Vai trò: Interface định nghĩa các operations quản lý đơn hàng.
// Thuộc tầng Application – không phụ thuộc vào Infrastructure.
// Infrastructure sẽ triển khai chi tiết interface này (Dependency Inversion).
// ============================================================

using ProductManagement.Application.Common.Models;
using ProductManagement.Application.Features.Orders.CreateOrder;
using ProductManagement.Application.Features.Orders.UpdateOrderStatus;
using ProductManagement.Domain.Entities;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Common.Interfaces;

public interface IOrderService
{
    /// <summary>Admin: Lấy tất cả đơn hàng có lọc và phân trang.</summary>
    Task<PagedResult<Order>> GetAllOrdersAsync(
        Guid? userId,
        OrderStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>User: Lấy danh sách đơn hàng cá nhân có phân trang và lọc status.</summary>
    Task<PagedResult<Order>> GetMyOrdersAsync(
        Guid userId,
        OrderStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Lấy chi tiết đơn hàng theo Id.</summary>
    Task<Order?> GetOrderByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Tạo đơn hàng mới (trừ tồn kho và lưu vào DB).</summary>
    Task<Guid> CreateOrderAsync(
        Guid userId,
        IEnumerable<OrderItemRequest> items,
        CancellationToken cancellationToken = default);

    /// <summary>Cập nhật trạng thái đơn hàng (Confirm, Complete, Cancel).</summary>
    Task UpdateOrderStatusAsync(
        Guid orderId,
        OrderAction action,
        Guid requestingUserId,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}
