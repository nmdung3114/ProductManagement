// ============================================================
// File: UpdateProductCommandHandler.cs – Feature: Products / UpdateProduct
// Vai trò: Handler cập nhật sản phẩm bằng cách gọi IProductService.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Products.UpdateProduct;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Unit>
{
    private readonly IProductService _productService;

    public UpdateProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<Unit> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        await _productService.UpdateProductAsync(
            request.Id,
            request.Name,
            request.SKU,
            request.Description,
            request.Price,
            request.Stock,
            request.CategoryId,
            cancellationToken);

        return Unit.Value;
    }
}
