using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Features.Profile;
using ProductManagement.Infrastructure.Identity;

namespace ProductManagement.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public ProfileService(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy thông tin người dùng.");

        var roles = await _userManager.GetRolesAsync(user);

        // Lấy danh sách tất cả các quyền (Permissions) thuộc các Role của User
        var userRoles = await _roleManager.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .Where(r => roles.Contains(r.Name!))
            .ToListAsync(cancellationToken);

        var permissions = userRoles
            .SelectMany(r => r.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        return new ProfileDto(
            user.Id,
            user.Email!,
            user.FullName,
            user.CreatedAt,
            roles,
            permissions
        );
    }

    public async Task UpdateProfileAsync(Guid userId, string fullName, string? currentPassword, string? newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy người dùng.");

        user.FullName = fullName.Trim();

        // Đổi mật khẩu nếu người dùng nhập mật khẩu cũ và mới
        if (!string.IsNullOrWhiteSpace(currentPassword) && !string.IsNullOrWhiteSpace(newPassword))
        {
            var changePasswordResult = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            if (!changePasswordResult.Succeeded)
            {
                var errors = string.Join(", ", changePasswordResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Đổi mật khẩu thất bại: {errors}");
            }
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Cập nhật thất bại: {errors}");
        }
    }
}
