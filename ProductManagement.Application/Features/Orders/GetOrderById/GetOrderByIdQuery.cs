using MediatR;

namespace ProductManagement.Application.Features.Orders.GetOrderById;

/// <summary>Query lấy chi tiết đơn hàng.</summary>
public record GetOrderByIdQuery(
    Guid OrderId,
    Guid RequestingUserId,  // UserId của người đang request (từ JWT)
    bool IsAdmin            // Từ JWT claims
) : IRequest<OrderDetailDto>;

/// <summary>DTO chi tiết đơn hàng kèm danh sách sản phẩm.</summary>
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

/// <summary>DTO chi tiết từng item trong đơn hàng.</summary>
public record OrderItemDetailDto(
    Guid ProductId,
    string ProductName,
    string ProductSKU,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice);
