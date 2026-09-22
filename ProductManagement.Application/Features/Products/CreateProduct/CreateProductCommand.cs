// ============================================================
// File: CreateProductCommand.cs – Feature: Products / CreateProduct
// Vai trò: Command tạo sản phẩm mới. Chỉ Admin mới được gọi.
// Được validate bởi CreateProductCommandValidation.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Products.CreateProduct;

/// <summary>Command tạo sản phẩm mới – chỉ Admin.</summary>
public record CreateProductCommand(
    string Name,
    string SKU,
    string? Description,
    decimal Price,
    int Stock,
    Guid CategoryId) : IRequest<Guid>;
