using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Infrastructure.Services;

/// <summary>
/// Triển khai ICurrentUserService – đọc thông tin người dùng hiện tại
/// từ HttpContext Claims. Hỗ trợ cả ClaimTypes.Role lẫn custom "role" claim.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    /// <inheritdoc/>
    public string? UserId => Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? Principal?.FindFirstValue("sub");

    /// <inheritdoc/>
    public Guid? UserIdGuid => Guid.TryParse(UserId, out var id) ? id : null;

    /// <inheritdoc/>
    public string? UserName => Principal?.FindFirstValue(ClaimTypes.Email)
                            ?? Principal?.FindFirstValue("email");

    /// <inheritdoc/>
    public IReadOnlyList<string> Roles
    {
        get
        {
            if (Principal is null) return [];
            return Principal
                .FindAll(c => c.Type == ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value)
                .Distinct()
                .ToList()
                .AsReadOnly();
        }
    }

    /// <inheritdoc/>
    public bool IsInRole(string roleName) =>
        Roles.Contains(roleName, StringComparer.OrdinalIgnoreCase);

    /// <inheritdoc/>
    public bool IsInAnyRole(params string[] roleNames) =>
        roleNames.Any(IsInRole);
}
