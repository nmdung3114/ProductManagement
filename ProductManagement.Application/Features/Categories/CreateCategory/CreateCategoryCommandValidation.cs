// ============================================================
// File: CreateCategoryCommandValidation.cs – Feature: Categories / CreateCategory
// Vai trò: Validator FluentValidation cho CreateCategoryCommand.
// Được gọi tự động bởi ValidationBehavior trong MediatR pipeline.
// Nếu validation thất bại → ném ValidationException → 400 Bad Request.
// ============================================================

using FluentValidation;

namespace ProductManagement.Application.Features.Categories.CreateCategory;

public class CreateCategoryCommandValidation : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidation()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên danh mục không được để trống.")
            .MaximumLength(200).WithMessage("Tên danh mục không được vượt quá 200 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Mô tả không được vượt quá 1000 ký tự.");
    }
}