using FluentValidation;
namespace ProductManagement.Application.Features.Auth.RefreshToken;
public class RefreshTokenCommandValidation : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidation()
    {
        RuleFor(r=>r.RefreshToken).NotEmpty();
    }
}