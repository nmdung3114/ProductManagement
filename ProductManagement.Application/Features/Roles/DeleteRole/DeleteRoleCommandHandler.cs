using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Roles.DeleteRole;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand>{
    private readonly IRoleService _roleService;
    public DeleteRoleCommandHandler(IRoleService roleService){
        _roleService=roleService;
    }
    public async Task Handle(DeleteRoleCommand request,CancellationToken cancellationToken){
        await _roleService.DeleteRoleAsync(request.RoleId,cancellationToken);
    }
}