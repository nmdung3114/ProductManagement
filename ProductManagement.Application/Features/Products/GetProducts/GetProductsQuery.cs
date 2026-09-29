// ============================================================
// File: GetProductsQuery.cs – Feature: Products / GetProducts
// Vai trò: Query lấy danh sách sản phẩm với bộ lọc và phân trang.
// Handler sẽ tự quyết định DTO và data scope dựa trên Role của
// người dùng hiện tại (ICurrentUserService).
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Products.GetProducts;

/// <summary>Query lấy danh sách sản phẩm – mọi role đã xác thực.</summary>
public record GetProductsQuery(
    string? Name,
    string? SKU,
    Guid? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    bool? IsActive,         // Null = áp dụng scope theo role; Admin/InventoryManager mới có thể lọc
    string? SortBy,
    bool SortDescending,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<object>>;

// ============================================================
// DTOs – phân tầng theo role/scope
// ============================================================

/// <summary>
/// DTO sản phẩm dành cho Customer & SalesStaff.
/// Không tiết lộ số lượng kho chính xác, không có SKU nội bộ, không có IsActive.
/// </summary>
public record ProductPublicDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    string CategoryName,
    bool InStock);         // true/false – không lộ con số cụ thể

/// <summary>
/// DTO sản phẩm dành cho InventoryManager & Admin.
/// Đầy đủ thông tin kho: SKU, số lượng tồn chính xác, IsActive.
/// </summary>
public record ProductInventoryDto(
    Guid Id,
    string Name,
    string SKU,
    string? Description,
    decimal Price,
    int Stock,             // Số lượng tồn chính xác
    bool IsActive,
    Guid CategoryId,
    string CategoryName,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
