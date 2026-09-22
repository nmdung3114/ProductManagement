using MediatR;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.Roles.GetPermissions;

public record GetPermissionsQuery : IRequest<List<PermissionGroupDto>>;