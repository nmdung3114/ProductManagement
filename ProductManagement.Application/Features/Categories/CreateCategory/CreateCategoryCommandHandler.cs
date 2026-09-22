// ============================================================
// File: CreateCategoryCommandHandler.cs – Feature: Categories / CreateCategory
// Vai trò: Handler xử lý CreateCategoryCommand.
// Nhận command từ MediatR pipeline (sau khi đã qua validation),
// gọi service để tạo danh mục và trả về Id của danh mục mới.
// ============================================================

using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Categories.CreateCategory;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly ICategoryService _categoryService;

    public CreateCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        return await _categoryService.CreateCategoryAsync(
            request.Name,
            request.Description,
            cancellationToken);
    }
}