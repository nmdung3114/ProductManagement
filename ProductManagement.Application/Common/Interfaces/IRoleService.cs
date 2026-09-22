using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Common.Interfaces;

public interface IRoleService{
    //lấy danh sách tất cả các permisson trong db được nhóm theo group
    Task<List<PermissionGroupDto>> GetGroupPermissionAsync(CancellationToken cancellationToken=default);
    //lấy tất cả các role trong db
    Task<List<RoleDto>> GetRolesAsync(CancellationToken cancellationToken=default);
    //lấy chi tiết 1 role theo id
    Task<RoleDto> GetRoleByIdAsync(Guid roleId,CancellationToken cancellationToken=default);
    //tạo role mới
    Task<Guid> CreateRoleAsync(string name,string? description,CancellationToken cancellationToken=default);
    // cập nhật danh sách Permission của 1 role
    Task UpdateRolePermissionAsync(Guid roleId,List<Guid> permissionIds,CancellationToken cancellationToken=default);
    // xóa role (chỉ xóa role chưa được gán cho user)
    Task DeleteRoleAsync(Guid roleId,CancellationToken cancellationToken=default);
}

