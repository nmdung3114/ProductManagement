using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtService _jwtService;

    public IdentityService(UserManager<ApplicationUser> userManager, IJwtService jwtService)
    {
        _userManager = userManager;
        _jwtService = jwtService;
    }

    public async Task<RegisterResult> RegisterAsync(string email, string password, string fullName, CancellationToken cancellationToken = default)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, password);

        if(!createResult.Succeeded)
        {
            return new RegisterResult(false, null, createResult.Errors.Select(e => e.Description).ToList());
        }

        var roleResult = await _userManager.AddToRoleAsync(user, Roles.User);
        if(!roleResult.Succeeded)
        {
            return new RegisterResult(false, null, roleResult.Errors.Select(e => e.Description).ToList());
        }
        return new RegisterResult(true, user.Id, Array.Empty<string>());
    }

    public async Task<LoginResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if(user == null)
        {
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
        }
        var passwordValid = await _userManager.CheckPasswordAsync(user, password);
        if(!passwordValid)
        {
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
        }
        var roles = await _userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? Roles.User;
        var Token = await _jwtService.GenerateTokenAsync(user.Id.ToString(), user.Email!, mainRole, cancellationToken);
        var userDto = new UserDto(user.Id, user.Email!, user.FullName, roles);
        return new LoginResult(true, Token, DateTime.UtcNow.AddMinutes(120), userDto, Array.Empty<string>());
    }

    public async Task<Dictionary<Guid, (string FullName, string Email)>> GetUsersSummaryAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken = default)
    {
        var distinctIds = userIds.Distinct().ToList();
        var users = await _userManager.Users
            .AsNoTracking()
            .Where(u => distinctIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FullName, u.Email })
            .ToListAsync(cancellationToken);

        return users.ToDictionary(u => u.Id, u => (u.FullName, u.Email ?? ""));
    }

    public async Task<(string FullName, string Email)?> GetUserSummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.FullName, u.Email })
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null) return null;
        return (user.FullName, user.Email ?? "");
    }
}