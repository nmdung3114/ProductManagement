// ============================================================
// File: GetMyOrdersQueryHandler.cs – Feature: Orders / GetMyOrders
// Vai trò: Handler lấy danh sách đơn hàng cá nhân của user qua IOrderService,
// có phân trang và lọc theo trạng thái.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Orders.GetMyOrders;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, PagedResult<OrderSummaryDto>>
{
    private readonly IOrderService _orderService;

    public GetMyOrdersQueryHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<PagedResult<OrderSummaryDto>> Handle(
        GetMyOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var pagedOrders = await _orderService.GetMyOrdersAsync(
            request.UserId,
            request.Status,
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = pagedOrders.Items.Select(o => new OrderSummaryDto(
            o.Id,
            o.TotalAmount,
            o.Status.ToString(),
            o.Items.Count,
            o.CreatedAt)).ToList();

        return new PagedResult<OrderSummaryDto>(
            dtos.AsReadOnly(),
            pagedOrders.TotalCount,
            pagedOrders.Page,
            pagedOrders.PageSize);
    }
}
