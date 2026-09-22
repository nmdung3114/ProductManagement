// ============================================================
// File: GetProductByIdQuery.cs – Feature: Products / GetProductById
// Vai trò: Query lấy chi tiết một sản phẩm theo Id.
// Tất cả vai trò đều có thể truy cập.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Products.GetProductById;

/// <summary>Query lấy chi tiết sản phẩm theo Id.</summary>
public record GetProductByIdQuery(Guid Id) : IRequest<ProductDetailDto>;

/// <summary>DTO chi tiết đầy đủ của sản phẩm.</summary>
public record ProductDetailDto(
    Guid Id,
    string Name,
    string SKU,
    string Description,
    decimal Price,
    int Stock,
    bool IsActive,
    Guid CategoryId,
    string CategoryName,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
