namespace ProductManagement.Domain.Entities;

public class PermissionGroup
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }   

    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}