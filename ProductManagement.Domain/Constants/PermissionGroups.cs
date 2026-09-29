namespace ProductManagement.Domain.Constants;

public static class PermissionGroups
{
    public const string Category = "Danh mục";
    public const string Product = "Sản phẩm";
    public const string Order = "Đơn hàng";
    public const string User = "Người dùng";
    public const string Role = "Vai trò & Quyền";

    public static List<(string Name,string Description,int DisplayOrder)> GetAll() =>[
        (Category,"Quản lý danh mục sản phẩm",1),
        (Product,"Quản lý sản phẩm",2),
        (Order,"Quản lý đơn hàng",3),
        (User,"Quản lý người dùng",4),
        (Role,"Quản lý vai trò & quyền",5),
    ];
}