// ============================================================
// File: UpdateCategoryCommand.cs – Feature: Categories / UpdateCategory
// Vai trò: Command cập nhật thông tin danh mục.
// Chỉ Admin mới được gọi endpoint này.
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Categories.UpdateCategory;

/// <summary>Command cập nhật danh mục – chỉ Admin.</summary>
public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? Description) : IRequest<Unit>;