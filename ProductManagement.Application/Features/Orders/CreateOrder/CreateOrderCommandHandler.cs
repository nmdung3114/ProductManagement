// ============================================================
// File: CreateOrderCommandHandler.cs – Feature: Orders / CreateOrder
// Vai trò: Handler tạo đơn hàng mới. Gọi IOrderService để thực hiện
// validate sản phẩm, tạo đơn và trừ tồn kho.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Orders.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderService _orderService;

    public CreateOrderCommandHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        return await _orderService.CreateOrderAsync(request.UserId, request.Items, cancellationToken);
    }
}
