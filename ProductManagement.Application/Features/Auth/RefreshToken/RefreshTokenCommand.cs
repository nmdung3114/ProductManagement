using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Auth.RefreshToken;
public record RefreshTokenCommand(string RefreshToken) :IRequest<LoginResult>;

