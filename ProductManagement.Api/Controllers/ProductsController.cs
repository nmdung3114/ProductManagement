

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Products.CreateProduct;
using ProductManagement.Application.Features.Products.DeleteProduct;
using ProductManagement.Application.Features.Products.GetProductById;
using ProductManagement.Application.Features.Products.GetProducts;
using ProductManagement.Application.Features.Products.UpdateProduct;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Lấy danh sách sản phẩm với đầy đủ bộ lọc và phân trang.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? name,
        [FromQuery] string? sku,
        [FromQuery] Guid? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? isActive,
        [FromQuery] string? sortBy,
        [FromQuery] bool sortDescending = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetProductsQuery(name, sku, categoryId, minPrice, maxPrice, isActive, sortBy, sortDescending, page, pageSize),
            cancellationToken);

        return Ok(new
        {
            success = true,
            data = result.Items,
            pagination = new
            {
                result.Page,
                result.PageSize,
                result.TotalCount,
                result.TotalPages,
                result.HasPreviousPage,
                result.HasNextPage
            }
        });
    }

    /// <summary>Lấy chi tiết sản phẩm theo Id.</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProductById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id), cancellationToken);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Tạo sản phẩm mới – chỉ Admin.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.Product.Create)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductCommand command,
        CancellationToken cancellationToken = default)
    {
        var productId = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetProductById), new { id = productId },
            new { success = true, message = "Tạo sản phẩm thành công.", productId });
    }

    /// <summary>Cập nhật sản phẩm – chỉ Admin.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.Product.Update)]
    public async Task<IActionResult> UpdateProduct(
        Guid id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        await _mediator.Send(
            new UpdateProductCommand(id, request.Name, request.SKU, request.Description, request.Price, request.Stock, request.CategoryId),
            cancellationToken);

        return Ok(new { success = true, message = "Cập nhật sản phẩm thành công." });
    }

    /// <summary>Xóa mềm sản phẩm – chỉ Admin.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.Product.Delete)]
    public async Task<IActionResult> DeleteProduct(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new DeleteProductCommand(id), cancellationToken);
        return Ok(new { success = true, message = "Xóa sản phẩm thành công." });
    }
}

/// <summary>Request body cho UpdateProduct (tách id khỏi body).</summary>
public record UpdateProductRequest(
    string Name,
    string SKU,
    string? Description,
    decimal Price,
    int Stock,
    Guid CategoryId);
