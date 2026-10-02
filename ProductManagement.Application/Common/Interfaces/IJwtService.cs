
namespace ProductManagement.Application.Common.Interfaces;
public interface IJwtService
{
    Task<string> GenerateTokenAsync(string userId, string email, string role, CancellationToken cancellationToken=default);
    string GenerateRefreshToken();
}