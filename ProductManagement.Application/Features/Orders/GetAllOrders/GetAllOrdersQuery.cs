// ============================================================
// File: GetAllOrdersQuery.cs – Feature: Orders / GetAllOrders
// Vai trò: Query lấy tất cả đơn hàng.
// Handler tự quyết định DTO & data scope theo Role của user.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Features.Orders.GetAllOrders;

/// <summary>Query lấy tất cả đơn hàng – Admin, SalesStaff, Auditor, InventoryManager.</summary>
public record GetAllOrdersQuery(
    Guid? UserId,
    OrderStatus? Status,
    DateTime? FromDate,
    DateTime? ToDate,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<object>>;

// ============================================================
// DTOs phân tầng
// ============================================================

/// <summary>
/// DTO đơn hàng cho Admin – đầy đủ thông tin gồm UserId, email khách hàng.
/// </summary>
public record OrderAdminDto(
    Guid Id,
    Guid UserId,
    string? UserFullName,
    string? UserEmail,
    string OrderCode,
    decimal TotalAmount,
    string Status,
    int ItemCount,
    DateTime CreatedAt);

/// <summary>
/// DTO đơn hàng cho SalesStaff & Auditor – không có UserId/email nội bộ.
/// Chỉ hiển thị tên khách hàng (không có email), mã đơn, tổng tiền, trạng thái.
/// </summary>
public record OrderStaffDto(
    Guid Id,
    string CustomerName,   // Tên hiển thị – không lộ UserId
    string OrderCode,
    decimal TotalAmount,
    string Status,
    int ItemCount,
    DateTime CreatedAt);
