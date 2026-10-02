
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Identity;

namespace ProductManagement.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Token)
            .IsRequired()
            .HasMaxLength(256);

        // Đánh chỉ mục Index cho cột Token để khi tìm kiếm token đạt tốc độ O(1)
        builder.HasIndex(x => x.Token)
            .IsUnique();

        // Tạo quan hệ với ApplicationUser (một user có thể có nhiều refresh token từ nhiều thiết bị)
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
