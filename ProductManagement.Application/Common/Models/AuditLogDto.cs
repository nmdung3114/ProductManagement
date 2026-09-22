namespace ProductManagement.Application.Common.Models;
public record AuditLogDto(
    Guid Id,
    string? UserId,
    string? UserName,
    string Action,
    string EntityName,
    string? EntityId,
    string? OldValues,
    string? NewValues,
    DateTime Timestamp);