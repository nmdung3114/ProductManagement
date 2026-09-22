// ============================================================
// File: IAppDbContext.cs – Tầng Application / Common / Interfaces
// Vai trò: Interface abstraction cho AppDbContext.
// Tuân theo Dependency Inversion Principle – tầng Application
// không được phụ thuộc vào Infrastructure (EF Core).
// Các Handlers trong Application layer dùng interface này,
// Infrastructure sẽ implement qua AppDbContext.
// ============================================================

using Microsoft.EntityFrameworkCore;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
