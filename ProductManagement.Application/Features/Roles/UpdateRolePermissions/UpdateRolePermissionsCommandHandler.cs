using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Roles.UpdateRolePermissions;

public class UpdateRolePermissionsCommandHandler : IRequestHandler<UpdateRolePermissionsCommand>{
    private readonly IRoleService _roleService;
    public UpdateRolePermissionsCommandHandler(IRoleService roleService){
        _roleService=roleService;
    }
    public async Task Handle(UpdateRolePermissionsCommand request,CancellationToken cancellationToken){
        await _roleService.UpdateRolePermissionAsync(request.RoleId,request.PermissionIds,cancellationToken);
    }
}