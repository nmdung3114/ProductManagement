
namespace ProductManagement.Domain.Entities;


public class RolePermission
{
    /// <summary>FK tới AspNetRoles.Id</summary>
    public Guid RoleId { get; set; }

    /// <summary>FK tới Permissions.Id</summary>
    public Guid PermissionId { get; set; }

    // Navigation properties
    public Permission Permission { get; set; } = null!;
}
