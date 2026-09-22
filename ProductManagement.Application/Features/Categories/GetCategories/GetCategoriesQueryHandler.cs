// ============================================================
// File: GetCategoriesQueryHandler.cs – Feature: Categories / GetCategories
// Vai trò: Handler xử lý GetCategoriesQuery.
// Gọi ICategoryService để lấy danh sách danh mục có phân trang
// rồi map sang CategoryDto để trả về cho Controller.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Categories.GetCategories;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, PagedResult<CategoryDto>>
{
    private readonly ICategoryService _categoryService;

    public GetCategoriesQueryHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<PagedResult<CategoryDto>> Handle(
        GetCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var pagedCategories = await _categoryService.GetCategoriesAsync(
            request.Name,
            request.IsActive,
            request.Page,
            request.PageSize,
            cancellationToken);

        // Map từ entity sang DTO
        var dtos = pagedCategories.Items.Select(c => new CategoryDto(
            c.Id,
            c.Name,
            c.Description,
            c.IsActive,
            c.Products.Count,
            c.CreatedAt,
            c.UpdatedAt
        )).ToList();

        return new PagedResult<CategoryDto>(
            dtos.AsReadOnly(),
            pagedCategories.TotalCount,
            pagedCategories.Page,
            pagedCategories.PageSize);
    }
}
