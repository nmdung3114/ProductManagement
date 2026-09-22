using MediatR;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Roles.GetRoleById;

public record GetRoleByIdQuery(Guid RoleId) : IRequest<RoleDto>;