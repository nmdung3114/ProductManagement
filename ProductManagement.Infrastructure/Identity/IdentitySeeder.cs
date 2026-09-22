using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Domain.Constants;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Identity;
public class IdentitySeeder
{
    public static async Task SeedAsync(RoleManager<ApplicationRole> roleManager, UserManager<ApplicationUser> userManager,AppDbContext context)
    {
        // seed tất cả các quyền permission vào db nếu chưa tồn tại
        var allPermissions = Permissions.GetAll();
        foreach ( var (name,group,description) in allPermissions)
        {
            if(!await context.Permissions.AnyAsync(p => p.Name == name))
            {
                context.Permissions.Add(new Permission
                {
                    Id = Guid.NewGuid(),
                    Name =name,
                    Group = group,
                    Description = description
                });
                
            }
        }
        await context.SaveChangesAsync();
        // tạo 2 role mặc định Admin và User nếu chưa tồn tại
        if(!await roleManager.RoleExistsAsync(Roles.Admin))
        {
            await roleManager.CreateAsync(new ApplicationRole
            {
                Name = Roles.Admin,
                Description = "Quản trị viên toàn hệ thống",
                IsSystemRole = true,
            });
        }
        if(!await roleManager.RoleExistsAsync(Roles.User))
        {
            await roleManager.CreateAsync(new ApplicationRole
            {
                Name = Roles.User,
                Description = "Người dùng bình thường",
                IsSystemRole = true,
            });
        }
        // gán tất cả các quyền permission cho role Admin
        var adminRole = await roleManager.FindByNameAsync(Roles.Admin);
        var allDbPermissions= await context.Permissions.ToListAsync();
        if(adminRole != null)
        {
            foreach(var permission in allDbPermissions)
            {
                var exists = await context.RolePermissions.AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == permission.Id);
                if (!exists)
                {
                    context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = adminRole.Id,
                        PermissionId = permission.Id
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        //gán quyền permission cho role User (nếu cần) – ví dụ chỉ gán quyền xem danh mục và sản phẩm
        var userRole = await roleManager.FindByNameAsync(Roles.User);
        if(userRole != null)
        {
            var userPermissions = new List<string>
            {
                Permissions.Category.View,
                Permissions.Product.View
            };
            foreach(var permissionName in userPermissions)
            {
                var permission = await context.Permissions.FirstOrDefaultAsync(p => p.Name == permissionName);
                if(permission != null)
                {
                    var exists = await context.RolePermissions.AnyAsync(rp => rp.RoleId == userRole.Id && rp.PermissionId == permission.Id);
                    if(!exists)
                    {
                        context.RolePermissions.Add(new RolePermission
                        {
                            RoleId = userRole.Id,
                            PermissionId = permission.Id
                        });
                    }
                }
            }
            await context.SaveChangesAsync();
        }
        // tạo tài khoản Admin mặc định nếu chưa tồn tại
        var email = "admin@gmail.com";
        var adminUser = await userManager.FindByEmailAsync(email);
        if(adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = "Quản trị viên toàn hệ thống",
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            var createResult = await userManager.CreateAsync(adminUser, "Admin@123");
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.Admin);
            }
            else
            {
                throw new Exception($"Không thể tạo tài khoản Admin: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
            }

        }
        
    }
}