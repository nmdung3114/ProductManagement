using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Auth.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, LoginResult>
{
    private readonly IIdentityService _identityService;

    public GoogleLoginCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<LoginResult> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.LoginWithGoogleAsync(request.IdToken, cancellationToken);
    }
}
