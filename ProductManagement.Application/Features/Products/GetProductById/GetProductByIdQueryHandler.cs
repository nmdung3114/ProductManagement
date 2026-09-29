// ============================================================
// File: GetProductByIdQueryHandler.cs – Feature: Products / GetProductById
// Vai trò: Handler tìm sản phẩm theo Id, map sang DTO phù hợp theo Role.
//
// SCOPING RULES:
//   Admin / InventoryManager → xem được cả sản phẩm IsActive=false
//                             → trả về ProductDetailAdminDto (SKU, Stock, IsActive)
//   SalesStaff / Auditor / User → chỉ xem được sản phẩm IsActive=true
//                                → trả về ProductDetailPublicDto
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;
using DomainRoles = ProductManagement.Domain.Constants.Roles;

namespace ProductManagement.Application.Features.Products.GetProductById;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, object>
{
    private readonly IProductService _productService;
    private readonly ICurrentUserService _currentUser;

    public GetProductByIdQueryHandler(IProductService productService, ICurrentUserService currentUser)
    {
        _productService = productService;
        _currentUser = currentUser;
    }

    public async Task<object> Handle(
        GetProductByIdQuery request,
        CancellationToken cancellationToken)
    {
        var product = await _productService.GetProductByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Sản phẩm", request.Id);

        bool isInventoryAccess = _currentUser.IsInAnyRole(DomainRoles.Admin, DomainRoles.InventoryManager);

        // Người dùng thường không được xem sản phẩm đã bị ẩn/xóa mềm
        if (!isInventoryAccess && !product.IsActive)
            throw new NotFoundException("Sản phẩm", request.Id);

        // ── DTO Mapping theo Role ────────────────────────────────────
        if (isInventoryAccess)
        {
            return new ProductDetailAdminDto(
                product.Id,
                product.Name,
                product.SKU,
                product.Description,
                product.Price,
                product.Stock,
                product.IsActive,
                product.CategoryId,
                product.Category?.Name ?? "N/A",
                product.CreatedAt,
                product.UpdatedAt);
        }

        return new ProductDetailPublicDto(
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.Category?.Name ?? "N/A",
            product.Stock > 0);
    }
}
