using MediatR;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Features.Dashboard.GetDashboardStats;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IAppDbContext _dbContext;
    private readonly IIdentityService _identityService;
    private readonly IRoleService _roleService;

    public GetDashboardStatsQueryHandler(
        IAppDbContext dbContext,
        IIdentityService identityService,
        IRoleService roleService)
    {
        _dbContext = dbContext;
        _identityService = identityService;
        _roleService = roleService;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        // 1. Phép đếm & tính tổng ở DB
        var productsCount = await _dbContext.Products.CountAsync(cancellationToken);
        var categoriesCount = await _dbContext.Categories.CountAsync(cancellationToken);
        var ordersCount = await _dbContext.Orders.CountAsync(cancellationToken);
        
        var pendingOrders = await _dbContext.Orders
            .CountAsync(o => o.Status == OrderStatus.Pending, cancellationToken);

        var totalRevenue = await _dbContext.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0m;

        // Lấy số lượng Roles & Users
        var roles = await _roleService.GetRolesAsync(cancellationToken);
        var rolesCount = roles.Count;
        
        var usersCount = await _identityService.GetTotalUsersCountAsync(cancellationToken);

        // 2. Top 5 đơn hàng mới nhất
        var recentOrdersRaw = await _dbContext.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync(cancellationToken);

        var userIds = recentOrdersRaw.Select(o => o.UserId).Distinct();
        var userMap = await _identityService.GetUsersSummaryAsync(userIds, cancellationToken);

        var recentOrders = recentOrdersRaw.Select(o =>
        {
            userMap.TryGetValue(o.UserId, out var userInfo);
            return new DashboardRecentOrderDto(
                o.Id,
                o.Id.ToString()[..8].ToUpper(),
                string.IsNullOrEmpty(userInfo.FullName) ? "Khách hàng" : userInfo.FullName,
                userInfo.Email ?? "",
                o.TotalAmount,
                o.Status.ToString(),
                o.CreatedAt
            );
        }).ToList();

        // 3. Top 5 sản phẩm tồn kho thấp (<= 15) xếp theo Stock tăng dần
        var lowStockProducts = await _dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.Stock <= 15)
            .OrderBy(p => p.Stock)
            .Take(5)
            .Select(p => new DashboardLowStockProductDto(
                p.Id,
                p.Name,
                p.SKU,
                p.Category != null ? p.Category.Name : "Chưa phân loại",
                p.Price,
                p.Stock,
                p.IsActive
            ))
            .ToListAsync(cancellationToken);

        return new DashboardStatsDto(
            usersCount,
            rolesCount,
            productsCount,
            categoriesCount,
            pendingOrders,
            ordersCount,
            totalRevenue,
            recentOrders,
            lowStockProducts
        );
    }
}
