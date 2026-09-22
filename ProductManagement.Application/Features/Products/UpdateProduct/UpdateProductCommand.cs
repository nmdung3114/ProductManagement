// ============================================================
// File: UpdateProductCommand.cs – Feature: Products / UpdateProduct
// Vai trò: Command cập nhật thông tin sản phẩm. Chỉ Admin.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Products.UpdateProduct;

/// <summary>Command cập nhật sản phẩm – chỉ Admin.</summary>
public record UpdateProductCommand(
    Guid Id,
    string Name,
    string SKU,
    string? Description,
    decimal Price,
    int Stock,
    Guid CategoryId) : IRequest<Unit>;
