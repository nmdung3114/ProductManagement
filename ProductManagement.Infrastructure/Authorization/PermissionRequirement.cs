// đóng gói tên Permission cần kiểm tra làm yêu cầu cho ASP.NET Core Authorization
using Microsoft.AspNetCore.Authorization;

namespace ProductManagement.Infrastructure.Authorization;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string PermissionName { get; }

    public PermissionRequirement(string permissionName)
    {
        PermissionName = permissionName;
    }
}
