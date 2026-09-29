using MediatR;

namespace ProductManagement.Application.Features.Profile;

public record ProfileDto(
    Guid Id,
    string Email,
    string FullName,
    DateTime CreatedAt,
    IList<string> Roles,
    IList<string> Permissions
);

public record UpdateProfileCommand(
    string FullName,
    string? CurrentPassword = null,
    string? NewPassword = null
) : IRequest<bool>;

public record GetProfileQuery() : IRequest<ProfileDto>;