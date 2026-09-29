using ProductManagement.Application.Features.Profile;

namespace ProductManagement.Application.Common.Interfaces;

public interface IProfileService
{
    Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task UpdateProfileAsync(Guid userId, string fullName, string? currentPassword, string? newPassword, CancellationToken cancellationToken = default);
}
