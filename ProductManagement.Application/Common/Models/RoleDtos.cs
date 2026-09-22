namespace ProductManagement.Application.Common.Models;

//dto cho một permission đơn lẻ
public record PermissionDto(Guid Id, string Name, string? Group, string? Description);

//dto cho danh sách Permission được nóm theo Group
public record PermissionGroupDto(string GroupName,List<PermissionDto> Permissions);

//dto thông tin role đấy đủ
public record RoleDto(Guid Id, string Name,string? Description,bool IsSystemRole, List<PermissionDto> Permissions);