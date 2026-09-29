using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Profile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, bool>
{
    private readonly IProfileService _profileService;
    private readonly ICurrentUserService _currentUserService;

    public UpdateProfileCommandHandler(IProfileService profileService, ICurrentUserService currentUserService)
    {
        _profileService = profileService;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var userId = Guid.Parse(_currentUserService.UserId);
        await _profileService.UpdateProfileAsync(
            userId,
            request.FullName,
            request.CurrentPassword,
            request.NewPassword,
            cancellationToken);

        return true;
    }
}
