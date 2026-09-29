using MediatR;

namespace ProductManagement.Application.Features.Categories.RestoreCategory;

/// <summary>Command khôi phục danh mục – chỉ Admin/Quản lý có quyền Sửa.</summary>
public record RestoreCategoryCommand(Guid Id) : IRequest<Unit>;
