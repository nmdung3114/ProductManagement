// ============================================================
// File: DeleteCategoryCommand.cs – Feature: Categories / DeleteCategory
// Vai trò: Command xóa mềm danh mục (IsActive = false).
// Chỉ Admin mới được thực hiện. Không xóa vật lý khỏi DB.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Categories.DeleteCategory;

/// <summary>Command xóa mềm danh mục – chỉ Admin.</summary>
public record DeleteCategoryCommand(Guid Id) : IRequest<Unit>;
