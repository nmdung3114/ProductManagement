namespace ProductManagement.Application.Common.Interfaces;

/// <summary>
/// Cung cấp thông tin về người dùng hiện đang thực hiện request.
/// Được inject vào Application handlers để thực hiện Data Scoping theo Role.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>UserId dạng string từ JWT claim (NameIdentifier / sub).</summary>
    string? UserId { get; }

    /// <summary>UserId dạng Guid – null nếu chưa đăng nhập hoặc parse lỗi.</summary>
    Guid? UserIdGuid { get; }

    /// <summary>Email người dùng.</summary>
    string? UserName { get; }

    /// <summary>Danh sách Roles hiện tại của người dùng (từ JWT claims).</summary>
    IReadOnlyList<string> Roles { get; }

    /// <summary>Kiểm tra người dùng có thuộc role cụ thể không.</summary>
    bool IsInRole(string roleName);

    /// <summary>Kiểm tra người dùng có thuộc ít nhất một trong các role cho trước không.</summary>
    bool IsInAnyRole(params string[] roleNames);
}