namespace ProductManagement.Infrastructure.Persistence.Configurations;
public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);
        builder.HasIndex(c => c.Name)
            .IsUnique();
        builder.Property(c => c.Description)
            .HasMaxLength(1000);
        builder.Property(c => c.IsActive)
            .IsRequired();
        builder.Property(c => c.CreatedAt)
            .IsRequired();
        builder.Property(c => c.UpdatedAt);
    }
}