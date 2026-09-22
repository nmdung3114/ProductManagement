// ============================================================
// File: OrderService.cs – Tầng Infrastructure / Services
// Vai trò: Triển khai IOrderService. Tương tác trực tiếp với
// AppDbContext để xử lý logic đơn hàng và trừ tồn kho.
// ============================================================

using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;
using ProductManagement.Application.Features.Orders.CreateOrder;
using ProductManagement.Application.Features.Orders.UpdateOrderStatus;
using ProductManagement.Domain.Entities;
using ProductManagement.Domain.Enums;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<Order>> GetAllOrdersAsync(
        Guid? userId,
        OrderStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(o => o.UserId == userId.Value);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(o => o.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.CreatedAt <= toDate.Value);

        query = query.OrderByDescending(o => o.CreatedAt);

        return await PagedResult<Order>.CreateAsync(query, page, pageSize, cancellationToken);
    }

    public async Task<PagedResult<Order>> GetMyOrdersAsync(
        Guid userId,
        OrderStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .Where(o => o.UserId == userId);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        query = query.OrderByDescending(o => o.CreatedAt);

        return await PagedResult<Order>.CreateAsync(query, page, pageSize, cancellationToken);
    }

    public async Task<Order?> GetOrderByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<Guid> CreateOrderAsync(
        Guid userId,
        IEnumerable<OrderItemRequest> items,
        CancellationToken cancellationToken = default)
    {
        var itemList = items.ToList();
        var productIds = itemList.Select(i => i.ProductId).ToList();

        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var item in itemList)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId)
                ?? throw new NotFoundException("Sản phẩm", item.ProductId);

            if (product.Stock < item.Quantity)
                throw new InvalidOperationException(
                    $"Sản phẩm '{product.Name}' không đủ tồn kho. Hiện có: {product.Stock}, yêu cầu: {item.Quantity}.");
        }

        var order = new Order(userId);

        foreach (var item in itemList)
        {
            var product = products.First(p => p.Id == item.ProductId);
            order.AddItem(item.ProductId, item.Quantity, product.Price);

            // Trừ tồn kho
            product.AdjustStock(-item.Quantity);
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        return order.Id;
    }

    public async Task UpdateOrderStatusAsync(
        Guid orderId,
        OrderAction action,
        Guid requestingUserId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng", orderId);

        switch (action)
        {
            case OrderAction.Confirm:
                if (!isAdmin)
                    throw new ForbiddenException("Chỉ Admin mới được xác nhận đơn hàng.");
                order.ConfirmOrder();
                break;

            case OrderAction.Complete:
                if (!isAdmin)
                    throw new ForbiddenException("Chỉ Admin mới được hoàn thành đơn hàng.");
                order.CompleteOrder();
                break;

            case OrderAction.Cancel:
                if (!isAdmin && order.UserId != requestingUserId)
                    throw new ForbiddenException("Bạn không có quyền hủy đơn hàng này.");
                order.CancelOrder();
                break;

            default:
                throw new InvalidOperationException("Hành động không hợp lệ.");
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
