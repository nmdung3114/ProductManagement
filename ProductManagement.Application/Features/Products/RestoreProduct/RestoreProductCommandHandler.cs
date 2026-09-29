using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Products.RestoreProduct;

public class RestoreProductCommandHandler : IRequestHandler<RestoreProductCommand, Unit>
{
    private readonly IProductService _productService;

    public RestoreProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<Unit> Handle(RestoreProductCommand request, CancellationToken cancellationToken)
    {
        await _productService.RestoreProductAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
