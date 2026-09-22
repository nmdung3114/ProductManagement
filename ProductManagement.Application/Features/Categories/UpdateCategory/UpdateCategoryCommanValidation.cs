// ============================================================
// File: UpdateCategoryCommandValidation.cs – Feature: Categories / UpdateCategory
// Vai trò: Validator FluentValidation cho UpdateCategoryCommand.
// ============================================================

using FluentValidation;

namespace ProductManagement.Application.Features.Categories.UpdateCategory;

public class UpdateCategoryCommandValidation : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidation()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id danh mục không hợp lệ.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên danh mục không được để trống.")
            .MaximumLength(200).WithMessage("Tên danh mục không được vượt quá 200 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Mô tả không được vượt quá 1000 ký tự.");
    }
}