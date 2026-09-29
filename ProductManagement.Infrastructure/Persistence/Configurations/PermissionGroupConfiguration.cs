using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence.Configurations;

public class PermissionGroupConfiguration : IEntityTypeConfiguration<PermissionGroup>{
    public void Configure(EntityTypeBuilder<PermissionGroup> builder){
        builder.ToTable("PermissionGroups");
        builder.HasKey(pg => pg.Id);

        builder.Property(pg => pg.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pg => pg.Description)
            .HasMaxLength(300);

        builder.Property(pg => pg.DisplayOrder)
            .HasDefaultValue(0);// dùng default value để tránh xung đột khi khởi tạo seed data

        // unique index trên name để tránh 2 group cùng tên
        builder.HasIndex(pg => pg.Name)
            .IsUnique();
    }
}