// ============================================================
// File: GetProductsQueryHandler.cs – Feature: Products / GetProducts
// Vai trò: Handler áp dụng Data Scoping & DTO Mapping theo Role.
//
// SCOPING RULES:
//   Admin / InventoryManager → xem tất cả (kể cả IsActive = false)
//                             → trả về ProductInventoryDto (SKU, Stock số, IsActive)
//   SalesStaff / Auditor     → chỉ xem IsActive = true
//                             → trả về ProductPublicDto (InStock bool, không có SKU)
//   User / Customer          → chỉ xem IsActive = true
//                             → trả về ProductPublicDto
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;
using DomainRoles = ProductManagement.Domain.Constants.Roles;

namespace ProductManagement.Application.Features.Products.GetProducts;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<object>>
{
    private readonly IProductService _productService;
    private readonly ICurrentUserService _currentUser;

    public GetProductsQueryHandler(IProductService productService, ICurrentUserService currentUser)
    {
        _productService = productService;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<object>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        // ── 1. Xác định role người dùng ──────────────────────────────
        bool isInventoryAccess = _currentUser.IsInAnyRole(DomainRoles.Admin, DomainRoles.InventoryManager);

        // ── 2. DATA SCOPE: Ẩn sản phẩm inactive với user thường ──────
        // Admin/InventoryManager có thể truyền isActive=null/false để xem tất cả.
        // SalesStaff/Auditor/User luôn chỉ xem sản phẩm đang kinh doanh.
        bool? scopedIsActive = isInventoryAccess
            ? request.IsActive       // Tôn trọng filter từ query
            : true;                  // Force chỉ xem active

        var pagedProducts = await _productService.GetProductsAsync(
            request.Name,
            request.SKU,
            request.CategoryId,
            request.MinPrice,
            request.MaxPrice,
            scopedIsActive,
            request.SortBy,
            request.SortDescending,
            request.Page,
            request.PageSize,
            cancellationToken);

        // ── 3. DTO MAPPING theo Role ──────────────────────────────────
        IReadOnlyList<object> dtos;

        if (isInventoryAccess)
        {
            // Admin & InventoryManager: trả về DTO đầy đủ kho
            dtos = pagedProducts.Items
                .Select(p => (object)new ProductInventoryDto(
                    p.Id,
                    p.Name,
                    p.SKU,
                    p.Description,
                    p.Price,
                    p.Stock,
                    p.IsActive,
                    p.CategoryId,
                    p.Category?.Name ?? "N/A",
                    p.CreatedAt,
                    p.UpdatedAt))
                .ToList()
                .AsReadOnly();
        }
        else
        {
            // SalesStaff / Auditor / Customer: trả về DTO công khai
            dtos = pagedProducts.Items
                .Select(p => (object)new ProductPublicDto(
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Category?.Name ?? "N/A",
                    p.Stock > 0))  // InStock: chỉ bool, không lộ số lượng
                .ToList()
                .AsReadOnly();
        }

        return new PagedResult<object>(
            dtos,
            pagedProducts.TotalCount,
            pagedProducts.Page,
            pagedProducts.PageSize);
    }
}
