using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Auth.GoogleLogin;

public record GoogleLoginCommand(string IdToken): IRequest<LoginResult>;