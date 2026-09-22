using MediatR;

namespace ProductManagement.Application.Features.Roles.CreateRole;

public record CreateRoleCommand(
    string Name,
    string? Description)
    :IRequest<Guid>;