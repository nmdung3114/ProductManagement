
using ProductManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
namespace ProductManagement.Infrastructure.Identity;

public class ApplicationRole : IdentityRole<Guid>
{
    public string Description { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
