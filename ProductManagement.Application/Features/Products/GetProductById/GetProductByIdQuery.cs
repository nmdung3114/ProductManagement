// ============================================================
// File: GetProductByIdQuery.cs – Feature: Products / GetProductById
// Vai trò: Query lấy chi tiết một sản phẩm theo Id.
// Handler trả về DTO khác nhau theo Role của người dùng.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Products.GetProductById;

/// <summary>Query lấy chi tiết sản phẩm theo Id.</summary>
public record GetProductByIdQuery(Guid Id) : IRequest<object>;

// ============================================================
// DTOs phân tầng
// ============================================================

/// <summary>
/// DTO chi tiết sản phẩm dành cho Admin & InventoryManager.
/// Bao gồm tất cả trường nội bộ: SKU, tồn kho chính xác, IsActive, timestamps.
/// </summary>
public record ProductDetailAdminDto(
    Guid Id,
    string Name,
    string SKU,
    string? Description,
    decimal Price,
    int Stock,
    bool IsActive,
    Guid CategoryId,
    string CategoryName,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

/// <summary>
/// DTO chi tiết sản phẩm dành cho SalesStaff, Auditor, Customer.
/// Chỉ bao gồm thông tin công khai: không có SKU nội bộ, không lộ tồn kho số.
/// </summary>
public record ProductDetailPublicDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    string CategoryName,
    bool InStock);
