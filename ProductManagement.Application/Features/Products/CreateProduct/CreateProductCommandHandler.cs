// ============================================================
// File: CreateProductCommandHandler.cs – Feature: Products / CreateProduct
// Vai trò: Handler tạo sản phẩm mới bằng cách gọi IProductService.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Products.CreateProduct;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly IProductService _productService;

    public CreateProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        return await _productService.CreateProductAsync(
            request.Name,
            request.SKU,
            request.Description,
            request.Price,
            request.Stock,
            request.CategoryId,
            cancellationToken);
    }
}
