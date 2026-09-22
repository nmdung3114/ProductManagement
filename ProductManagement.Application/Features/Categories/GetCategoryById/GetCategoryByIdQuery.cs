// ============================================================
// File: GetCategoryByIdQuery.cs – Feature: Categories / GetCategoryById
// Vai trò: Query lấy chi tiết một danh mục theo Id,
// bao gồm danh sách sản phẩm trong danh mục đó.
// Tất cả vai trò đều có thể truy cập.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Categories.GetCategoryById;

/// <summary>Query lấy chi tiết danh mục theo Id.</summary>
public record GetCategoryByIdQuery(Guid Id) : IRequest<CategoryDetailDto>;

/// <summary>DTO chi tiết danh mục, bao gồm danh sách sản phẩm tóm tắt.</summary>
public record CategoryDetailDto(
    Guid Id,
    string Name,
    string Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<ProductSummaryDto> Products);

/// <summary>DTO tóm tắt sản phẩm trong danh mục.</summary>
public record ProductSummaryDto(
    Guid Id,
    string Name,
    string SKU,
    decimal Price,
    int Stock,
    bool IsActive);
