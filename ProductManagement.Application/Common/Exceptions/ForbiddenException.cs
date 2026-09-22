// ============================================================
// File: ForbiddenException.cs – Tầng Application / Common / Exceptions
// Vai trò: Exception tùy chỉnh được ném khi người dùng đã xác thực
// nhưng không có quyền thực hiện thao tác (403 Forbidden).
// Ví dụ: User cố xem đơn hàng của người khác.
// ============================================================

namespace ProductManagement.Application.Common.Exceptions;

/// <summary>
/// Ném khi người dùng không có quyền thực hiện thao tác.
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Bạn không có quyền thực hiện thao tác này.")
        : base(message)
    {
    }
}
