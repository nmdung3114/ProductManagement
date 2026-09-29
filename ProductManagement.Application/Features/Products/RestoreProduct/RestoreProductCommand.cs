using MediatR;

namespace ProductManagement.Application.Features.Products.RestoreProduct;

/// <summary>Command khôi phục sản phẩm – chỉ Admin/Quản lý có quyền Sửa.</summary>
public record RestoreProductCommand(Guid Id) : IRequest<Unit>;
