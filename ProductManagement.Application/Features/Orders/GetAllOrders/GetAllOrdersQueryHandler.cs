// ============================================================
// File: GetAllOrdersQueryHandler.cs – Feature: Orders / GetAllOrders
// Vai trò: Handler áp dụng Data Scoping & DTO Mapping theo Role.
//
// SCOPING RULES:
//   Admin        → xem tất cả đơn, full DTO (OrderAdminDto) với UserId & email
//   InventoryManager → xem tất cả đơn Confirmed/Completed để chuẩn bị xuất kho
//                     → trả về OrderStaffDto (không cần thông tin tài chính chi tiết)
//   SalesStaff   → xem tất cả đơn cần xử lý (Pending/Confirmed)
//                → trả về OrderStaffDto
//   Auditor      → xem tất cả đơn (readonly), trả về OrderStaffDto
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;
using DomainRoles = ProductManagement.Domain.Constants.Roles;
using ProductManagement.Domain.Enums;

namespace ProductManagement.Application.Features.Orders.GetAllOrders;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PagedResult<object>>
{
    private readonly IOrderService _orderService;
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUser;

    public GetAllOrdersQueryHandler(
        IOrderService orderService,
        IIdentityService identityService,
        ICurrentUserService currentUser)
    {
        _orderService = orderService;
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<object>> Handle(
        GetAllOrdersQuery request,
        CancellationToken cancellationToken)
    {
        bool isAdmin = _currentUser.IsInRole(DomainRoles.Admin);
        bool isInventoryManager = _currentUser.IsInRole(DomainRoles.InventoryManager);

        // ── 1. DATA SCOPE: InventoryManager chỉ cần xem đơn Confirmed để xuất kho ──
        OrderStatus? scopedStatus = request.Status;

        // (Tuỳ chọn: nếu muốn giới hạn cứng InventoryManager chỉ xem Confirmed)
        // if (isInventoryManager && !isAdmin && scopedStatus == null)
        //     scopedStatus = OrderStatus.Confirmed;

        var pagedOrders = await _orderService.GetAllOrdersAsync(
            request.UserId,
            scopedStatus,
            request.FromDate,
            request.ToDate,
            request.Page,
            request.PageSize,
            cancellationToken);

        // ── 2. Lấy thông tin user để hiển thị tên (dùng cho tất cả roles) ──
        var userIds = pagedOrders.Items.Select(o => o.UserId).Distinct().ToList();
        var userSummaryMap = await _identityService.GetUsersSummaryAsync(userIds, cancellationToken);

        // ── 3. DTO MAPPING theo Role ──────────────────────────────────
        IReadOnlyList<object> dtos;

        if (isAdmin)
        {
            // Admin: full DTO với UserId, email
            dtos = pagedOrders.Items.Select(o =>
            {
                userSummaryMap.TryGetValue(o.UserId, out var userSummary);
                return (object)new OrderAdminDto(
                    o.Id,
                    o.UserId,
                    string.IsNullOrEmpty(userSummary.FullName) ? "Khách hàng" : userSummary.FullName,
                    userSummary.Email ?? "",
                    o.Id.ToString()[..8].ToUpper(),
                    o.TotalAmount,
                    o.Status.ToString(),
                    o.Items.Count,
                    o.CreatedAt);
            }).ToList().AsReadOnly();
        }
        else
        {
            // InventoryManager / SalesStaff / Auditor: DTO không có UserId/email
            dtos = pagedOrders.Items.Select(o =>
            {
                userSummaryMap.TryGetValue(o.UserId, out var userSummary);
                return (object)new OrderStaffDto(
                    o.Id,
                    string.IsNullOrEmpty(userSummary.FullName) ? "Khách hàng" : userSummary.FullName,
                    o.Id.ToString()[..8].ToUpper(),
                    o.TotalAmount,
                    o.Status.ToString(),
                    o.Items.Count,
                    o.CreatedAt);
            }).ToList().AsReadOnly();
        }

        return new PagedResult<object>(
            dtos,
            pagedOrders.TotalCount,
            pagedOrders.Page,
            pagedOrders.PageSize);
    }
}
