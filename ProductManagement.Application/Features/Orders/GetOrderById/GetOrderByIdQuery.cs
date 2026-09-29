// ============================================================
// File: GetOrderByIdQuery.cs – Feature: Orders / GetOrderById
// Vai trò: Query lấy chi tiết đơn hàng theo Id.
// Handler áp dụng data scope theo role.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Orders.GetOrderById;

/// <summary>Query lấy chi tiết đơn hàng.</summary>
public record GetOrderByIdQuery(
    Guid OrderId,
    Guid RequestingUserId,  // UserId của người đang request (từ JWT)
    bool IsAdmin            // true nếu Admin
) : IRequest<object>;

// ============================================================
// DTOs phân tầng
// ============================================================

/// <summary>
/// DTO chi tiết đơn hàng cho Admin – bao gồm UserId và email khách hàng.
/// </summary>
public record OrderDetailDto(
    Guid Id,
    Guid UserId,
    string? UserFullName,
    string? UserEmail,
    string OrderCode,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDetailDto> Items);

/// <summary>
/// DTO chi tiết đơn hàng cho SalesStaff, Auditor, Customer.
/// Không có UserId và UserEmail nội bộ.
/// </summary>
public record OrderDetailStaffDto(
    Guid Id,
    string CustomerName,
    string OrderCode,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDetailDto> Items);

/// <summary>DTO chi tiết từng item trong đơn hàng.</summary>
public record OrderItemDetailDto(
    Guid ProductId,
    string ProductName,
    string ProductSKU,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice);
