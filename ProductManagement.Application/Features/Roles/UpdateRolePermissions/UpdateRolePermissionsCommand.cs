using MediatR;

namespace ProductManagement.Application.Features.Roles.UpdateRolePermissions;

public record UpdateRolePermissionsCommand(
    Guid RoleId,
    List<Guid> PermissionIds
) :IRequest;
