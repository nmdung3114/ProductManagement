// ============================================================
// File: UpdateProductCommandValidation.cs – Feature: Products / UpdateProduct
// Vai trò: Validator cho UpdateProductCommand.
// ============================================================

using FluentValidation;

namespace ProductManagement.Application.Features.Products.UpdateProduct;

public class UpdateProductCommandValidation : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidation()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id sản phẩm không hợp lệ.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống.")
            .MaximumLength(200).WithMessage("Tên sản phẩm không được vượt quá 200 ký tự.");

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU không được để trống.")
            .MaximumLength(50).WithMessage("SKU không được vượt quá 50 ký tự.")
            .Matches(@"^[A-Za-z0-9\-_]+$").WithMessage("SKU chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Giá không được âm.");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Tồn kho không được âm.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Danh mục không được để trống.");
    }
}
