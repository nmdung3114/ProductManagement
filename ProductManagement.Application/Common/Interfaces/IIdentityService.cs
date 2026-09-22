namespace ProductManagement.Application.Common.Interfaces;

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    IList<string> Roles);

public interface IIdentityService
{
    Task<RegisterResult> RegisterAsync(string email, string password, string fullName, CancellationToken cancellationToken=default);
    Task<LoginResult> LoginAsync(string email, string password, CancellationToken cancellationToken=default);
    Task<Dictionary<Guid, (string FullName, string Email)>> GetUsersSummaryAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken = default);
    Task<(string FullName, string Email)?> GetUserSummaryAsync(Guid userId, CancellationToken cancellationToken = default);
}

public record RegisterResult(
    bool Succeeded,
    Guid? UserId,
    IReadOnlyList<string> Errors);   

public record LoginResult(
    bool Succeeded,
    string AccessToken,
    DateTime ExpiresAt,
    UserDto? User,
    IReadOnlyList<string> Errors);