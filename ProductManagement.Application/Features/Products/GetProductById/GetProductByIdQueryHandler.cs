// ============================================================
// File: GetProductByIdQueryHandler.cs – Feature: Products / GetProductById
// Vai trò: Handler tìm sản phẩm theo Id qua IProductService,
// map sang ProductDetailDto. Ném NotFoundException nếu không tìm thấy.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Products.GetProductById;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDetailDto>
{
    private readonly IProductService _productService;

    public GetProductByIdQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDetailDto> Handle(
        GetProductByIdQuery request,
        CancellationToken cancellationToken)
    {
        var product = await _productService.GetProductByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Sản phẩm", request.Id);

        return new ProductDetailDto(
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
}
