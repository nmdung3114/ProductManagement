using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Constants;
namespace ProductManagement.Application.Features.Auth.Login;
public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult>
{
    public readonly IIdentityService _identityService;
    public LoginCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }
    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.LoginAsync(request.Email, request.Password, cancellationToken);
        
    }
}