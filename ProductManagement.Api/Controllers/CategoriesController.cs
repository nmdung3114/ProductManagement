

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Features.Categories.CreateCategory;
using ProductManagement.Application.Features.Categories.DeleteCategory;
using ProductManagement.Application.Features.Categories.GetCategories;
using ProductManagement.Application.Features.Categories.GetCategoryById;
using ProductManagement.Application.Features.Categories.UpdateCategory;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoints đều yêu cầu đăng nhập
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Lấy danh sách danh mục (có phân trang và bộ lọc).</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories(
        [FromQuery] string? name,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetCategoriesQuery(name, isActive, page, pageSize),
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

    /// <summary>Lấy chi tiết danh mục theo Id.</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetCategoryByIdQuery(id), cancellationToken);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Tạo danh mục mới – chỉ Admin.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.Category.Create)]
    public async Task<IActionResult> CreateCategory(
        [FromBody] CreateCategoryCommand command,
        CancellationToken cancellationToken = default)
    {
        var categoryId = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCategoryById), new { id = categoryId },
            new { success = true, message = "Tạo danh mục thành công.", categoryId });
    }

    /// <summary>Cập nhật danh mục – chỉ Admin.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.Category.Update)]
    public async Task<IActionResult> UpdateCategory(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new UpdateCategoryCommand(id, request.Name, request.Description), cancellationToken);
        return Ok(new { success = true, message = "Cập nhật danh mục thành công." });
    }

    /// <summary>Xóa mềm danh mục – chỉ Admin.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.Category.Delete)]
    public async Task<IActionResult> DeleteCategory(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new DeleteCategoryCommand(id), cancellationToken);
        return Ok(new { success = true, message = "Xóa danh mục thành công." });
    }
}

/// <summary>Request body cho UpdateCategory (tách riêng để id lấy từ route).</summary>
public record UpdateCategoryRequest(string Name, string? Description);