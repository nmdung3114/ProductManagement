

namespace ProductManagement.Domain.Entities;

public class Permission
{
    public Guid Id { get; set; }

    /// <summary>
    /// Tên permission, ví dụ: "Category.Create". Phải là duy nhất.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Nhóm permission, ví dụ: "Quản lý danh mục".
    /// </summary>
    public string? Group { get; set; } = string.Empty;

    /// <summary>Mô tả ngắn gọn về permission này.</summary>
    public string? Description { get; set; }

    // Navigation property
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
