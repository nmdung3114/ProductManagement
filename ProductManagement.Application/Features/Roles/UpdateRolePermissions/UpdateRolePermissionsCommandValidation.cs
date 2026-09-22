using FluentValidation;
using MediatR;

namespace ProductManagement.Application.Features.Roles.UpdateRolePermissions;

public class UpdateRolePermissionsCommandValidation : AbstractValidator<UpdateRolePermissionsCommand>{
    public UpdateRolePermissionsCommandValidation(){
        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("ID của role không được để trống");
        RuleFor(x => x.PermissionIds)
            .NotNull().WithMessage("Danh sách Permission không được để trống");
    }
}