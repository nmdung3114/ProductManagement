using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Orders.GetAllOrders;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PagedResult<OrderAdminDto>>
{
    private readonly IOrderService _orderService;
    private readonly IIdentityService _identityService;

    public GetAllOrdersQueryHandler(IOrderService orderService, IIdentityService identityService)
    {
        _orderService = orderService;
        _identityService = identityService;
    }

    public async Task<PagedResult<OrderAdminDto>> Handle(
        GetAllOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var pagedOrders = await _orderService.GetAllOrdersAsync(
            request.UserId,
            request.Status,
            request.FromDate,
            request.ToDate,
            request.Page,
            request.PageSize,
            cancellationToken);

        var userIds = pagedOrders.Items.Select(o => o.UserId).Distinct().ToList();
        var userSummaryMap = await _identityService.GetUsersSummaryAsync(userIds, cancellationToken);

        var dtos = pagedOrders.Items.Select(o =>
        {
            userSummaryMap.TryGetValue(o.UserId, out var userSummary);
            return new OrderAdminDto(
                o.Id,
                o.UserId,
                string.IsNullOrEmpty(userSummary.FullName) ? "Khách hàng" : userSummary.FullName,
                userSummary.Email ?? "",
                o.Id.ToString()[..8].ToUpper(),
                o.TotalAmount,
                o.Status.ToString(),
                o.Items.Count,
                o.CreatedAt);
        }).ToList();

        return new PagedResult<OrderAdminDto>(
            dtos.AsReadOnly(),
            pagedOrders.TotalCount,
            pagedOrders.Page,
            pagedOrders.PageSize);
    }
}
