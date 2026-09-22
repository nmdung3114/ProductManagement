using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Roles.GetPermissions;

public class GetPermissionsQueryHandler : IRequestHandler<GetPermissionsQuery,List<PermissionGroupDto>>{
    private readonly IRoleService _roleService;
    public GetPermissionsQueryHandler(IRoleService roleService){
        _roleService=roleService;
    }
    public async Task<List<PermissionGroupDto>> Handle(GetPermissionsQuery request,CancellationToken cancellationToken){
        return await _roleService.GetGroupPermissionAsync(cancellationToken);
    }
}