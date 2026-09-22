namespace ProductManagement.Infrastructure.Persistence.Configurations;
public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi =>oi.Id);
        builder.Property(oi => oi.OrderId)
            .IsRequired();
        builder.Property(oi => oi.ProductId)
            .IsRequired();
        builder.Property(oi => oi.Quantity)
            .IsRequired();
        builder.Property(oi => oi.UnitPrice)
            .HasPrecision(18, 2)
            .IsRequired();
        builder.Property(oi => oi.TotalPrice)
            .HasPrecision(18, 2)
            .IsRequired();
        builder.HasOne(p => p.Product)
            .WithMany(oi => oi.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict); // không cho phép xóa Product nếu có OrderItem liên quan
    }
}