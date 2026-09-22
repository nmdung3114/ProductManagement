using FluentValidation;
namespace ProductManagement.Application.Features.Auth.Login;

public class LoginCommandValidation : AbstractValidator<LoginCommand>
{
    public LoginCommandValidation()
    {
        RuleFor(x => x.Email).NotEmpty()
                            .WithMessage("Email khong được để trống")
                            .EmailAddress()
                            .WithMessage("Email không đúng định dạng");
        RuleFor(x => x.Password).NotEmpty()
                            .WithMessage("Mật khẩu không được để trống")
                            .MinimumLength(6)
                            .WithMessage("Mật khẩu phải có ít nhất 6 ký tự");
    }
}