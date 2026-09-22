using MediatR;
using ProductManagement.Application.Common.Interfaces;
namespace ProductManagement.Application.Features.Auth.Login;


public record LoginCommand(
    string Email,
    string Password) : IRequest<LoginResult>;