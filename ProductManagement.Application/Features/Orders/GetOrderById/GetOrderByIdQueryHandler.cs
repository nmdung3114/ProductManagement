using MediatR;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Orders.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDetailDto>
{
    private readonly IOrderService _orderService;
    private readonly IIdentityService _identityService;

    public GetOrderByIdQueryHandler(IOrderService orderService, IIdentityService identityService)
    {
        _orderService = orderService;
        _identityService = identityService;
    }

    public async Task<OrderDetailDto> Handle(
        GetOrderByIdQuery request,
        CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng", request.OrderId);

        // Kiểm tra quyền: User chỉ xem được đơn của mình
        if (!request.IsAdmin && order.UserId != request.RequestingUserId)
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này.");

        var userSummary = await _identityService.GetUserSummaryAsync(order.UserId, cancellationToken);

        var itemDtos = order.Items.Select(i => new OrderItemDetailDto(
            i.ProductId,
            i.Product?.Name ?? "Sản phẩm không còn tồn tại",
            i.Product?.SKU ?? "N/A",
            i.Quantity,
            i.UnitPrice,
            i.TotalPrice
        )).ToList().AsReadOnly();

        return new OrderDetailDto(
            order.Id,
            order.UserId,
            userSummary.HasValue && !string.IsNullOrEmpty(userSummary.Value.FullName) ? userSummary.Value.FullName : "Khách hàng",
            userSummary?.Email ?? "",
            order.Id.ToString()[..8].ToUpper(),
            order.TotalAmount,
            order.Status.ToString(),
            order.CreatedAt,
            itemDtos);
    }
}
