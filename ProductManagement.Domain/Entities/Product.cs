// ============================================================
// File: Product.cs – Tầng Domain
// Vai trò: Entity đại diện cho sản phẩm trong hệ thống.
// Chứa toàn bộ business rules liên quan đến sản phẩm:
// validate dữ liệu đầu vào, các phương thức thay đổi trạng thái.
// Tuân theo nguyên tắc Encapsulation – chỉ expose qua methods.
// ============================================================

namespace ProductManagement.Domain.Entities;

public class Product
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    public string SKU { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public bool IsActive { get; private set; }
    public Guid CategoryId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public Category Category { get; private set; } = null!;
    public ICollection<OrderItem> OrderItems { get; private set; } = new List<OrderItem>();

    private Product() { } // Dùng cho EF Core – không được xóa

    /// <summary>Tạo sản phẩm mới với các thông tin cơ bản.</summary>
    public Product(string name, string sku, decimal price, int stock, Guid categoryId, string? description = null)
    {
        Validate(name, sku, price, stock, categoryId);

        Id = Guid.NewGuid();
        Name = name;
        SKU = sku;
        Price = price;
        Stock = stock;
        CategoryId = categoryId;
        Description = description ?? string.Empty;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>Cập nhật thông tin sản phẩm (Admin only).</summary>
    public void Update(string name, string sku, decimal price, int stock, Guid categoryId, string? description)
    {
        Validate(name, sku, price, stock, categoryId);

        Name = name;
        SKU = sku;
        Price = price;
        Stock = stock;
        CategoryId = categoryId;
        Description = description ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Điều chỉnh tồn kho (tăng hoặc giảm).</summary>
    public void AdjustStock(int delta)
    {
        if (Stock + delta < 0)
            throw new InvalidOperationException($"Tồn kho không đủ. Hiện tại: {Stock}, cần giảm: {-delta}.");

        Stock += delta;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Vô hiệu hóa sản phẩm (xóa mềm).</summary>
    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Kích hoạt lại sản phẩm.</summary>
    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    // Validate tập trung – dùng cả khi tạo mới và cập nhật
    private static void Validate(string name, string sku, decimal price, int stock, Guid categoryId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tên sản phẩm không được để trống.", nameof(name));
        if (name.Length > 200)
            throw new ArgumentException("Tên sản phẩm không được vượt quá 200 ký tự.", nameof(name));
        if (string.IsNullOrWhiteSpace(sku))
            throw new ArgumentException("SKU không được để trống.", nameof(sku));
        if (price < 0)
            throw new ArgumentException("Giá không được âm.", nameof(price));
        if (stock < 0)
            throw new ArgumentException("Tồn kho không được âm.", nameof(stock));
        if (categoryId == Guid.Empty)
            throw new ArgumentException("CategoryId không hợp lệ.", nameof(categoryId));
    }
}