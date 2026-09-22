// ============================================================
// File: GetCategoriesQuery.cs – Feature: Categories / GetCategories
// Vai trò: Query (yêu cầu đọc dữ liệu) để lấy danh sách danh mục
// có hỗ trợ phân trang và bộ lọc.
// Cả Admin và User đều có thể gọi endpoint này.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Features.Categories.GetCategories;

/// <summary>Query lấy danh sách danh mục – tất cả vai trò.</summary>
public record GetCategoriesQuery(
    string? Name,      // Lọc theo tên (contains)
    bool? IsActive,    // Lọc theo trạng thái (null = lấy tất cả)
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<CategoryDto>>;

/// <summary>DTO trả về thông tin danh mục trong danh sách.</summary>
public record CategoryDto(
    Guid Id,
    string Name,
    string Description,
    bool IsActive,
    int ProductCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
