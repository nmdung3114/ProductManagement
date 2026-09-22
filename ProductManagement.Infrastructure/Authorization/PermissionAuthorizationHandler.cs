using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PermissionAuthorizationHandler> _logger;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public PermissionAuthorizationHandler(
        IServiceScopeFactory scopeFactory,
        IMemoryCache cache,
        ILogger<PermissionAuthorizationHandler> logger)
    {
        _scopeFactory = scopeFactory;
        _cache = cache;
        _logger = logger;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1. Kiểm tra user đã xác thực chưa
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            _logger.LogWarning("[Permission] Người dùng chưa xác thực - từ chối quyền: {Permission}", requirement.PermissionName);
            return;
        }

        // 2. Lấy danh sách roles từ claims – JWT của Microsoft có thể dùng cả 2 loại claim type
        var roles = context.User
            .FindAll(c => c.Type == ClaimTypes.Role || c.Type == "role")
            .Select(c => c.Value)
            .Distinct()
            .ToList();

        _logger.LogInformation("[Permission] User roles: [{Roles}] | Checking: {Permission}",
            string.Join(", ", roles), requirement.PermissionName);

        if (roles.Count == 0)
        {
            _logger.LogWarning("[Permission] Không tìm thấy role claim nào trong token");
            return;
        }

        // 3. Cache Key theo danh sách Role và tên Permission
        var cacheKey = $"perm:{requirement.PermissionName}:{string.Join(",", roles.OrderBy(r => r))}";

        if (!_cache.TryGetValue(cacheKey, out bool hasPermission))
        {
            hasPermission = await CheckPermissionInDbAsync(roles, requirement.PermissionName);
            _cache.Set(cacheKey, hasPermission, CacheDuration);
            _logger.LogInformation("[Permission] DB check result for [{Roles}] + {Permission}: {Result}",
                string.Join(",", roles), requirement.PermissionName, hasPermission);
        }

        // 4. Nếu có quyền thì Succeed
        if (hasPermission)
        {
            context.Succeed(requirement);
        }
        else
        {
            _logger.LogWarning("[Permission] Từ chối: Role [{Roles}] không có quyền {Permission}",
                string.Join(",", roles), requirement.PermissionName);
        }
    }

    private async Task<bool> CheckPermissionInDbAsync(List<string> roleNames, string permissionName)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Lấy danh sách RoleId từ tên role
            var roleIds = await dbContext.Roles
                .AsNoTracking()
                .Where(r => r.Name != null && roleNames.Contains(r.Name))
                .Select(r => r.Id)
                .ToListAsync();

            if (roleIds.Count == 0)
            {
                _logger.LogWarning("[Permission] Không tìm thấy roles trong DB: {Roles}", string.Join(",", roleNames));
                return false;
            }

            // Kiểm tra xem có RolePermission nào khớp với permissionName không
            var result = await dbContext.RolePermissions
                .AsNoTracking()
                .AnyAsync(rp => roleIds.Contains(rp.RoleId) && rp.Permission.Name == permissionName);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Permission] Lỗi khi kiểm tra quyền trong DB");
            return false;
        }
    }
}
