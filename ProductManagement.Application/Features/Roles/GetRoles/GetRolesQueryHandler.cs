using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Roles.GetRoles;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery,List<RoleDto>>{
    private readonly IRoleService _roleService;
    public GetRolesQueryHandler(IRoleService roleService){
        _roleService=roleService;
    }
    public async Task<List<RoleDto>> Handle(GetRolesQuery request,CancellationToken cancellationToken){
        return await _roleService.GetRolesAsync(cancellationToken);
    }
}