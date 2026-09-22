// ============================================================
// File: GetCategoryByIdQueryHandler.cs – Feature: Categories / GetCategoryById
// Vai trò: Handler xử lý GetCategoryByIdQuery.
// Tìm danh mục theo Id, map sang CategoryDetailDto với
// danh sách sản phẩm. Ném NotFoundException nếu không tìm thấy.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Categories.GetCategoryById;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDetailDto>
{
    private readonly ICategoryService _categoryService;

    public GetCategoryByIdQueryHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<CategoryDetailDto> Handle(
        GetCategoryByIdQuery request,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetCategoryByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Danh mục", request.Id);

        var productDtos = category.Products
            .Select(p => new ProductSummaryDto(p.Id, p.Name, p.SKU, p.Price, p.Stock, p.IsActive))
            .ToList()
            .AsReadOnly();

        return new CategoryDetailDto(
            category.Id,
            category.Name,
            category.Description,
            category.IsActive,
            category.CreatedAt,
            category.UpdatedAt,
            productDtos);
    }
}
