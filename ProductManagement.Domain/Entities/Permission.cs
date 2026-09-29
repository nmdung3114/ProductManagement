

namespace ProductManagement.Domain.Entities;

public class Permission
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid PermissionGroupId { get; set; }
    public PermissionGroup PermissionGroup { get; set; } = null!;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
