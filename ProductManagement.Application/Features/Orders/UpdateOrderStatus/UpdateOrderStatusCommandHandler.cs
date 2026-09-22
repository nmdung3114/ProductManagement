// ============================================================
// File: UpdateOrderStatusCommandHandler.cs – Feature: Orders / UpdateOrderStatus
// Vai trò: Handler xử lý logic cập nhật trạng thái đơn hàng qua IOrderService.
// Phân quyền chi tiết:
// - Confirm/Complete: chỉ Admin
// - Cancel: Admin hoặc User sở hữu đơn (chỉ khi Pending)
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Orders.UpdateOrderStatus;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Unit>
{
    private readonly IOrderService _orderService;

    public UpdateOrderStatusCommandHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<Unit> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        await _orderService.UpdateOrderStatusAsync(
            request.OrderId,
            request.Action,
            request.RequestingUserId,
            request.IsAdmin,
            cancellationToken);

        return Unit.Value;
    }
}
