using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Constants;

namespace ProductManagement.Application.Features.Auth.Register;
public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Guid>
{
    private readonly IIdentityService _identityService;

    public RegisterCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<Guid> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RegisterAsync(request.Email, request.Password, request.FullName, cancellationToken);
        if(!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors));
        }
        return result.UserId.Value;
    }
}