// ============================================================
// File: ICategoryService.cs – Tầng Application / Common / Interfaces
// Vai trò: Interface định nghĩa các operations của CategoryService.
// Thuộc tầng Application – không phụ thuộc vào Infrastructure.
// Infrastructure sẽ implement interface này (Dependency Inversion).
// ============================================================

using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface ICategoryService
{
    /// <summary>Lấy danh sách danh mục có phân trang và bộ lọc.</summary>
    Task<PagedResult<Category>> GetCategoriesAsync(
        string? name,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Lấy chi tiết một danh mục theo Id.</summary>
    Task<Category?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Tạo danh mục mới.</summary>
    Task<Guid> CreateCategoryAsync(string name, string? description, CancellationToken cancellationToken = default);

    /// <summary>Cập nhật danh mục.</summary>
    Task UpdateCategoryAsync(Guid id, string name, string? description, CancellationToken cancellationToken = default);

    /// <summary>Xóa mềm danh mục (IsActive = false).</summary>
    Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default);
}