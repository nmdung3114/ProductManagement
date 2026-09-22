// ============================================================
// File: Category.cs – Tầng Domain
// Vai trò: Entity đại diện cho danh mục sản phẩm.
// Chứa các business rules: validate tên, mô tả, phương thức
// cập nhật và vô hiệu hóa danh mục.
// ============================================================

namespace ProductManagement.Domain.Entities;

public class Category
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation property
    public ICollection<Product> Products { get; set; } = new List<Product>();

    private Category() { } // Dùng cho EF Core – không được xóa

    /// <summary>Tạo danh mục mới.</summary>
    public Category(string name, string? description = null)
    {
        ValidateName(name);

        Id = Guid.NewGuid();
        Name = name;
        Description = description ?? string.Empty;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>Cập nhật thông tin danh mục (Admin only).</summary>
    public void Update(string name, string? description)
    {
        ValidateName(name);

        Name = name;
        Description = description ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Vô hiệu hóa danh mục (xóa mềm).</summary>
    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Kích hoạt lại danh mục.</summary>
    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tên danh mục không được để trống.", nameof(name));
        if (name.Length > 200)
            throw new ArgumentException("Tên danh mục không được vượt quá 200 ký tự.", nameof(name));
    }
}