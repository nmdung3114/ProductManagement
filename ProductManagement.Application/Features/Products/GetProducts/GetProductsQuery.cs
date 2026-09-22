// ============================================================
// File: GetProductsQuery.cs – Feature: Products / GetProducts
// Vai trò: Query lấy danh sách sản phẩm với đầy đủ bộ lọc:
// tên, danh mục, khoảng giá, SKU, trạng thái; hỗ trợ phân trang
// và sắp xếp. Tất cả vai trò có thể truy cập.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Products.GetProducts;

/// <summary>Query lấy danh sách sản phẩm – tất cả vai trò.</summary>
public record GetProductsQuery(
    string? Name,           // Lọc theo tên (contains)
    string? SKU,            // Lọc theo SKU (contains)
    Guid? CategoryId,       // Lọc theo danh mục
    decimal? MinPrice,      // Lọc theo giá tối thiểu
    decimal? MaxPrice,      // Lọc theo giá tối đa
    bool? IsActive,         // Lọc theo trạng thái (null = tất cả)
    string? SortBy,         // Sắp xếp: "name", "price", "createdAt"
    bool SortDescending,    // Chiều sắp xếp
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<ProductDto>>;

/// <summary>DTO sản phẩm dùng trong danh sách.</summary>
public record ProductDto(
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
