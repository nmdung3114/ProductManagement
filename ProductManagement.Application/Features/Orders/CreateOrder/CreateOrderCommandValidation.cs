// ============================================================
// File: CreateOrderCommandValidation.cs – Feature: Orders / CreateOrder
// Vai trò: Validator cho CreateOrderCommand.
// Đảm bảo danh sách sản phẩm không rỗng và số lượng hợp lệ.
// ============================================================

using FluentValidation;

namespace ProductManagement.Application.Features.Orders.CreateOrder;

public class CreateOrderCommandValidation : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidation()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId không hợp lệ.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Đơn hàng phải có ít nhất một sản phẩm.")
            .Must(items => items.Select(i => i.ProductId).Distinct().Count() == items.Count)
            .WithMessage("Không được có sản phẩm trùng lặp trong đơn hàng.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("ProductId không hợp lệ.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0.");
        });
    }
}
