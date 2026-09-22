// ============================================================
// File: DeleteProductCommandHandler.cs – Feature: Products / DeleteProduct
// Vai trò: Handler xóa mềm sản phẩm bằng cách gọi IProductService.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Products.DeleteProduct;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Unit>
{
    private readonly IProductService _productService;

    public DeleteProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<Unit> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        await _productService.DeleteProductAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
