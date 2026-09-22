// ============================================================
// File: ProductConfiguration.cs – Infrastructure / Persistence / Configurations
// Vai trò: Cấu hình mapping Entity Framework Core cho Product.
// Định nghĩa constraints DB: độ dài cột, unique index SKU,
// precision giá tiền, quan hệ với Category.
// ============================================================

namespace ProductManagement.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        // SKU phải unique trong toàn bộ hệ thống
        builder.HasIndex(p => p.SKU)
            .IsUnique();

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        // Giá tiền dùng precision(18,2) để tránh lỗi làm tròn
        builder.Property(p => p.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.Stock).IsRequired();
        builder.Property(p => p.IsActive).IsRequired();
        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.UpdatedAt);
        builder.Property(p => p.CategoryId).IsRequired();

        // Quan hệ Product → Category: không cho xóa Category nếu còn Product
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}