// ============================================================
// File: OrderConfiguration.cs – Infrastructure / Persistence / Configurations
// Vai trò: Cấu hình mapping EF Core cho Order entity.
// Quan trọng: dùng PropertyAccessMode.Field để truy cập
// _items (private field) thay vì Items property.
// ============================================================

namespace ProductManagement.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.UserId).IsRequired();

        // Cấu hình Khóa ngoại (Foreign Key) liên kết tới bảng AspNetUsers (ApplicationUser)
        builder.HasOne<ProductManagement.Infrastructure.Identity.ApplicationUser>()
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(o => o.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(o => o.Status).IsRequired();
        builder.Property(o => o.CreatedAt).IsRequired();

        // Khi xóa Order thì xóa cascade các OrderItem liên quan
        builder.HasMany(o => o.Items)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Phải dùng Field access mode vì Items là IReadOnlyCollection (private _items)
        builder.Navigation(o => o.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}