using MediatR;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Roles.GetRoles;

public record GetRolesQuery : IRequest<List<RoleDto>>;