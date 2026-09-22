using Microsoft.AspNetCore.Identity;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation property tới danh sách đơn hàng
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    // Lưu ý: AuditLog.UserId là string thuần (không phải FK thật),
    // nên KHAI BÁO navigation property ở đây sẽ khiến EF Core tự tạo shadow FK sai.
}
