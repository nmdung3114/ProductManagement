// ============================================================
// File: GetMyOrdersQuery.cs – Feature: Orders / GetMyOrders
// Vai trò: Query để User xem đơn hàng của chính mình.
// Hỗ trợ lọc theo trạng thái và phân trang.
// UserId được Controller truyền vào từ JWT claims.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Features.Orders.GetMyOrders;

/// <summary>Query lấy đơn hàng của user hiện tại.</summary>
public record GetMyOrdersQuery(
    Guid UserId,
    OrderStatus? Status,    // Lọc theo trạng thái (null = tất cả)
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<OrderSummaryDto>>;

/// <summary>DTO tóm tắt đơn hàng trong danh sách.</summary>
public record OrderSummaryDto(
    Guid Id,
    decimal TotalAmount,
    string Status,
    int ItemCount,
    DateTime CreatedAt);
