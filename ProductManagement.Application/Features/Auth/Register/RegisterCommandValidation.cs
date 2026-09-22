using FluentValidation;
namespace ProductManagement.Application.Features.Auth.Register;
public class RegisterCommandValidation : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidation()
    {
        RuleFor(x=>x.Email).NotEmpty().EmailAddress();
        RuleFor(x=>x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x=>x.FullName).NotEmpty().MaximumLength(100);
    }
}