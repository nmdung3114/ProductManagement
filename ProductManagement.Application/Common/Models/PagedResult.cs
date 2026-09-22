// ============================================================
// File: PagedResult.cs – Tầng Application / Common / Models
// Vai trò: Generic model dùng để bọc kết quả phân trang cho
// tất cả các query. Chứa dữ liệu + metadata phân trang
// (tổng bản ghi, tổng số trang, trang hiện tại, kích thước trang).
// ============================================================

namespace ProductManagement.Application.Common.Models;

/// <summary>
/// Kết quả phân trang generic – dùng cho mọi danh sách trả về.
/// </summary>
public class PagedResult<T>
{
    /// <summary>Danh sách dữ liệu của trang hiện tại.</summary>
    public IReadOnlyList<T> Items { get; }

    /// <summary>Tổng số bản ghi (không tính phân trang).</summary>
    public int TotalCount { get; }

    /// <summary>Trang hiện tại (bắt đầu từ 1).</summary>
    public int Page { get; }

    /// <summary>Số bản ghi mỗi trang.</summary>
    public int PageSize { get; }

    /// <summary>Tổng số trang.</summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    /// <summary>Có trang trước không.</summary>
    public bool HasPreviousPage => Page > 1;

    /// <summary>Có trang tiếp theo không.</summary>
    public bool HasNextPage => Page < TotalPages;

    public PagedResult(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }

    /// <summary>Factory method – tạo PagedResult từ một IQueryable (thực hiện phân trang trong DB).</summary>
    public static async Task<PagedResult<T>> CreateAsync(
        IQueryable<T> source,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        // Đảm bảo page và pageSize hợp lệ
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var totalCount = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .CountAsync(source, cancellationToken);

        var items = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .ToListAsync(source.Skip((page - 1) * pageSize).Take(pageSize), cancellationToken);

        return new PagedResult<T>(items.AsReadOnly(), totalCount, page, pageSize);
    }
}
