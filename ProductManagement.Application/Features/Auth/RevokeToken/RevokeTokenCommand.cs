using MediatR;

namespace ProductManagement.Application.Features.Auth.RevokeToken;

public record RevokeTokenCommand(string RefreshToken) : IRequest<bool>;
