using MediatR;

namespace ProductManagement.Application.Features.Roles.DeleteRole;

public record DeleteRoleCommand(Guid RoleId) : IRequest;