// ============================================================
// File: BadRequestException.cs – Tầng Application / Common / Exceptions
// Vai trò: Exception tùy chỉnh ném khi yêu cầu không hợp lệ (400 Bad Request).
// Được bắt tại GlobalExceptionHandlerMiddleware.
// ============================================================

namespace ProductManagement.Application.Common.Exceptions;

public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
