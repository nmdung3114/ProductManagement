using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Roles.GetRoleById;

public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, RoleDto>{
    private readonly IRoleService _roleService;
    public GetRoleByIdQueryHandler(IRoleService roleService){
        _roleService=roleService;
    }
    public async Task<RoleDto> Handle(GetRoleByIdQuery request,CancellationToken cancellationToken){
        return await _roleService.GetRoleByIdAsync(request.RoleId,cancellationToken);
    }
}