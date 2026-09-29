using MediatR;

namespace ProductManagement.Application.Features.Dashboard.GetDashboardStats;

public record GetDashboardStatsQuery() : IRequest<DashboardStatsDto>;

