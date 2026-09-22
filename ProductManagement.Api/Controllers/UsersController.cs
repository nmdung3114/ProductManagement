using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Domain.Constants;
using ProductManagement.Infrastructure.Identity;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    /// <summary>Lấy danh sách người dùng.</summary>
    [HttpGet]
    [Authorize(Policy = Permissions.User.View)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _userManager.Users.AsNoTracking().ToListAsync(cancellationToken);
        var userDtos = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                isBlocked = !user.IsActive || (user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow),
                roles = roles
            });
        }

        return Ok(new { success = true, data = userDtos });
    }

    /// <summary>Lấy chi tiết người dùng theo Id.</summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.User.View)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            success = true,
            data = new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                isBlocked = !user.IsActive || (user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow),
                roles = roles
            }
        });
    }

    /// <summary>Tạo người dùng mới.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.User.ManageRole)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserApiRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email này đã được sử dụng." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password ?? "Password123!");
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = $"Tạo người dùng thất bại: {errors}" });
        }

        if (request.Roles != null && request.Roles.Any())
        {
            await _userManager.AddToRolesAsync(user, request.Roles);
        }
        else
        {
            await _userManager.AddToRoleAsync(user, Roles.User);
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            success = true,
            message = "Tạo người dùng thành công.",
            data = new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                isBlocked = false,
                roles = roles
            }
        });
    }

    /// <summary>Cập nhật vai trò người dùng.</summary>
    [HttpPut("{id:guid}/roles")]
    [Authorize(Policy = Permissions.User.ManageRole)]
    public async Task<IActionResult> UpdateUserRoles(Guid id, [FromBody] UpdateUserRolesApiRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);

        if (request.Roles != null && request.Roles.Any())
        {
            await _userManager.AddToRolesAsync(user, request.Roles);
        }

        return Ok(new { success = true, message = "Cập nhật vai trò người dùng thành công." });
    }

    /// <summary>Khóa / Mở khóa người dùng.</summary>
    [HttpPut("{id:guid}/status")]
    [Authorize(Policy = Permissions.User.ManageStatus)]
    public async Task<IActionResult> ToggleUserStatus(Guid id, [FromBody] ToggleUserStatusApiRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        user.IsActive = !request.IsBlocked;
        if (request.IsBlocked)
        {
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
        }
        else
        {
            user.LockoutEnd = null;
        }

        await _userManager.UpdateAsync(user);
        return Ok(new { success = true, message = request.IsBlocked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản." });
    }

    /// <summary>Đặt lại mật khẩu người dùng.</summary>
    [HttpPost("{id:guid}/reset-password")]
    [Authorize(Policy = Permissions.User.ResetPassword)]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        const string newPassword = "Password123!";
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = $"Đặt lại mật khẩu thất bại: {errors}" });
        }

        return Ok(new
        {
            success = true,
            message = "Đặt lại mật khẩu thành công. Mật khẩu mặc định mới là Password123!",
            data = new { newPassword }
        });
    }
}

public record CreateUserApiRequest(string FullName, string Email, string? Password, List<string>? Roles);
public record UpdateUserRolesApiRequest(List<string> Roles);
public record ToggleUserStatusApiRequest(bool IsBlocked);
