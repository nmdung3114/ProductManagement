namespace ProductManagement.Domain.Constants;

public static class Roles
{
    public const string Admin            = "Admin";
    public const string User             = "User";
    public const string InventoryManager = "InventoryManager"; // Quản lý kho & sản phẩm
    public const string SalesStaff       = "SalesStaff";       // Nhân viên bán hàng / xử lý đơn
    public const string Auditor          = "Auditor";          // Kiểm toán viên – chỉ xem

    /// <summary>Trả về tất cả roles hệ thống.</summary>
    public static IReadOnlyList<string> All =>
    [
        Admin, InventoryManager, SalesStaff, Auditor, User
    ];

    /// <summary>Kiểm tra role có phải internal staff không (không phải Customer).</summary>
    public static bool IsStaffRole(string role) =>
        role is Admin or InventoryManager or SalesStaff or Auditor;
}