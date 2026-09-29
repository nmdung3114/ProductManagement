// ============================================================
// File: IProductService.cs – Tầng Application / Common / Interfaces
// Vai trò: Interface định nghĩa các operations quản lý sản phẩm.
// Thuộc tầng Application – không phụ thuộc vào Infrastructure.
// Infrastructure sẽ triển khai chi tiết interface này (Dependency Inversion).
// ============================================================

using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IProductService
{
    /// <summary>Lấy danh sách sản phẩm có phân trang, bộ lọc và sắp xếp.</summary>
    Task<PagedResult<Product>> GetProductsAsync(
        string? name,
        string? sku,
        Guid? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        bool? isActive,
        string? sortBy,
        bool sortDescending,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Lấy chi tiết sản phẩm theo Id.</summary>
    Task<Product?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Tạo sản phẩm mới.</summary>
    Task<Guid> CreateProductAsync(
        string name,
        string sku,
        string? description,
        decimal price,
        int stock,
        Guid categoryId,
        CancellationToken cancellationToken = default);

    /// <summary>Cập nhật thông tin sản phẩm.</summary>
    Task UpdateProductAsync(
        Guid id,
        string name,
        string sku,
        string? description,
        decimal price,
        int stock,
        Guid categoryId,
        CancellationToken cancellationToken = default);

    /// <summary>Xóa mềm sản phẩm (IsActive = false).</summary>
    Task DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Khôi phục / kích hoạt lại sản phẩm (IsActive = true).</summary>
    Task RestoreProductAsync(Guid id, CancellationToken cancellationToken = default);
}
