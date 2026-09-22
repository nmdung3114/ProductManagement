using FluentValidation;

namespace ProductManagement.Application.Features.Roles.CreateRole;

public class CreateRoleCommandValidation : AbstractValidator<CreateRoleCommand>{
    public CreateRoleCommandValidation(){
        RuleFor(x => x.Name)
        .NotEmpty().WithMessage("Tên role không được để trống")
        .MaximumLength(50).WithMessage("Tên role không được vượt quá 50 ký tự");
        RuleFor(x => x.Description)
        .MaximumLength(200).WithMessage("Mô tả không được vượt quá 200 ký tự");
        
    }
}
