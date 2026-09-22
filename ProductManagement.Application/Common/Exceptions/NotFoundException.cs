// ============================================================
// File: NotFoundException.cs – Tầng Application / Common / Exceptions
// Vai trò: Exception tùy chỉnh được ném khi không tìm thấy
// resource (sản phẩm, danh mục, đơn hàng).
// Được bắt tại GlobalExceptionHandlerMiddleware → trả về 404.
// ============================================================

namespace ProductManagement.Application.Common.Exceptions;

/// <summary>
/// Ném khi một resource được yêu cầu không tồn tại trong hệ thống.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string resourceName, object key)
        : base($"{resourceName} với id '{key}' không tìm thấy.")
    {
    }

    public NotFoundException(string message)
        : base(message)
    {
    }
}
