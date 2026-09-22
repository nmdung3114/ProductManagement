using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Interceptor tự động ghi lại lịch sử thay đổi (audit log) cho mọi entity khi SaveChanges.
/// Đây là Singleton service nên phải inject IHttpContextAccessor (Singleton-safe) thay vì ICurrentUserService (Scoped).
/// </summary>
public class AuditLogSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogSaveChangesInterceptor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is null)
            return base.SavingChangesAsync(eventData, result, cancellationToken);

        var dbContext = eventData.Context;

        // Lấy tất cả entries có thay đổi, bỏ qua AuditLog để tránh vòng lặp vô hạn
        var entries = dbContext.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog &&
                        (e.State == EntityState.Added ||
                         e.State == EntityState.Modified ||
                         e.State == EntityState.Deleted))
            .ToList();

        if (entries.Count == 0)
            return base.SavingChangesAsync(eventData, result, cancellationToken);

        // Lấy thông tin người dùng từ HttpContext (an toàn: có thể null khi gọi từ seeder)
        var user = _httpContextAccessor.HttpContext?.User;
        var currentUserId = user?.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserName = user?.FindFirstValue(ClaimTypes.Email);

        foreach (var entry in entries)
        {
            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            var entityName = entry.Entity.GetType().Name;
            var action = entry.State.ToString().ToUpper(); // "ADDED", "MODIFIED", "DELETED"
            string? entityId = null;

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary) continue;

                var propertyName = property.Metadata.Name;

                if (property.Metadata.IsPrimaryKey())
                {
                    entityId = property.CurrentValue?.ToString();
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        newValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        oldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            oldValues[propertyName] = property.OriginalValue;
                            newValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = currentUserId,
                UserName = currentUserName,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                OldValues = oldValues.Count > 0 ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues.Count > 0 ? JsonSerializer.Serialize(newValues) : null,
                Timestamp = DateTime.UtcNow
            };

            dbContext.Set<AuditLog>().Add(auditLog);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
