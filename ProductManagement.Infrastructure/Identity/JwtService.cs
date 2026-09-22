// ============================================================
// File: JwtService.cs – Tầng Infrastructure / Identity
// Vai trò: Implement IJwtService – tạo JWT token chứa các claims:
//   - sub (JwtRegisteredClaimNames.Sub): UserId
//   - email: địa chỉ email
//   - ClaimTypes.NameIdentifier: UserId (để Controller dùng FindFirstValue)
//   - ClaimTypes.Role: danh sách roles
//   - jti: unique token id (chống replay attack)
// Token được ký bằng HMAC-SHA256 với secret key từ appsettings.
// ============================================================

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Infrastructure.Identity;

public class JwtService : IJwtService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public JwtService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<string> GenerateTokenAsync(
        string userId,
        string email,
        string role,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Người dùng không tồn tại.");

        var roles = await _userManager.GetRolesAsync(user);

        // Claims được nhúng vào JWT token
        var claims = new List<Claim>
        {
            // Sub và NameIdentifier đều chứa UserId để dễ lấy trong Controller
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // unique token id
        };

        // Thêm tất cả roles vào claims
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var secretKey = _configuration["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("Jwt:SecretKey chưa được cấu hình.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expirationMinutes = double.Parse(_configuration["Jwt:ExpirationInMinutes"] ?? "120");

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}