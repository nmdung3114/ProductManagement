namespace ProductManagement.Application.Features.Dashboard.GetDashboardStats;

public record DashboardStatsDto(
    int UsersCount,
    int RolesCount,
    int ProductsCount,
    int CategoriesCount,
    int PendingOrders,
    int OrderCount,
    decimal TotalRevenue,
    List<DashboardRecentOrderDto> RecentOrders,
    List<DashboardLowStockProductDto> LowStockProducts
);

public record DashboardRecentOrderDto(
    Guid Id,
    string OrderCode,
    string CustomerName,
    string CustomerEmail,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt
);

public record DashboardLowStockProductDto(
    Guid Id,
    string Name,
    string Sku,
    string CategoryName,
    decimal Price,
    int Stock,
    bool IsActive
);