using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Profile;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ProfileDto>
{
    private readonly IProfileService _profileService;
    private readonly ICurrentUserService _currentUserService;

    public GetProfileQueryHandler(IProfileService profileService, ICurrentUserService currentUserService)
    {
        _profileService = profileService;
        _currentUserService = currentUserService;
    }

    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var userId = Guid.Parse(_currentUserService.UserId);
        return await _profileService.GetProfileAsync(userId, cancellationToken);
    }
}
