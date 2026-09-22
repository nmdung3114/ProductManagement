

using System.Text.Json;
using FluentValidation;
using ProductManagement.Application.Common.Exceptions;

namespace ProductManagement.Api.Middlewares;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        switch (exception)
        {
            // 400 – Dữ liệu không hợp lệ (FluentValidation / BadRequest / Domain Exceptions)
            case BadRequestException:
            case InvalidOperationException:
            case ArgumentException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                return context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = exception.Message
                });

            case ValidationException validationEx:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                var errors = validationEx.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => char.ToLowerInvariant(g.Key[0]) + g.Key[1..],
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );
                return context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Dữ liệu không hợp lệ.",
                    errors
                });

            // 401 – Chưa xác thực
            case UnauthorizedAccessException:
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = exception.Message
                });

            // 403 – Không có quyền
            case ForbiddenException:
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = exception.Message
                });

            // 404 – Không tìm thấy
            case NotFoundException:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = exception.Message
                });

            // 500 – Lỗi hệ thống
            default:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                return context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
                });
        }
    }
}
