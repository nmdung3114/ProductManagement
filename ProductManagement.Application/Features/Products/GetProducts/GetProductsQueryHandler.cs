// ============================================================
// File: GetProductsQueryHandler.cs – Feature: Products / GetProducts
// Vai trò: Handler xử lý GetProductsQuery.
// Gọi IProductService để lấy danh sách sản phẩm có phân trang, bộ lọc
// và map sang ProductDto để trả về cho Controller.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Products.GetProducts;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductDto>>
{
    private readonly IProductService _productService;

    public GetProductsQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<PagedResult<ProductDto>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        var pagedProducts = await _productService.GetProductsAsync(
            request.Name,
            request.SKU,
            request.CategoryId,
            request.MinPrice,
            request.MaxPrice,
            request.IsActive,
            request.SortBy,
            request.SortDescending,
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = pagedProducts.Items.Select(p => new ProductDto(
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
            p.UpdatedAt)).ToList();

        return new PagedResult<ProductDto>(
            dtos.AsReadOnly(),
            pagedProducts.TotalCount,
            pagedProducts.Page,
            pagedProducts.PageSize);
    }
}
