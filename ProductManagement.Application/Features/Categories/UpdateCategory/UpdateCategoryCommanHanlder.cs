// ============================================================
// File: UpdateCategoryCommandHandler.cs – Feature: Categories / UpdateCategory
// Vai trò: Handler xử lý UpdateCategoryCommand.
// Gọi service để tìm và cập nhật danh mục.
// Ném NotFoundException nếu không tìm thấy danh mục.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Categories.UpdateCategory;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Unit>
{
    private readonly ICategoryService _categoryService;

    public UpdateCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<Unit> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        await _categoryService.UpdateCategoryAsync(
            request.Id,
            request.Name,
            request.Description,
            cancellationToken);

        return Unit.Value;
    }
}
