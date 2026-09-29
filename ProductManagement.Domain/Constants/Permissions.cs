

namespace ProductManagement.Domain.Constants;

public static class Permissions
{
    public static class Category
    {
        public const string View   = "Category.View";
        public const string Create = "Category.Create";
        public const string Update = "Category.Update";
        public const string Delete = "Category.Delete";
    } 

    public static class Product
    {
        public const string View   = "Product.View";
        public const string Create = "Product.Create";
        public const string Update = "Product.Update";
        public const string Delete = "Product.Delete";
    }

    public static class Order
    {
        public const string View         = "Order.View";
        public const string Create       = "Order.Create";
        public const string UpdateStatus = "Order.UpdateStatus";
    }

    public static class User
    {
        public const string View          = "User.View";
        public const string ManageRole    = "User.ManageRole";
        public const string ManageStatus  = "User.ManageStatus";
        public const string ResetPassword = "User.ResetPassword";
    }

    public static class Role
    {
        public const string View   = "Role.View";
        public const string Create = "Role.Create";
        public const string Update = "Role.Update";
        public const string Delete = "Role.Delete";
    }

    /// <summary>
    /// Trả về toàn bộ danh sách permission – dùng khi seed DB.
    /// </summary>
    public static List<(string Name, string GroupName, string Description)> GetAll() =>
[
    (Category.View,   PermissionGroups.Category, "Xem danh mục"),
    (Category.Create, PermissionGroups.Category, "Thêm danh mục"),
    (Category.Update, PermissionGroups.Category, "Sửa danh mục"),
    (Category.Delete, PermissionGroups.Category, "Xoá danh mục"),
    
    (Product.View,   PermissionGroups.Product, "Xem sản phẩm"),
    (Product.Create, PermissionGroups.Product, "Thêm sản phẩm"),
    (Product.Update, PermissionGroups.Product, "Sửa sản phẩm"),
    (Product.Delete, PermissionGroups.Product, "Xoá sản phẩm"),
    
    (Order.View,         PermissionGroups.Order, "Xem đơn hàng"),
    (Order.Create,       PermissionGroups.Order, "Tạo đơn hàng"),
    (Order.UpdateStatus, PermissionGroups.Order, "Cập nhật trạng thái đơn hàng"),
    
    (User.View,          PermissionGroups.User, "Xem người dùng"),
    (User.ManageRole,    PermissionGroups.User, "Gán vai trò cho người dùng"),
    (User.ManageStatus,  PermissionGroups.User, "Khoá/mở tài khoản người dùng"),
    (User.ResetPassword, PermissionGroups.User, "Đặt lại mật khẩu người dùng"),

    (Role.View,   PermissionGroups.Role, "Xem danh sách vai trò"),
    (Role.Create, PermissionGroups.Role, "Tạo vai trò mới"),
    (Role.Update, PermissionGroups.Role, "Sửa vai trò & Phân quyền"),
    (Role.Delete, PermissionGroups.Role, "Xoá vai trò"),
];
}

