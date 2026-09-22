using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Roles.CreateRole;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand,Guid>{
    private readonly IRoleService _roleService;
    public CreateRoleCommandHandler(IRoleService roleService){
        _roleService=roleService;
    }
    public async Task<Guid> Handle(CreateRoleCommand request,CancellationToken cancellationToken){
        return await _roleService.CreateRoleAsync(request.Name,request.Description,cancellationToken);
    }
}

