using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Identity;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Services;
public class RoleService : IRoleService {
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _dbContext;
    private readonly IMemoryCache _cache;

    public RoleService(
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager,
        AppDbContext dbContext,
        IMemoryCache cache
        ){
            _roleManager=roleManager;
            _userManager=userManager;
            _dbContext=dbContext;
            _cache=cache;
        }
    //lấy danh sách Permission phân nhóm theo Group
    public async Task<List<PermissionGroupDto>> GetGroupPermissionAsync(CancellationToken cancellationToken = default){
        var permissions = await _dbContext.Permissions
            .AsNoTracking()
            .OrderBy(p => p.Group)
            .ThenBy(p=> p.Name)
            .ToListAsync(cancellationToken);
        return permissions
        .GroupBy(p => p.Group ?? "Chung")
        .Select(g => new PermissionGroupDto(
            g.Key,
            g.Select(p => new PermissionDto(p.Id, p.Name, p.Group, p.Description)).ToList()
        ))
        .ToList();

    }
    // Lấy danh sách tất cả roles
    public async Task<List<RoleDto>> GetRolesAsync(CancellationToken cancellationToken = default){
        var roles = await _dbContext.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
        var result =new List<RoleDto>();
        foreach(var role in roles){
            var perms =await _dbContext.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp =>new PermissionDto(
                    rp.Permission.Id,
                    rp.Permission.Name,
                    rp.Permission.Group,
                    rp.Permission.Description
                ))
                .ToListAsync(cancellationToken);
            result.Add(new RoleDto(
                role.Id,
                role.Name!,
                role.Description,
                role.IsSystemRole,
                perms
                
            ));
            
        }
        return result;
    }
    // Lấy chi tiết Role theo Id
    public async Task<RoleDto> GetRoleByIdAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString())
            ?? throw new NotFoundException("Role", roleId);
        var perms = await _dbContext.RolePermissions
            .Where(rp => rp.RoleId == role.Id)
            .Select(rp => new PermissionDto(
                rp.Permission.Id,
                rp.Permission.Name,
                rp.Permission.Group,
                rp.Permission.Description))
            .ToListAsync(cancellationToken);
        return new RoleDto(role.Id, role.Name!, role.Description, role.IsSystemRole, perms);
    }


    //tao role mới
    public async Task<Guid> CreateRoleAsync(string name,string? description,CancellationToken cancellationToken=default){
        if(await _roleManager.RoleExistsAsync(name)){
            throw new InvalidOperationException("Role đã tồn tại");
        }
        var role=new ApplicationRole{
            Name=name,
            Description=description,
            IsSystemRole=false,
            CreatedAt=DateTime.UtcNow
        };
        var result=await _roleManager.CreateAsync(role);
        if(!result.Succeeded){
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        return role.Id;
    }
    // cập nhật danh sách permissions cho role
    public async Task UpdateRolePermissionAsync(Guid roleId, List<Guid> permissionIds, CancellationToken cancellationToken=default){
        var role = await _roleManager.FindByIdAsync(roleId.ToString())?? throw new NotFoundException("Role",roleId);
        //xóa các permission cũ trong role
        var oldRolePermission = await _dbContext.RolePermissions
            .Where(rp => rp.RoleId==roleId)
            .ToListAsync(cancellationToken);
        _dbContext.RolePermissions.RemoveRange(oldRolePermission);
        //thêm các permission mới
        foreach(var perms in permissionIds)
        {
            _dbContext.RolePermissions.Add(new RolePermission{
                RoleId=roleId,
                PermissionId=perms,
                
            });
        }
        await _dbContext.SaveChangesAsync(cancellationToken);
        // xóa cache phân quyền để quyền mới có hiệu lực tức thì
        if(_cache is MemoryCache memoryCache){
            memoryCache.Clear();
            
        }
    }
    // xóa role
    public async Task DeleteRoleAsync(Guid roleId, CancellationToken cancellationToken=default){
        var role =await _roleManager.FindByIdAsync(roleId.ToString()) ??throw new NotFoundException("Role",roleId);
        if(role.IsSystemRole){
            throw new InvalidOperationException("Không được xóa system role");
        }
        //kiểm tra role có đang được gán cho user nào không
        var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
        if(usersInRole.Count > 0){
            throw new InvalidOperationException("Role đang được gán cho user nên không thể xóa");
        }
        var result=await _roleManager.DeleteAsync(role);
        if(!result.Succeeded){
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        //xóa cache
        if(_cache is MemoryCache memoryCache){
            memoryCache.Clear();
        }
    }
    
        
}