

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Identity;
namespace ProductManagement.Infrastructure.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("RolePermissions");

        // Composite primary key
        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });

        // FK tới AspNetRoles
        builder.HasOne<ApplicationRole>()
            .WithMany()
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK tới Permissions
        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
