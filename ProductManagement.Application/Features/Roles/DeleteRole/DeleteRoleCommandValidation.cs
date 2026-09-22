using FluentValidation;

namespace ProductManagement.Application.Features.Roles.DeleteRole;

public class DeleteRoleCommandValidation : AbstractValidator<DeleteRoleCommand>{
    public DeleteRoleCommandValidation(){
        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("ID của role không được để trống");
    }
}
    