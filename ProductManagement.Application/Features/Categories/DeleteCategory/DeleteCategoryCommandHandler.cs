// ============================================================
// File: DeleteCategoryCommandHandler.cs – Feature: Categories / DeleteCategory
// Vai trò: Handler xử lý DeleteCategoryCommand.
// Gọi service để xóa mềm danh mục (đặt IsActive = false).
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Categories.DeleteCategory;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Unit>
{
    private readonly ICategoryService _categoryService;

    public DeleteCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        await _categoryService.DeleteCategoryAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
