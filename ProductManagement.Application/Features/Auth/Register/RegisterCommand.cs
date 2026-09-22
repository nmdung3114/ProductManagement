using MediatR;
namespace ProductManagement.Application.Features.Auth.Register;
public record RegisterCommand(
    string FullName,
    string Email,
    string Password) : IRequest<Guid>;