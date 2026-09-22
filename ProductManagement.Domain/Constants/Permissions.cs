

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
    public static List<(string Name, string Group, string Description)> GetAll() =>
[
    (Category.View,   "Danh mục", "Xem danh mục"),
    (Category.Create, "Danh mục", "Thêm danh mục"),
    (Category.Update, "Danh mục", "Sửa danh mục"),
    (Category.Delete, "Danh mục", "Xoá danh mục"),
    
    (Product.View,   "Sản phẩm", "Xem sản phẩm"),
    (Product.Create, "Sản phẩm", "Thêm sản phẩm"),
    (Product.Update, "Sản phẩm", "Sửa sản phẩm"),
    (Product.Delete, "Sản phẩm", "Xoá sản phẩm"),
    
    (Order.View,         "Đơn hàng", "Xem đơn hàng"),
    (Order.Create,       "Đơn hàng", "Tạo đơn hàng"),
    (Order.UpdateStatus, "Đơn hàng", "Cập nhật trạng thái đơn hàng"),
    
    (User.View,          "Người dùng", "Xem người dùng"),
    (User.ManageRole,    "Người dùng", "Gán vai trò cho người dùng"),
    (User.ManageStatus,  "Người dùng", "Khoá/mở tài khoản người dùng"),
    (User.ResetPassword, "Người dùng", "Đặt lại mật khẩu người dùng"),

    (Role.View,   "Vai trò & Quyền", "Xem danh sách vai trò"),
    (Role.Create, "Vai trò & Quyền", "Tạo vai trò mới"),
    (Role.Update, "Vai trò & Quyền", "Sửa vai trò & Phân quyền"),
    (Role.Delete, "Vai trò & Quyền", "Xoá vai trò"),
];
}

