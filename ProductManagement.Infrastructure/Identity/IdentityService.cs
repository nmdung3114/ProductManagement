using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Constants;
using ProductManagement.Domain.Entities;
using Google.Apis.Auth;


namespace ProductManagement.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtService _jwtService;
    private readonly IAppDbContext _context;
    private readonly IConfiguration _configuration;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        IJwtService jwtService,
        IAppDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtService = jwtService;
        _context = context;
        _configuration = configuration;
    }

    public async Task<RegisterResult> RegisterAsync(string email, string password, string fullName, CancellationToken cancellationToken = default)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, password);

        if (!createResult.Succeeded)
        {
            return new RegisterResult(false, null, createResult.Errors.Select(e => e.Description).ToList());
        }

        var roleResult = await _userManager.AddToRoleAsync(user, Roles.User);
        if (!roleResult.Succeeded)
        {
            return new RegisterResult(false, null, roleResult.Errors.Select(e => e.Description).ToList());
        }
        return new RegisterResult(true, user.Id, Array.Empty<string>());
    }

    public async Task<LoginResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
        }
        var passwordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
        }
        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? Roles.User;

        // 1. Tạo Access Token (JWT)
        var accessToken = await _jwtService.GenerateTokenAsync(user.Id.ToString(), user.Email!, mainRole, cancellationToken);
        var expirationMinutes = double.Parse(_configuration["Jwt:ExpirationInMinutes"] ?? "15");
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        // 2. Tạo Refresh Token và lưu vào Database
        var refreshTokenExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpirationInDays"] ?? "7");
        var refreshTokenStr = _jwtService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(user.Id, user.Email!, user.FullName, roles);
        return new LoginResult(true, accessToken, refreshTokenStr, expiresAt, userDto, Array.Empty<string>());
    }

        public async Task<LoginResult> LoginWithGoogleAsync(string idToken, CancellationToken cancellationToken = default)
    {
        // 1. Xác thực Google ID Token với Google Public Keys
        var googleClientId = _configuration["Google:ClientId"];
        GoogleJsonWebSignature.Payload payload;

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException("Google Token không hợp lệ hoặc đã hết hạn: " + ex.Message);
        }

        // 2. Kiểm tra xem Email đã có tài khoản trong hệ thống chưa
        var user = await _userManager.FindByEmailAsync(payload.Email);

        if (user == null)
        {
            // Nếu chưa có, tự động tạo tài khoản mới cho người dùng
            user = new ApplicationUser
            {
                UserName = payload.Email,
                Email = payload.Email,
                FullName = payload.Name ?? payload.Email,
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Không thể tạo tài khoản từ Google: {errors}");
            }

            // Gán quyền mặc định là User
            await _userManager.AddToRoleAsync(user, Roles.User);
        }
        else if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa.");
        }

        // 3. Tạo AccessToken và RefreshToken của hệ sinh thái nội bộ
        var roles = await _userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? Roles.User;

        var accessToken = await _jwtService.GenerateTokenAsync(user.Id.ToString(), user.Email!, mainRole, cancellationToken);
        var expirationMinutes = double.Parse(_configuration["Jwt:ExpirationInMinutes"] ?? "15");
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var refreshTokenExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpirationInDays"] ?? "7");
        var refreshTokenStr = _jwtService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(user.Id, user.Email!, user.FullName, roles);
        return new LoginResult(true, accessToken, refreshTokenStr, expiresAt, userDto, Array.Empty<string>());
    }


    public async Task<LoginResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        // 1. Tìm Refresh Token trong Database
        var existingToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);

        if (existingToken == null)
        {
            throw new UnauthorizedAccessException("Refresh token không tồn tại.");
        }

        // 2. Phát hiện tái sử dụng Token bị thu hồi (Token Reuse Detection)
        if (existingToken.IsRevoked)
        {
            // Token này đã bị thu hồi nhưng vẫn được gửi lên -> Nghi vấn có hành vi đánh cắp token!
            // Biện pháp an toàn: Thu hồi toàn bộ các Refresh Token của User này
            var allUserTokens = await _context.RefreshTokens
                .Where(r => r.UserId == existingToken.UserId && r.RevokedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var t in allUserTokens)
            {
                t.RevokedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync(cancellationToken);

            throw new UnauthorizedAccessException("Phát hiện token không an toàn hoặc đã bị thu hồi. Vui lòng đăng nhập lại.");
        }

        if (existingToken.IsExpired)
        {
            throw new UnauthorizedAccessException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // 3. Tìm thông tin User sở hữu token
        var user = await _userManager.FindByIdAsync(existingToken.UserId.ToString());
        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Tài khoản người dùng không hợp lệ hoặc đã bị khóa.");
        }

        // 4. Cơ chế TOKEN ROTATION: Đánh dấu thu hồi token cũ, sinh token mới
        var roles = await _userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? Roles.User;

        var newAccessToken = await _jwtService.GenerateTokenAsync(user.Id.ToString(), user.Email!, mainRole, cancellationToken);
        var expirationMinutes = double.Parse(_configuration["Jwt:ExpirationInMinutes"] ?? "15");
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var newRefreshTokenStr = _jwtService.GenerateRefreshToken();
        var refreshTokenExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpirationInDays"] ?? "7");

        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.ReplaceByToken = newRefreshTokenStr;

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(newRefreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(user.Id, user.Email!, user.FullName, roles);
        return new LoginResult(true, newAccessToken, newRefreshTokenStr, expiresAt, userDto, Array.Empty<string>());
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);// tìm Refresh Token trong DB

        if (token == null || !token.IsActive)
        {
            return false;
        }// nếu không tìm thấy hoặc token đã bị thu hồi -> false

        token.RevokedAt = DateTime.UtcNow; // đánh dấu thu hồi
        await _context.SaveChangesAsync(cancellationToken); // lưu vào DB
        return true; // trả về true
    }

    public async Task<Dictionary<Guid, (string FullName, string Email)>> GetUsersSummaryAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken = default)
    {
        var distinctIds = userIds.Distinct().ToList();
        var users = await _userManager.Users
            .AsNoTracking()
            .Where(u => distinctIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FullName, u.Email })
            .ToListAsync(cancellationToken);

        return users.ToDictionary(u => u.Id, u => (u.FullName, u.Email ?? ""));
    }

    public async Task<(string FullName, string Email)?> GetUserSummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.FullName, u.Email })
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null) return null;
        return (user.FullName, user.Email ?? "");
    }

    public async Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _userManager.Users.CountAsync(cancellationToken);
    }
}
