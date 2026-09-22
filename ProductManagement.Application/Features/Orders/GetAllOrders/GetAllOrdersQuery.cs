using MediatR;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Features.Orders.GetAllOrders;

/// <summary>Query lấy tất cả đơn hàng – chỉ Admin.</summary>
public record GetAllOrdersQuery(
    Guid? UserId,           // Lọc theo user cụ thể
    OrderStatus? Status,    // Lọc theo trạng thái
    DateTime? FromDate,     // Lọc từ ngày
    DateTime? ToDate,       // Lọc đến ngày
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<OrderAdminDto>>;

/// <summary>DTO đơn hàng dành cho Admin (có đầy đủ thông tin user và mã đơn).</summary>
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
