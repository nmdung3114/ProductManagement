using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.UserId)
            .HasColumnName("UserId")   // Đặt tên cột tường minh
            .HasMaxLength(450)
            .IsRequired(false);

        builder.Property(a => a.UserName)
            .HasMaxLength(256)
            .IsRequired(false);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.EntityName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.EntityId)
            .HasMaxLength(450)
            .IsRequired(false);

        builder.Property(a => a.OldValues)
            .IsRequired(false);

        builder.Property(a => a.NewValues)
            .IsRequired(false);

        builder.Property(a => a.Timestamp)
            .IsRequired();

        // Indexes để tìm kiếm nhanh
        builder.HasIndex(a => a.EntityName);
        builder.HasIndex(a => a.Timestamp);
        builder.HasIndex(a => a.UserId);
    }
}
