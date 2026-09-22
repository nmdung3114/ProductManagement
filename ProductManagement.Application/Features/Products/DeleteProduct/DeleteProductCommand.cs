// ============================================================
// File: DeleteProductCommand.cs – Feature: Products / DeleteProduct
// Vai trò: Command xóa mềm sản phẩm (IsActive = false).
// Chỉ Admin mới được thực hiện.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Products.DeleteProduct;

/// <summary>Command xóa mềm sản phẩm – chỉ Admin.</summary>
public record DeleteProductCommand(Guid Id) : IRequest<Unit>;
