namespace ProductManagement.Domain.Entities;
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;// Mô tả hành động (ví dụ: "Create", "Update", "Delete")
    public string EntityName { get; set; } = string.Empty;// Tên thực thể
    public string? EntityId { get; set; } = string.Empty;// Id của thực thể
    public string? OldValues { get; set; } = string.Empty;// Giá trị cũ (trước khi thay đổi) dangj JSON
    public string? NewValues { get; set; } = string.Empty;// Giá trị mới (sau khi thay đổi) dangj JSON
    public DateTime Timestamp { get; set;}

}